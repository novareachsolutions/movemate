import { Module } from "@nestjs/common";

import {
  AgentNotificationGateway,
  CustomerNotificationGateway,
} from "../../shared/gateways";
import { ChatSupportGateway } from "../../shared/gateways/chat.support.gateway";
import { NotificationService } from "../support/notification.service";
import { SupportService } from "../support/support.service";

@Module({
  providers: [
    AgentNotificationGateway,
    ChatSupportGateway,
    CustomerNotificationGateway,
    SupportService,
    NotificationService,
  ],
  exports: [ChatSupportGateway, CustomerNotificationGateway],
})
export class GatewayModule {}
