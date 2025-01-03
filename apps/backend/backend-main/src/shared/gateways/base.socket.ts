import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { logger } from "../../logger";

@WebSocketGateway()
export abstract class BaseSocketGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  // Handle different types of events
  @SubscribeMessage("event")
  handleEvent(
    @MessageBody() _data: any,
    @ConnectedSocket() _client: Socket,
  ): void {
    // Implement event handling logic
  }

  afterInit(): void {
    logger.info(`${this.constructor.name} initialized`);
  }

  // Join a specific room
  async joinRoom(room: string, client: Socket): Promise<void> {
    await client.join(room);
    logger.info(`Client joined room: ${room}`);
  }

  // Leave a specific room
  async leaveRoom(room: string, client: Socket): Promise<void> {
    await client.leave(room);
    logger.info(`Client left room: ${room}`);
  }

  // Send a message to a specific room
  sendMessageToRoom(room: string, event: string, message: any): void {
    this.server.to(room).emit(event, message);
    logger.info(`Message sent to room ${room}: ${event}`);
  }

  // Send a message to a specific client
  sendMessageToClient(clientId: string, event: string, message: any): void {
    this.server.to(clientId).emit(event, message);
    logger.info(`Message sent to client ${clientId}: ${event}`);
  }
}
