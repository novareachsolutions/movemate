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
  port: config.websocketPorts.notification,
  cors: { origin: config.corsOrigin },
})
export class NotificationGateway extends BaseSocketGateway {
  @SubscribeMessage("sendNotification")
  handleSendNotification(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    if (data.target === "agent") {
      this.sendMessageToRoom("agents", "notification", data);
    } else if (data.target === "customer") {
      this.sendMessageToRoom("customers", "notification", data);
    }
  }
}
