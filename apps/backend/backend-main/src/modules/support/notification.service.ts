import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";

import { ChatMessage } from "../../entity/ChatMessage";
import { SupportTicket } from "../../entity/SupportTicket";
import { UserRoleEnum } from "../../shared/enums";
import { ChatSupportGateway } from "../../shared/gateways/chat.support.gateway";
import { CustomerNotificationGateway } from "../../shared/gateways/customer.notification.gateway";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(forwardRef(() => ChatSupportGateway))
    private readonly chatSupportGateway: ChatSupportGateway,
    @Inject(forwardRef(() => CustomerNotificationGateway))
    private readonly customerNotificationGateway: CustomerNotificationGateway,
  ) {}

  notifyNewMessage(message: ChatMessage): void {
    const sender = message.sender;

    this.logger.debug(
      `NotificationService.notifyNewMessage: Sending notification for message ${message.id}`,
    );

    // Send to the specific ticket room
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
      },
    );

    this.logger.log(
      `NotificationService.notifyNewMessage: Notification sent for message ${message.id}`,
    );

    // If the sender is a customer, notify the assigned rider
    if (sender.role === UserRoleEnum.CUSTOMER) {
      this.chatSupportGateway.sendMessageToClient(
        message.ticket.assignedRider.id.toString(),
        "newCustomerMessage",
        {
          ticketId: message.ticket.id,
          customerId: message.sender.id,
          message: message.content,
        },
      );
      this.logger.log(
        `NotificationService.notifyNewMessage: Notification sent to rider ${message.ticket.assignedRider.id} for message ${message.id} from customer ${message.sender.id}`,
      );
    }

    // If the sender is a rider, optionally notify support agents if needed
    if (sender.role === UserRoleEnum.AGENT) {
      // For example, notify support agents about rider's message
      this.chatSupportGateway.sendMessageToRoom(
        "support_agents",
        "newRiderMessage",
        {
          ticketId: message.ticket.id,
          riderId: message.sender.id,
          message: message.content,
        },
      );

      this.logger.log(
        `NotificationService.notifyNewMessage: Notification sent to support agents for message ${message.id} from rider ${message.sender.id}`,
      );
    }
  }

  notifyRiderAssigned(ticket: SupportTicket): void {
    this.chatSupportGateway.sendMessageToClient(
      ticket.assignedRider.id.toString(),
      "riderAssigned",
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        customer: {
          id: ticket.customer.id,
          name: `${ticket.customer.firstName} ${ticket.customer.lastName}`,
        },
      },
    );

    this.customerNotificationGateway.sendMessageToClient(
      ticket.customer.id.toString(),
      "riderAssigned",
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        rider: {
          id: ticket.assignedRider.id,
          name: `${ticket.assignedRider.firstName} ${ticket.assignedRider.lastName}`,
        },
      },
    );

    this.logger.log(
      `NotificationService.notifyRiderAssigned: Notification sent to rider ${ticket.assignedRider.id} for ticket ${ticket.id}`,
    );
  }

  notifySupportAgentAssigned(ticket: SupportTicket): void {
    this.chatSupportGateway.sendMessageToClient(
      ticket.assignedSupportAgent.id.toString(),
      "supportAgentAssigned",
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        customer: {
          id: ticket.customer.id,
          name: `${ticket.customer.firstName} ${ticket.customer.lastName}`,
        },
      },
    );

    this.customerNotificationGateway.sendMessageToClient(
      ticket.customer.id.toString(),
      "supportAgentAssigned",
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        supportAgent: {
          id: ticket.assignedSupportAgent.id,
          name: `${ticket.assignedSupportAgent.firstName} ${ticket.assignedSupportAgent.lastName}`,
        },
      },
    );

    this.logger.log(
      `NotificationService.notifySupportAgentAssigned: Notification sent to support agent ${ticket.assignedSupportAgent.id} for ticket ${ticket.id}`,
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
      },
    );

    // Notify customer
    this.customerNotificationGateway.sendMessageToClient(
      ticket.customer.id.toString(),
      "ticketStatusUpdate",
      {
        ticketId: ticket.id,
        status: ticket.status,
        message: this.getStatusChangeMessage(ticket.status),
      },
    );

    this.logger.log(
      `NotificationService.notifyTicketStatusChanged: Notification sent to customer ${ticket.customer.id} for ticket ${ticket.id}`,
    );
  }

  notifyTicketPriorityChanged(
    ticket: SupportTicket,
    oldPriority: string,
  ): void {
    this.chatSupportGateway.sendMessageToRoom(
      "support_agents",
      "ticketPriorityChanged",
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        oldPriority,
        newPriority: ticket.priority,
      },
    );

    this.logger.log(
      `NotificationService.notifyTicketPriorityChanged: Notification sent to support agents for ticket ${ticket.id}`,
    );
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
