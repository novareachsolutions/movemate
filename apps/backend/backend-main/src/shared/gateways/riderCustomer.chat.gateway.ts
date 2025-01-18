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
  
  @WebSocketGateway(config.websocketPorts.riderToCustomerChat, {
    cors: { origin: config.corsOrigin },
  })
  export class RiderToCustomerChatGateway extends BaseSocketGateway {
    @SubscribeMessage("joinRiderToCustomerRoom")
    async handleJoinRiderToCustomerRoom(
      @MessageBody() data: { riderId: number; customerId: number },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      try {
        const room = `riderToCustomer:${data.riderId}:${data.customerId}`;
        await this.joinRoom(room, client);
        logger.info(
          `RiderToCustomerChatGateway: Rider ${data.riderId} and Customer ${data.customerId} joined room ${room}`,
        );
      } catch (error) {
        logger.error(
          `RiderToCustomerChatGateway: Failed to join room: ${error}`,
        );
        this.sendMessageToClient(client.id, "error", {
          message: "Failed to join rider to customer chat room",
          error: error.message,
        });
      }
    }
    
  
    @SubscribeMessage("sendRiderToCustomerMessage")
    handleSendRiderToCustomerMessage(
      @MessageBody() data: { riderId: number; customerId: number; message: string },
      @ConnectedSocket() _client: Socket,
    ): void {
      const room = `riderToCustomer:${data.riderId}:${data.customerId}`;
      this.sendMessageToRoom(room, "newRiderToCustomerMessage", data);
      logger.info(
        `RiderToCustomerChatGateway: Rider ${data.riderId} sent message to Customer ${data.customerId}`,
      );
    }
  }
  