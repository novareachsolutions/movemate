import { Injectable } from "@nestjs/common";

import { SupportTicket } from "../../entity/SupportTicket";
import { TicketActivity } from "../../entity/TicketActivity";
import { User } from "../../entity/User";
import { dbRepo } from "../database/database.service";
import { TicketStatusEnum } from "./types/support.types";

@Injectable()
export class ActivityService {
  async logStatusChange(
    ticket: SupportTicket,
    performer: User,
    oldStatus: TicketStatusEnum,
    newStatus: TicketStatusEnum,
  ): Promise<TicketActivity> {
    return await this.createActivity(ticket, performer, "status_changed", {
      from: oldStatus,
      to: newStatus,
      timestamp: new Date(),
    });
  }

  async logAgentAssignment(
    ticket: SupportTicket,
    performer: User,
    oldAgentId: number | null,
    newAgentId: number,
  ): Promise<TicketActivity> {
    return await this.createActivity(ticket, performer, "agent_assigned", {
      from: oldAgentId,
      to: newAgentId,
      timestamp: new Date(),
    });
  }

  async logPriorityChange(
    ticket: SupportTicket,
    performer: User,
    oldPriority: string,
    newPriority: string,
  ): Promise<TicketActivity> {
    return await this.createActivity(ticket, performer, "priority_changed", {
      from: oldPriority,
      to: newPriority,
      timestamp: new Date(),
    });
  }

  async logNoteAdded(
    ticket: SupportTicket,
    performer: User,
    noteId: number,
    isInternal: boolean,
  ): Promise<TicketActivity> {
    return await this.createActivity(ticket, performer, "note_added", {
      noteId,
      isInternal,
      timestamp: new Date(),
    });
  }

  async logTicketResolved(
    ticket: SupportTicket,
    performer: User,
    resolution: string,
  ): Promise<TicketActivity> {
    return await this.createActivity(ticket, performer, "ticket_resolved", {
      resolution,
      timestamp: new Date(),
      timeToResolve: ticket.resolvedAt.getTime() - ticket.createdAt.getTime(),
    });
  }

  async getTicketTimeline(ticketId: number): Promise<TicketActivity[]> {
    return await dbRepo(TicketActivity)
      .createQueryBuilder("activity")
      .leftJoinAndSelect("activity.performer", "performer")
      .where("activity.ticketId = :ticketId", { ticketId })
      .orderBy("activity.createdAt", "DESC")
      .getMany();
  }

  private async createActivity(
    ticket: SupportTicket,
    performer: User,
    action: string,
    details: Record<string, any>,
  ): Promise<TicketActivity> {
    const activity = new TicketActivity();
    activity.ticket = ticket;
    activity.performer = performer;
    activity.action = action;
    activity.details = details;

    return await dbRepo(TicketActivity).save(activity);
  }
}
