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

@WebSocketGateway(config.websocketPorts.customerNotification, {
  cors: { origin: config.corsOrigin },
})
export class CustomerNotificationGateway extends BaseSocketGateway {
  @SubscribeMessage("joinRoom")
  async handleJoinRoom(
    @MessageBody() data: { customerId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const room = `customer:${data.customerId}`;
    await this.joinRoom(room, client);
    logger.info(
      `CustomerNotificationGateway: Customer ${data.customerId} joined room ${room}`,
    );
  }

  @SubscribeMessage("agentAcceptedRequest")
  handleAgentAcceptedRequest(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    this.sendMessageToClient(data.customerId, "agentAcceptedRequest", data);
  }

  @SubscribeMessage("agentArrived")
  handleAgentArrived(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    this.sendMessageToClient(data.customerId, "agentArrived", data);
  }

  @SubscribeMessage("requestCompleted")
  handleRequestCompleted(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    this.sendMessageToClient(data.customerId, "requestCompleted", data);
  }

  @SubscribeMessage("agentExpectedArrivalTime")
  handleAgentExpectedArrivalTime(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    this.sendMessageToClient(data.customerId, "agentExpectedArrivalTime", data);
  }

  @SubscribeMessage("agentExpectedRequestCompletionTime")
  handleAgentExpectedCompletionTime(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    this.sendMessageToClient(
      data.customerId,
      "agentExpectedCompletionTime",
      data,
    );
  }

  @SubscribeMessage("agentStatus")
  handleAgentStatus(
    @MessageBody() data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    this.sendMessageToClient(data.customerId, "agentStatus", data);
  }
}
