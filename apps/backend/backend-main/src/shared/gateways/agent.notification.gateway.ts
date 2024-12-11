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
  port: config.websocketPorts.agentNotification,
  cors: { origin: config.corsOrigin },
})
export class AgentNotificationGateway extends BaseSocketGateway {
  @SubscribeMessage("newRequest")
  handleNewRequest(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket
  ): void {
    this.sendMessageToRoom("agents", "newRequest", data);
  }

  @SubscribeMessage("updateRequestStatus")
  handleUpdateRequestStatus(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket
  ): void {
    this.sendMessageToRoom("agents", "updateRequestStatus", data);
  }

  @SubscribeMessage("agentStatus")
  handleAgentStatus(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket
  ): void {
    this.sendMessageToRoom("agents", "agentStatus", data);
  }
}
