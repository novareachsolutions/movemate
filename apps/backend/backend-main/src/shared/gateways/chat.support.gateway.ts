import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

import configuration from "../../config/configuration";
import { ChatService } from "../../modules/chat/chat.service";
import { BaseSocketGateway } from "./base.socket";

const config = configuration();

@WebSocketGateway({
  port: config.websocketPorts.chatSupport,
  cors: { origin: config.corsOrigin },
})
export class ChatSupportGateway extends BaseSocketGateway {
  constructor(private readonly chatService: ChatService) {
    super();
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket
  ): Promise<void> {
    const chatMessageInput = {
      channelId: data.room,
      senderId: data.senderId,
      recipientId: data.recipientId,
      message: data.message,
    };
    await this.chatService.saveChat(chatMessageInput);
    this.sendMessageToRoom(data.room, "newMessage", data);
  }

  @SubscribeMessage("sendPrivateMessage")
  async handleSendPrivateMessage(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket
  ): Promise<void> {
    const chatMessageInput = {
      channelId: data.room,
      senderId: data.senderId,
      recipientId: data.recipientId,
      message: data.message,
    };
    await this.chatService.saveChat(chatMessageInput);
    this.sendMessageToClient(data.userId, "privateMessage", data);
  }
}
