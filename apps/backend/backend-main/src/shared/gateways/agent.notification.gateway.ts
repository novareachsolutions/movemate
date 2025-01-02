import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

import configuration from "../../config/configuration";
import { BaseSocketGateway } from "./base.socket";
import { logger } from "../../logger";

const config = configuration();

@WebSocketGateway({
  port: config.websocketPorts.agentNotification,
  cors: { origin: config.corsOrigin },
})
export class AgentNotificationGateway extends BaseSocketGateway {
  @SubscribeMessage("joinRoom")
  handleJoinRoom(
    @MessageBody() data: { agentId: number },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = `agent:${data.agentId}`;
    this.joinRoom(room, client);
    logger.info(`AgentNotificationGateway: Agent ${data.agentId} joined room ${room}`);
  }
  
  @SubscribeMessage("newRequest")
  handleNewRequest(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    void this.sendMessageToRoom("agents", "newRequest", data);
  }

  @SubscribeMessage("updateRequestStatus")
  handleUpdateRequestStatus(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    void this.sendMessageToRoom("agents", "updateRequestStatus", data);
  }

  @SubscribeMessage("agentStatus")
  handleAgentStatus(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    void this.sendMessageToRoom("agents", "agentStatus", data);
  }

  sendMessageToAgent(agentId: number, event: string, message: any): void {
    this.sendMessageToRoom(`agent:${agentId}`, event, message);
  }
}
