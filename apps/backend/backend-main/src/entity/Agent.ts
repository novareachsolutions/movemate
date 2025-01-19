import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  RelationId,
  Unique,
} from "typeorm";

import { TAgent } from "../modules/agent/agent.types";
import {
  AgentStatusEnum,
  AgentTypeEnum,
  ApprovalStatusEnum,
} from "../shared/enums";
import { BaseEntity } from "./BaseEntity";
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

  @Column({
    type: "enum",
    enum: ApprovalStatusEnum,
    default: ApprovalStatusEnum.PENDING,
    nullable: false,
  })
  approvalStatus: ApprovalStatusEnum;
}
