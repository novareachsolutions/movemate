// src/modules/support/support.controller.ts

import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";

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
  constructor(private readonly ticketService: SupportService) {}

  @Post("ticket")
  async createTicket(
    @Body() input: CreateTicketDto,
  ): Promise<IApiResponse<SupportTicket>> {
    const ticket = await this.ticketService.createTicket(input);
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
    const { tickets, total } = await this.ticketService.getTickets(query);
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
    const ticket = await this.ticketService.getTicketDetails(ticketId);
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
    const message = await this.ticketService.addMessage({
      ...input,
      ticketId,
    });
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
    const ticket = await this.ticketService.assignTicket(ticketId, input);
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
    const ticket = await this.ticketService.updateTicketStatus(
      ticketId,
      input.status,
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
    const note = await this.ticketService.addNote({
      ...input,
      ticketId,
    });
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
    const messages = await this.ticketService.getMessages(ticketId);
    return {
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
    };
  }
}
