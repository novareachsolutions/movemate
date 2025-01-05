import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  RelationId,
  Unique,
} from "typeorm";

import { TAgent } from "../modules/agent/agent.types";
import {
  AgentStatusEnum,
  AgentTypeEnum,
  ApprovalStatusEnum,
  SubscripionStatusEnum,
} from "../shared/enums";
import { AgentSubscription } from "./AgentSubscription";
import { BaseEntity } from "./BaseEntity";
import { Payment } from "./Payment";
import { User } from "./User";

@Index("IDX_agent_userId", ["userId"], { where: '"deletedAt" IS NULL' })
@Index("IDX_agent_status", ["status"], { where: '"deletedAt" IS NULL' })
@Unique("UQ_agent_abnNumber", ["abnNumber"])
@Entity()
export class Agent extends BaseEntity implements TAgent {
  @OneToOne(() => User, {
    deferrable: "INITIALLY IMMEDIATE",
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @RelationId((agent: Agent) => agent.user)
  @Column({ type: "integer", nullable: false })
  userId: number;

  @Column({
    type: "varchar",
    nullable: false,
  })
  agentType: AgentTypeEnum;

  @Column({ type: "varchar", nullable: false })
  abnNumber: string;

  @Column({ type: "varchar", nullable: false })
  vehicleMake: string;

  @Column({ type: "varchar", nullable: false })
  vehicleModel: string;

  @Column({ type: "varchar", nullable: false })
  vehicleYear: number;

  @Column({ type: "varchar", nullable: true })
  profilePhoto: string;

  @Column({
    type: "varchar",
    default: AgentStatusEnum.OFFLINE,
    nullable: false,
  })
  status: AgentStatusEnum;

  // ---- Payment Specific Fields ----

  @Column({ type: "varchar", nullable: true })
  stripeAccountId: string;

  @Column({ type: "decimal", default: 0, precision: 10, scale: 2 })
  walletBalance: number;

  @Column({
    type: "varchar",
    default: SubscripionStatusEnum.INACTIVE,
    nullable: true,
  })
  subscriptionStatus: SubscripionStatusEnum;

  @Column({ type: "timestamp", nullable: true })
  subscriptionExpiresAt: Date;

  @Column({ type: "decimal", default: 0.1, precision: 5, scale: 2 })
  commissionRate: number;

  @OneToMany(() => Payment, (payment) => payment.agent)
  payments: Payment[];

  @OneToMany(() => AgentSubscription, (subscription) => subscription.agent)
  subscriptions: AgentSubscription[];

  @Column({
    type: "enum",
    enum: ApprovalStatusEnum,
    default: ApprovalStatusEnum.PENDING,
    nullable: false,
  })
  approvalStatus: ApprovalStatusEnum;
}
