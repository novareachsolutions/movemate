import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { ChatMessage } from "../../entity/ChatMessage";
import { SupportTicket } from "../../entity/SupportTicket";
import { TicketNote } from "../../entity/TicketNote";
import { IApiResponse } from "../../shared/interface";
import {
  AddMessageDto,
  AddNoteDto,
  AssignTicketDto,
  CreateTicketDto,
  GetTicketsDto,
  UpdateTicketStatusDto,
} from "./support.dto";
import { SupportService } from "./support.service";

@Controller("support")
export class SupportController {
  private readonly logger = new Logger(SupportController.name);

  constructor(private readonly ticketService: SupportService) {}

  @Post("ticket")
  async createTicket(
    @Body() input: CreateTicketDto,
  ): Promise<IApiResponse<SupportTicket>> {
    this.logger.debug(
      `SupportController.createTicket: Creating support ticket`,
    );
    const ticket = await this.ticketService.createTicket(input);
    this.logger.log(
      `SupportController.createTicket: Support ticket created successfully`,
    );
    return {
      success: true,
      message: "Support ticket created successfully",
      data: ticket,
    };
  }

  @Get("tickets")
  async getTickets(
    @Query() query: GetTicketsDto,
  ): Promise<IApiResponse<{ tickets: SupportTicket[]; total: number }>> {
    this.logger.debug(`SupportController.getTickets: Retrieving tickets`);
    const { tickets, total } = await this.ticketService.getTickets(query);
    this.logger.log(
      `SupportController.getTickets: Tickets retrieved successfully`,
    );
    return {
      success: true,
      message: "Tickets retrieved successfully",
      data: { tickets, total },
    };
  }

  @Get("ticket/:ticketId")
  async getTicketDetails(
    @Param("ticketId") ticketId: number,
  ): Promise<IApiResponse<SupportTicket>> {
    this.logger.debug(
      `SupportController.getTicketDetails: Retrieving ticket details for ${ticketId}`,
    );
    const ticket = await this.ticketService.getTicketDetails(ticketId);
    this.logger.log(
      `SupportController.getTicketDetails: Ticket details retrieved successfully for ${ticketId}`,
    );
    return {
      success: true,
      message: "Ticket details retrieved successfully",
      data: ticket,
    };
  }

  @Post("ticket/:ticketId/message")
  async addMessage(
    @Param("ticketId") ticketId: number,
    @Body() input: AddMessageDto,
  ): Promise<IApiResponse<ChatMessage>> {
    this.logger.debug(
      `SupportController.addMessage: Adding message for ${ticketId}`,
    );
    const message = await this.ticketService.addMessage({
      ...input,
      ticketId,
    });
    this.logger.log(
      `SupportController.addMessage: Message added successfully for ${ticketId}`,
    );
    return {
      success: true,
      message: "Message added successfully",
      data: message,
    };
  }

  @Put("ticket/:ticketId/assign")
  async assignTicket(
    @Param("ticketId") ticketId: number,
    @Body() input: AssignTicketDto,
  ): Promise<IApiResponse<SupportTicket>> {
    this.logger.debug(
      `SupportController.assignTicket: Assigning ticket for ${ticketId}`,
    );
    const ticket = await this.ticketService.assignTicket(ticketId, input);
    this.logger.log(
      `SupportController.assignTicket: Ticket assigned successfully for ${ticketId}`,
    );
    return {
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    };
  }

  @Put("ticket/:ticketId/status")
  async updateTicketStatus(
    @Param("ticketId") ticketId: number,
    @Body() input: UpdateTicketStatusDto,
  ): Promise<IApiResponse<SupportTicket>> {
    this.logger.debug(
      `SupportController.updateTicketStatus: Updating ticket status for ${ticketId}`,
    );
    const ticket = await this.ticketService.updateTicketStatus(
      ticketId,
      input.status,
    );
    this.logger.log(
      `SupportController.updateTicketStatus: Ticket status updated successfully for ${ticketId}`,
    );
    return {
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    };
  }

  @Post("ticket/:ticketId/note")
  async addNote(
    @Param("ticketId") ticketId: number,
    @Body() input: AddNoteDto,
  ): Promise<IApiResponse<TicketNote>> {
    this.logger.debug(`SupportController.addNote: Adding note for ${ticketId}`);
    const note = await this.ticketService.addNote({
      ...input,
      ticketId,
    });
    this.logger.log(
      `SupportController.addNote: Note added successfully for ${ticketId}`,
    );
    return {
      success: true,
      message: "Note added successfully",
      data: note,
    };
  }

  @Get("ticket/:ticketId/messages")
  async getTicketMessages(
    @Param("ticketId") ticketId: number,
  ): Promise<IApiResponse<ChatMessage[]>> {
    this.logger.debug(
      `SupportController.getTicketMessages: Retrieving messages for ${ticketId}`,
    );
    const messages = await this.ticketService.getMessages(ticketId);
    this.logger.log(
      `SupportController.getTicketMessages: Messages retrieved successfully for ${ticketId}`,
    );
    return {
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
    };
  }
}
