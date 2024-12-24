import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";

import {
  TicketPriorityEnum,
  TicketStatusEnum,
} from "../modules/support/types/support.types";
import { BaseEntity } from "./BaseEntity";
import { ChatMessage } from "./ChatMessage";
import { User } from "./User";

@Entity()
export class SupportTicket extends BaseEntity {
  @Column({ type: "varchar", unique: true })
  ticketNumber: string; // e.g., "TICK-2024-0001"

  @ManyToOne(() => User)
  customer: User;

  @RelationId((ticket: SupportTicket) => ticket.customer)
  customerId: number;

  @ManyToOne(() => User, { nullable: true })
  assignedAgent: User;

  @RelationId((ticket: SupportTicket) => ticket.assignedAgent)
  assignedAgentId: number;

  @Column({
    type: "varchar",
    default: TicketStatusEnum.OPEN,
    nullable: false,
  })
  status: TicketStatusEnum;

  @Column({
    type: "varchar",
    default: TicketPriorityEnum.MEDIUM,
    nullable: false,
  })
  priority: TicketPriorityEnum;

  @Column({ type: "varchar", nullable: true })
  subject: string;

  @Column({ type: "varchar", nullable: true })
  category: string; // e.g., "billing", "technical", "account"

  @Column({
    type: "jsonb",
    nullable: true,
  })
  metadata: {
    browser?: string;
    platform?: string;
    location?: string;
    customFields?: Record<string, any>;
  };

  @OneToMany(() => ChatMessage, (message) => message.ticket)
  messages: ChatMessage[];

  @Column({ type: "timestamp", nullable: true })
  lastRepliedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  resolvedAt: Date;

  @Column({ type: "integer", nullable: true })
  satisfactionRating: number;

  @Column({ type: "text", nullable: true })
  resolutionNotes: string;
}
