import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { ChatMessage } from "../../entity/ChatMessage";
import { SupportTicket } from "../../entity/SupportTicket";
import { TicketActivity } from "../../entity/TicketActivity";
import { TicketNote } from "../../entity/TicketNote";
import { User } from "../../entity/User";
import { UserRoleEnum } from "../../shared/enums";
import { dbRepo } from "../database/database.service";
import { NotificationService } from "./notification.service";
import {
  AddMessageDto,
  AddNoteDto,
  AssignTicketDto,
  CreateTicketDto,
} from "./support.dto";
import { TicketPriorityEnum, TicketStatusEnum } from "./types/support.types";

@Injectable()
export class SupportService {
  constructor(private readonly notificationService: NotificationService) {}

  async createTicket(input: CreateTicketDto): Promise<SupportTicket> {
    const ticket = new SupportTicket();
    ticket.subject = input.subject;
    ticket.category = input.category;
    ticket.priority = input.priority || TicketPriorityEnum.MEDIUM;
    ticket.status = TicketStatusEnum.OPEN;
    ticket.customer = { id: input.customerId } as User;
    ticket.ticketNumber = await this.generateTicketNumber();

    const savedTicket = await dbRepo(SupportTicket).save(ticket);

    // Create initial message
    if (input.initialMessage) {
      const message = new ChatMessage();
      message.ticket = savedTicket;
      message.content = input.initialMessage;
      message.sender = { id: input.customerId } as User;
      await dbRepo(ChatMessage).save(message);
    }

    return savedTicket;
  }

  async addMessage(
    input: AddMessageDto & { ticketId: number },
  ): Promise<ChatMessage> {
    const ticket = await this.getTicketDetails(input.ticketId);

    const message = new ChatMessage();
    message.ticket = ticket;
    message.content = input.content;
    message.type = input.type;
    message.sender = { id: input.senderId } as User;
    message.metadata = input.metadata;

    return await dbRepo(ChatMessage).save(message);
  }

  // Updated method to assign a rider
  async assignRider(ticketId: number, riderId: number): Promise<SupportTicket> {
    const ticket = await this.getTicketDetails(ticketId);
    // Corrected the findOne method to findOneBy with a where clause
    const rider = await dbRepo(User).findOneBy({ id: riderId });

    if (!rider || rider.role !== UserRoleEnum.AGENT) {
      throw new BadRequestException("Invalid rider assigned. Must be a rider.");
    }

    const oldRiderId = ticket.assignedRiderId;

    ticket.assignedRider = rider;
    const updatedTicket = await dbRepo(SupportTicket).save(ticket);

    await this.logActivity(ticket, {
      action: "rider_assigned",
      details: { from: oldRiderId, to: riderId },
      performerId: riderId,
    });

    this.notificationService.notifyRiderAssigned(updatedTicket);

    return updatedTicket;
  }

  // Updated method to assign support agents
  async assignSupportAgent(
    ticketId: number,
    agentId: number,
  ): Promise<SupportTicket> {
    const ticket = await this.getTicketDetails(ticketId);
    // Corrected the findOne method to findOneBy with a where clause
    const agent = await dbRepo(User).findOneBy({ id: agentId });

    if (!agent || agent.role !== UserRoleEnum.SUPPORT) {
      throw new BadRequestException("Invalid support agent assigned.");
    }

    const oldAgentId = ticket.assignedSupportAgentId;

    ticket.assignedSupportAgent = agent;
    const updatedTicket = await dbRepo(SupportTicket).save(ticket);

    await this.logActivity(ticket, {
      action: "SUPPORT_assigned",
      details: { from: oldAgentId, to: agentId },
      performerId: agentId,
    });

    this.notificationService.notifySupportAgentAssigned(updatedTicket);

    return updatedTicket;
  }

  // Modified assignTicket method to handle both rider and support agent assignments
  assignTicket(
    ticketId: number,
    assignDto: AssignTicketDto,
  ): Promise<SupportTicket> {
    if (assignDto.role === UserRoleEnum.AGENT) {
      return this.assignRider(ticketId, assignDto.userId);
    } else if (assignDto.role === UserRoleEnum.SUPPORT) {
      return this.assignSupportAgent(ticketId, assignDto.userId);
    } else {
      throw new BadRequestException("Invalid role for assignment.");
    }
  }

  async getTickets(query: any): Promise<{
    tickets: SupportTicket[];
    total: number;
  }> {
    const qb = dbRepo(SupportTicket)
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.customer", "customer")
      .leftJoinAndSelect("ticket.assignedRider", "rider")
      .leftJoinAndSelect("ticket.assignedSupportAgent", "supportAgent");

    if (query.status) {
      qb.andWhere("ticket.status = :status", { status: query.status });
    }

    if (query.priority) {
      qb.andWhere("ticket.priority = :priority", { priority: query.priority });
    }

    if (query.riderId) {
      qb.andWhere("ticket.assignedRiderId = :riderId", {
        riderId: query.riderId,
      });
    }

    if (query.supportAgentId) {
      qb.andWhere("ticket.assignedSupportAgentId = :supportAgentId", {
        supportAgentId: query.supportAgentId,
      });
    }

    const [tickets, total] = await qb
      .skip(query.skip)
      .take(query.take)
      .getManyAndCount();

    return { tickets, total };
  }

  async getTicketDetails(ticketId: number): Promise<SupportTicket> {
    const ticket = await dbRepo(SupportTicket).findOne({
      where: { id: ticketId },
      relations: [
        "customer",
        "assignedRider",
        "assignedSupportAgent",
        "messages",
      ],
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    return ticket;
  }

  async updateTicketStatus(
    ticketId: number,
    status: TicketStatusEnum,
  ): Promise<SupportTicket> {
    const ticket = await this.getTicketDetails(ticketId);
    const oldStatus = ticket.status;

    ticket.status = status;
    if (status === TicketStatusEnum.RESOLVED) {
      ticket.resolvedAt = new Date();
    }

    const updatedTicket = await dbRepo(SupportTicket).save(ticket);

    await this.logActivity(ticket, {
      action: "status_changed",
      details: {
        from: oldStatus,
        to: status,
      },
      performerId: ticket.assignedSupportAgentId || ticket.assignedRiderId,
    });

    this.notificationService.notifyTicketStatusChanged(updatedTicket);

    return updatedTicket;
  }

  async getMessages(ticketId: number): Promise<ChatMessage[]> {
    const ticket = await this.getTicketDetails(ticketId);

    if (!ticket) {
      throw new InternalServerErrorException("Ticket invalid");
    }

    const messages = await dbRepo(ChatMessage)
      .createQueryBuilder("message")
      .where("message.ticketId = :ticketId", { ticketId })
      .orderBy("message.createdAt", "ASC")
      .getMany();

    return messages;
  }

  async addNote(input: AddNoteDto): Promise<TicketNote> {
    const ticket = await this.getTicketDetails(input.ticketId);

    const note = new TicketNote();
    note.ticket = ticket;
    note.author = { id: input.authorId } as User;
    note.content = input.content;
    note.isInternal = input.isInternal;

    return await dbRepo(TicketNote).save(note);
  }

  async getAgentTickets(
    agentId: number,
    role: UserRoleEnum,
    status?: TicketStatusEnum[],
  ): Promise<SupportTicket[]> {
    const qb = dbRepo(SupportTicket)
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.customer", "customer")
      .leftJoinAndSelect("ticket.assignedRider", "rider")
      .leftJoinAndSelect("ticket.assignedSupportAgent", "supportAgent");

    if (role === UserRoleEnum.AGENT) {
      qb.where("ticket.assignedRiderId = :agentId", { agentId });
    } else if (role === UserRoleEnum.SUPPORT) {
      qb.where("ticket.assignedSupportAgentId = :agentId", { agentId });
    }

    if (status && status.length > 0) {
      qb.andWhere("ticket.status IN (:...status)", { status });
    }

    return await qb
      .orderBy("ticket.priority", "DESC")
      .addOrderBy("ticket.createdAt", "ASC")
      .getMany();
  }

  async getCustomerTickets(customerId: number): Promise<SupportTicket[]> {
    return await dbRepo(SupportTicket)
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.assignedRider", "rider")
      .leftJoinAndSelect("ticket.assignedSupportAgent", "supportAgent")
      .where("ticket.customerId = :customerId", { customerId })
      .orderBy("ticket.createdAt", "DESC")
      .getMany();
  }

  async searchTickets(query: string): Promise<SupportTicket[]> {
    return await dbRepo(SupportTicket)
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.customer", "customer")
      .leftJoinAndSelect("ticket.assignedRider", "rider")
      .leftJoinAndSelect("ticket.assignedSupportAgent", "supportAgent")
      .where("ticket.ticketNumber ILIKE :query", { query: `%${query}%` })
      .orWhere("ticket.subject ILIKE :query", { query: `%${query}%` })
      .orWhere("customer.email ILIKE :query", { query: `%${query}%` })
      .orderBy("ticket.updatedAt", "DESC")
      .getMany();
  }

  async getTicketMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number;
    ticketsByPriority: Record<TicketPriorityEnum, number>;
    ticketsByStatus: Record<TicketStatusEnum, number>;
  }> {
    const tickets = await dbRepo(SupportTicket)
      .createQueryBuilder("ticket")
      .where("ticket.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .getMany();

    const resolvedTickets = tickets.filter(
      (t) => t.status === TicketStatusEnum.RESOLVED,
    );

    const resolutionTimes = resolvedTickets.map(
      (t) => t.resolvedAt.getTime() - t.createdAt.getTime(),
    );

    const averageResolutionTime =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;

    const ticketsByPriority = tickets.reduce(
      (acc, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
        return acc;
      },
      {} as Record<TicketPriorityEnum, number>,
    );

    const ticketsByStatus = tickets.reduce(
      (acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      },
      {} as Record<TicketStatusEnum, number>,
    );

    return {
      totalTickets: tickets.length,
      resolvedTickets: resolvedTickets.length,
      averageResolutionTime,
      ticketsByPriority,
      ticketsByStatus,
    };
  }

  private async logActivity(
    ticket: SupportTicket,
    data: { action: string; details?: any; performerId: number },
  ): Promise<void> {
    const activity = new TicketActivity();
    activity.ticket = ticket;
    activity.action = data.action;
    activity.details = data.details;
    activity.performerId = data.performerId;
    await dbRepo(TicketActivity).save(activity);
  }

  private async generateTicketNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    // Get count of tickets for current month
    const count = await dbRepo(SupportTicket)
      .createQueryBuilder("ticket")
      .where('EXTRACT(YEAR FROM "createdAt") = :year', { year })
      .andWhere('EXTRACT(MONTH FROM "createdAt") = :month', {
        month: today.getMonth() + 1,
      })
      .getCount();

    // Format: TICK-YYYYMM-XXXX (e.g., TICK-202403-0001)
    return `TICK-${year}${month}-${String(count + 1).padStart(4, "0")}`;
  }
}
