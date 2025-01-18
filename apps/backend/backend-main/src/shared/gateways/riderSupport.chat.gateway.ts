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

@WebSocketGateway(config.websocketPorts.riderToSupportChat, {
    cors: { origin: config.corsOrigin },
})
export class RiderToSupportChatGateway extends BaseSocketGateway {
    @SubscribeMessage("joinRiderToSupportRoom")
    async handleJoinRiderToSupportRoom(
        @MessageBody() data: { riderId: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const room = `riderToSupport:${data.riderId}`;
            await this.joinRoom(room, client);
            logger.info(
                `RiderToSupportChatGateway: Rider ${data.riderId} joined room ${room}`,
            );
        } catch (error) {
            logger.error(
                `RiderToSupportChatGateway: Failed to join room: ${error}`,
            );
            this.sendMessageToClient(client.id, "error", {
                message: "Failed to join rider to support chat room",
                error: error.message,
            });
        }
    }


    @SubscribeMessage("sendRiderToSupportMessage")
    handleSendRiderToSupportMessage(
        @MessageBody() data: { riderId: number; message: string },
        @ConnectedSocket() _client: Socket,
    ): void {
        const room = `riderToSupport:${data.riderId}`;
        this.sendMessageToRoom(room, "newRiderToSupportMessage", data);
        logger.info(
            `RiderToSupportChatGateway: Rider ${data.riderId} sent message to Support`,
        );
    }
}
