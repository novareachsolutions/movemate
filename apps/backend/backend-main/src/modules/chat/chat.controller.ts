import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { SupportChat } from "../../entity/SupportChat";
import { IApiResponse } from "../../shared/interface";
import { ChatService } from "./chat.service";
import { TChatMessageInput } from "./chat.types";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("message")
  async handleMessage(
    @Body() data: TChatMessageInput
  ): Promise<IApiResponse<number>> {
    const chat = await this.chatService.saveChat(data);
    return {
      success: true,
      message: "Message sent successfully.",
      data: chat.id,
    };
  }

  @Get(":chatRoomId")
  async getChatHistory(
    @Param("chatRoomId") chatRoomId: string
  ): Promise<IApiResponse<SupportChat[]>> {
    const history = await this.chatService.getChatHistory(chatRoomId);
    return {
      success: true,
      message: "Chat history retrieved successfully.",
      data: history,
    };
  }
}
