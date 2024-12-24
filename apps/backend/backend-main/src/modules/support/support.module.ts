import { Module } from "@nestjs/common";

import { ChatSupportGateway } from "../../shared/gateways/chat.support.gateway";
import { CustomerNotificationGateway } from "../../shared/gateways/customer.notification.gateway";
import { ActivityService } from "./activity.service";
import { NotificationService } from "./notification.service";
import { SupportController } from "./support.controller";
import { SupportService } from "./support.service";

@Module({
  controllers: [SupportController],
  providers: [
    SupportService,
    ActivityService,
    NotificationService,
    ChatSupportGateway,
    CustomerNotificationGateway,
  ],
  exports: [SupportService, ActivityService],
})
export class SupportModule {}
