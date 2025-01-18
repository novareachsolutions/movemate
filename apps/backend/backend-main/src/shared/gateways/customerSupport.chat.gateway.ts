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

@WebSocketGateway(config.websocketPorts.customerToSupportChat, {
    cors: { origin: config.corsOrigin },
})
export class CustomerToSupportChatGateway extends BaseSocketGateway {
    @SubscribeMessage("joinCustomerToSupportRoom")
    async handleJoinCustomerToSupportRoom(
        @MessageBody() data: { customerId: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const room = `customerToSupport:${data.customerId}`;
            await this.joinRoom(room, client);
            logger.info(
                `CustomerToSupportChatGateway: Customer ${data.customerId} joined room ${room}`,
            );
        } catch (error) {
            logger.error(
                `CustomerToSupportChatGateway: Failed to join room: ${error}`,
            );
            this.sendMessageToClient(client.id, "error", {
                message: "Failed to join customer to support chat room",
                error: error.message,
            });
        }
    }


    @SubscribeMessage("sendCustomerToSupportMessage")
    handleSendCustomerToSupportMessage(
        @MessageBody() data: { customerId: number; message: string },
        @ConnectedSocket() _client: Socket,
    ): void {
        const room = `customerToSupport:${data.customerId}`;
        this.sendMessageToRoom(room, "newCustomerToSupportMessage", data);
        logger.info(
            `CustomerToSupportChatGateway: Customer ${data.customerId} sent message to Support`,
        );
    }
}
