import { Column, Entity, ManyToOne, RelationId } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { SupportTicket } from "./SupportTicket";
import { User } from "./User";

@Entity()
export class TicketNote extends BaseEntity {
  @ManyToOne(() => SupportTicket)
  ticket: SupportTicket;

  @RelationId((note: TicketNote) => note.ticket)
  @Column({ type: "integer", nullable: false })
  ticketId: number;

  @ManyToOne(() => User)
  author: User;

  @RelationId((note: TicketNote) => note.author)
  @Column({ type: "integer", nullable: false })
  authorId: number;

  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ type: "boolean", default: false, nullable: false })
  isInternal: boolean; // For agent-only notes
}
