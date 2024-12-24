import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { ChatMessage } from "../../entity/ChatMessage";
import { SupportTicket } from "../../entity/SupportTicket";
import { ChatSupportGateway } from "../../shared/gateways/chat.support.gateway";
import { CustomerNotificationGateway } from "../../shared/gateways/customer.notification.gateway";

@Injectable()
export class NotificationService {
  constructor(
    @Inject(forwardRef(() => ChatSupportGateway))
    private readonly chatSupportGateway: ChatSupportGateway,
    @Inject(forwardRef(() => CustomerNotificationGateway))
    private readonly customerNotificationGateway: CustomerNotificationGateway
  ) {}

  notifyNewMessage(message: ChatMessage): void {
    this.chatSupportGateway.sendMessageToRoom(
      `ticket:${message.ticket.id}`,
      "newMessage",
      {
        ticketId: message.ticket.id,
        message: {
          id: message.id,
          content: message.content,
          type: message.type,
          senderId: message.sender.id,
          createdAt: message.createdAt,
        },
      }
    );

    if (this.isCustomerMessage(message)) {
      this.chatSupportGateway.sendMessageToRoom(
        "agents",
        "newCustomerMessage",
        {
          ticketId: message.ticket.id,
          customerId: message.sender.id,
          message: message.content,
        }
      );
    }
  }

  notifyTicketAssigned(ticket: SupportTicket): void {
    this.chatSupportGateway.sendMessageToClient(
      ticket.assignedAgent.id.toString(),
      "ticketAssigned",
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        customer: {
          id: ticket.customer.id,
          name: `${ticket.customer.firstName} ${ticket.customer.lastName}`,
        },
      }
    );

    this.customerNotificationGateway.sendMessageToClient(
      ticket.customer.id.toString(),
      "agentAssigned",
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        agent: {
          id: ticket.assignedAgent.id,
          name: `${ticket.assignedAgent.firstName} ${ticket.assignedAgent.lastName}`,
        },
      }
    );
  }

  notifyTicketStatusChanged(ticket: SupportTicket): void {
    this.chatSupportGateway.sendMessageToRoom(
      `ticket:${ticket.id}`,
      "ticketStatusChanged",
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        updatedAt: new Date(),
      }
    );

    this.customerNotificationGateway.sendMessageToClient(
      ticket.customer.id.toString(),
      "ticketStatusUpdate",
      {
        ticketId: ticket.id,
        status: ticket.status,
        message: this.getStatusChangeMessage(ticket.status),
      }
    );
  }

  notifyTicketPriorityChanged(
    ticket: SupportTicket,
    oldPriority: string
  ): void {
    this.chatSupportGateway.sendMessageToRoom(
      "agents",
      "ticketPriorityChanged",
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        oldPriority,
        newPriority: ticket.priority,
      }
    );
  }

  private isCustomerMessage(message: ChatMessage): boolean {
    return message.sender.id === message.ticket.customer.id;
  }

  private getStatusChangeMessage(status: string): string {
    const messages = {
      assigned: "An agent has been assigned to your ticket",
      in_progress: "Your ticket is being worked on",
      resolved: "Your ticket has been resolved",
      closed: "Your ticket has been closed",
    };
    return messages[status] || "Your ticket status has been updated";
  }
}
