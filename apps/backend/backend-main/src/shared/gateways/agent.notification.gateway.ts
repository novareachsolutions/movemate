import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

import configuration from "../../config/configuration";
import { logger } from "../../logger";
import { BaseSocketGateway } from "./base.socket";

const config = configuration();

@WebSocketGateway(config.websocketPorts.agentNotification, {
  cors: { origin: config.corsOrigin },
})
export class AgentNotificationGateway extends BaseSocketGateway {
  @SubscribeMessage("joinRoom")
  async handleJoinRoom(
    @MessageBody() data: { agentId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const room = `agent:${data.agentId}`;
      await this.joinRoom(room, client);
      logger.info(
        `AgentNotificationGateway: Agent ${data.agentId} joined room ${room}`,
      );
    } catch (error) {
      logger.error(
        `AgentNotificationGateway: Failed to join room for agent ${data.agentId}: ${error}`,
      );
    }
  }

  @SubscribeMessage("newRequest")
  handleNewRequest(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    this.sendMessageToRoom("agents", "newRequest", data);
  }

  @SubscribeMessage("updateRequestStatus")
  handleUpdateRequestStatus(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    this.sendMessageToRoom("agents", "updateRequestStatus", data);
  }

  @SubscribeMessage("agentStatus")
  handleAgentStatus(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    this.sendMessageToRoom("agents", "agentStatus", data);
  }

  sendMessageToAgent(agentId: number, event: string, message: any): void {
    this.sendMessageToRoom(`agent:${agentId}`, event, message);
  }
}
