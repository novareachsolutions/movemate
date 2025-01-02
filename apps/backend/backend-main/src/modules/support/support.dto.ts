import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

import { UserRoleEnum } from "../../shared/enums";
import {
  MessageTypeEnum,
  TicketPriorityEnum,
  TicketStatusEnum,
} from "./types/support.types";

export class CreateTicketDto {
  @IsString()
  subject: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  initialMessage: string;

  @IsEnum(TicketPriorityEnum)
  @IsOptional()
  priority?: TicketPriorityEnum;

  @IsNumber()
  customerId: number;
}

export class GetTicketsDto {
  @IsEnum(TicketStatusEnum)
  @IsOptional()
  status?: TicketStatusEnum;

  @IsEnum(TicketPriorityEnum)
  @IsOptional()
  priority?: TicketPriorityEnum;

  @IsNumber()
  @IsOptional()
  agentId?: number;

  @IsNumber()
  @IsOptional()
  skip?: number = 0;

  @IsNumber()
  @IsOptional()
  take?: number = 10;
}

export class AddMessageDto {
  @IsString()
  content: string;

  @IsEnum(MessageTypeEnum)
  @IsOptional()
  type?: MessageTypeEnum = MessageTypeEnum.TEXT;

  @IsNumber()
  senderId: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class AssignTicketDto {
  @IsNumber()
  userId: number;

  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatusEnum)
  status: TicketStatusEnum;
}

export class AddNoteDto {
  @IsString()
  content: string;

  @IsNumber()
  authorId: number;

  @IsNumber()
  ticketId: number;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean = false;
}
