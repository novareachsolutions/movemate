import { Module } from "@nestjs/common";

import { ChatSupportGateway } from "../../shared/gateways/chat.support.gateway";
import { RedisService } from "../redis/redis.service";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  providers: [ChatService, ChatSupportGateway, RedisService],
  controllers: [ChatController],
})
export class ChatModule {}
