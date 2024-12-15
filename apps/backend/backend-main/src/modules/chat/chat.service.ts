import { Injectable } from "@nestjs/common";

import { SupportChat } from "../../entity/SupportChat";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { RedisService } from "../redis/redis.service";
import { TChatMessageInput } from "./chat.types";

@Injectable()
export class ChatService {
  constructor(private readonly redisService: RedisService) {}

  async saveChat(chatMessageInput: TChatMessageInput): Promise<SupportChat> {
    const chat = new SupportChat();
    chat.channelId = chatMessageInput.channelId;
    chat.senderId = chatMessageInput.senderId;
    chat.recipientId = chatMessageInput.recipientId;
    chat.message = chatMessageInput.message;

    const savedChat = await dbRepo(SupportChat).save(chat);

    // Publish the message to Redis for real-time communication
    await this.publishMessageToRedis(savedChat);

    return savedChat;
  }

  // Retrieve old messages from PostgreSQL by sender and recipient
  async getChatHistory(channelId: string): Promise<SupportChat[]> {
    return await dbReadRepo(SupportChat).find({
      where: { channelId },
      order: { createdAt: "ASC" },
    });
  }

  // Publish message to Redis for real-time chat
  private async publishMessageToRedis(chat: SupportChat): Promise<void> {
    const key = `chat:${chat.senderId}:${chat.recipientId}:${chat.channelId}`;
    await this.redisService.set(key, chat.message);
  }
}
