import { Column, Entity, Index, ManyToOne, RelationId } from "typeorm";

import { Agent } from "./Agent";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

@Index("IDX_agent_review_customerId", ["customerId"], {
  where: '"deletedAt" IS NULL',
})
@Index("IDX_agent_review_agentId", ["agentId"], {
  where: '"deletedAt" IS NULL',
})
@Entity()
export class AgentReview extends BaseEntity {
  @Column({ type: "float", nullable: false })
  rating: number;

  @Column({ type: "varchar", nullable: true })
  comment: string;

  @ManyToOne(() => User, {
    cascade: true,
    deferrable: "INITIALLY IMMEDIATE",
    onDelete: "SET NULL",
    nullable: false,
  })
  customer: User;

  @RelationId((review: AgentReview) => review.customer)
  @Column({ type: "integer" })
  customerId: number;

  @ManyToOne(() => Agent, {
    cascade: true,
    deferrable: "INITIALLY IMMEDIATE",
    onDelete: "SET NULL",
    nullable: false,
  })
  agent: Agent;

  @RelationId((review: AgentReview) => review.agent)
  @Column({ type: "integer" })
  agentId: number;
}
