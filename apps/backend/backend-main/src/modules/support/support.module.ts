import { Module } from "@nestjs/common";

import { ChatSupportGateway } from "../../shared/gateways/chat.support.gateway";
import { CustomerNotificationGateway } from "../../shared/gateways/customer.notification.gateway";
import { NotificationService } from "./notification.service";
import { SupportController } from "./support.controller";
import { SupportService } from "./support.service";

@Module({
  controllers: [SupportController],
  providers: [
    SupportService,
    NotificationService,
    {
      provide: ChatSupportGateway,
      useClass: ChatSupportGateway,
    },
    {
      provide: CustomerNotificationGateway,
      useClass: CustomerNotificationGateway,
    },
  ],
  exports: [
    SupportService,
    NotificationService,
    ChatSupportGateway,
    CustomerNotificationGateway,
  ],
})
export class SupportModule {}
