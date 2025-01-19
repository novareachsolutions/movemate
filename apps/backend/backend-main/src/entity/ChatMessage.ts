import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";

import {
  IMessageMetadata,
  MessageTypeEnum,
} from "../modules/support/types/support.types";
import { BaseEntity } from "./BaseEntity";
import { SupportTicket } from "./SupportTicket";
import { User } from "./User";

@Entity("chat_message")
export class ChatMessage extends BaseEntity {
  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages)
  @JoinColumn({ name: "ticketId" })
  ticket: SupportTicket;

  @RelationId((message: ChatMessage) => message.ticket)
  @Column({ type: "integer", nullable: false })
  ticketId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "senderId" })
  sender: User;

  @RelationId((message: ChatMessage) => message.sender)
  @Column({ type: "integer", nullable: false })
  senderId: number;

  @Column({
    type: "varchar",
    default: MessageTypeEnum.TEXT,
    name: "type",
  })
  type: MessageTypeEnum;

  @Column({ type: "text" })
  content: string;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  metadata: IMessageMetadata;

  @Column({
    type: "boolean",
    default: false,
    name: "isRead",
  })
  isRead: boolean;

  @Column({
    type: "timestamp",
    nullable: true,
    name: "readAt",
  })
  readAt: Date;
}
