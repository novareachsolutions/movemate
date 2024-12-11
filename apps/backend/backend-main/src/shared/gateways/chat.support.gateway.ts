import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

import configuration from "../../config/configuration";
import { BaseSocketGateway } from "./base.socket";

const config = configuration();

@WebSocketGateway({
  port: config.websocketPorts.chatSupport,
  cors: { origin: config.corsOrigin },
})
export class ChatSupportGateway extends BaseSocketGateway {
  @SubscribeMessage("sendMessage")
  handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket
  ): void {
    this.sendMessageToRoom(data.room, "newMessage", data);
  }

  @SubscribeMessage("sendPrivateMessage")
  handleSendPrivateMessage(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket
  ): void {
    this.sendMessageToClient(data.userId, "privateMessage", data);
  }
}
