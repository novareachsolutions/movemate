import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

import configuration from "../../config/configuration";
import { ChatService } from "../../modules/chat/chat.service";
import { TChatMessageInput } from "../../modules/chat/chat.types";
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
    @MessageBody() data: TChatMessageInput,
    @ConnectedSocket() _client: Socket,
  ): Promise<void> {
    await this.chatService.saveChat(data);
    this.sendMessageToRoom(data.channelId, "newMessage", data);
  }

  @SubscribeMessage("sendPrivateMessage")
  async handleSendPrivateMessage(
    @MessageBody() data: TChatMessageInput,
    @ConnectedSocket() _client: Socket,
  ): Promise<void> {
    await this.chatService.saveChat(data);
    this.sendMessageToClient(data.channelId, "privateMessage", data);
  }
}
