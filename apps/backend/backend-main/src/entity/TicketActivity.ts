import { Column, Entity, ManyToOne, RelationId } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { SupportTicket } from "./SupportTicket";
import { User } from "./User";

@Entity()
export class TicketActivity extends BaseEntity {
  @ManyToOne(() => SupportTicket)
  ticket: SupportTicket;

  @ManyToOne(() => User)
  performer: User;

  @RelationId((activity: TicketActivity) => activity.performer)
  @Column({ type: "integer", nullable: false })
  performerId: number;

  @Column({ type: "varchar", nullable: false })
  action: string; // e.g., "status_changed", "agent_assigned", "priority_changed"

  @Column({ type: "jsonb", nullable: true })
  details: {
    from?: string;
    to?: string;
    description?: string;
  };
}
