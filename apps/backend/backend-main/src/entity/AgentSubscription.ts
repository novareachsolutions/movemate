import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";

import { SubscriptionPlanEnum, SubscriptionStatusEnum } from "../shared/enums";
import { Agent } from "./Agent";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class AgentSubscription extends BaseEntity {
  @ManyToOne(() => Agent, (agent) => agent.subscriptions)
  @JoinColumn({ name: "agentId" })
  agent: Agent;

  @RelationId((subscription: AgentSubscription) => subscription.agent)
  @Column({ type: "integer", nullable: false })
  agentId: number;

  @Column({
    type: "enum",
    enum: SubscriptionPlanEnum,
    nullable: false,
  })
  plan: SubscriptionPlanEnum;

  @Column({
    type: "enum",
    enum: SubscriptionStatusEnum,
    default: SubscriptionStatusEnum.INACTIVE,
    nullable: false,
  })
  status: SubscriptionStatusEnum;

  @Column({ type: "timestamp", nullable: false })
  startDate: Date;

  @Column({ type: "timestamp", nullable: false })
  endDate: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  stripeSubscriptionId: string;
}
