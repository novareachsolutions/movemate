import { forwardRef, Inject, Injectable } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

import configuration from "../../config/configuration";
import { NotificationService } from "../../modules/support/notification.service";
import { SupportService } from "../../modules/support/support.service";
import {
  MessageTypeEnum,
  TicketStatusEnum,
} from "../../modules/support/types/support.types";
import { BaseSocketGateway } from "./base.socket";

const config = configuration();

interface ISupportMessageInput {
  content: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    attachmentUrl?: string;
  };
  senderId: number;
  ticketId: number;
  type: MessageTypeEnum;
}

interface ITicketStatusInput {
  status: TicketStatusEnum;
  ticketId: number;
}

@WebSocketGateway({
  namespace: "chat-support",
  cors: { origin: config.corsOrigin },
})
@Injectable()
export class ChatSupportGateway extends BaseSocketGateway {
  constructor(
    @Inject(forwardRef(() => SupportService))
    private readonly supportService: SupportService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  @SubscribeMessage("sendSupportMessage")
  async handleSupportMessage(
    @MessageBody() data: ISupportMessageInput,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const message = await this.supportService.addMessage({
        ticketId: data.ticketId,
        content: data.content,
        type: data.type,
        senderId: data.senderId,
        metadata: data.metadata,
      });

      // Let notification service handle all notifications
      this.notificationService.notifyNewMessage(message);
    } catch (error) {
      this.sendMessageToClient(client.id, "error", {
        message: "Failed to send message",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("joinTicketRoom")
  async handleJoinTicketRoom(
    @MessageBody() data: { ticketId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const roomId = `ticket:${data.ticketId}`;
      await client.join(roomId);

      const ticket = await this.supportService.getTicketDetails(data.ticketId);

      // Basic room join confirmation
      this.sendMessageToRoom(roomId, "userJoinedTicket", {
        ticketId: data.ticketId,
        userId: client.id,
        timestamp: new Date(),
        ticketDetails: ticket,
      });
    } catch (error) {
      this.sendMessageToClient(client.id, "error", {
        message: "Failed to join ticket room",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("leaveTicketRoom")
  async handleLeaveTicketRoom(
    @MessageBody() data: { ticketId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const roomId = `ticket:${data.ticketId}`;
      await client.leave(roomId);

      // Basic room leave notification
      this.sendMessageToRoom(roomId, "userLeftTicket", {
        ticketId: data.ticketId,
        userId: client.id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.sendMessageToClient(client.id, "error", {
        message: "Failed to leave ticket room",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("updateTicketStatus")
  async handleStatusUpdate(
    @MessageBody() data: ITicketStatusInput,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const updatedTicket = await this.supportService.updateTicketStatus(
        data.ticketId,
        data.status,
      );

      // Let notification service handle status change notifications
      this.notificationService.notifyTicketStatusChanged(updatedTicket);
    } catch (error) {
      this.sendMessageToClient(client.id, "error", {
        message: "Failed to update ticket status",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("typing")
  handleTyping(
    @MessageBody() data: { ticketId: number; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ): void {
    // Simple typing indicator - no need for notification service
    this.sendMessageToRoom(`ticket:${data.ticketId}`, "userTyping", {
      ticketId: data.ticketId,
      userId: client.id,
      isTyping: data.isTyping,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage("joinSupportAgentRoom")
  async handleJoinSupportAgentRoom(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      await client.join("support_agents");
      // Simple room join notification
      this.sendMessageToRoom("support_agents", "supportAgentJoined", {
        agentId: client.id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.sendMessageToClient(client.id, "error", {
        message: "Failed to join support agents room",
        error: error.message,
      });
    }
  }
}
