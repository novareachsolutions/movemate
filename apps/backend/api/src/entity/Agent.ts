import { Entity, Column, OneToOne, RelationId, Index } from 'typeorm';
import { User } from './User';
import { AgentStatusEnum, AgentTypeEnum } from 'src/common/enums/agent';
import { BaseEntity } from './BaseEntity';

@Index('IDX_agent_userId', ['userId'], { where: '"deletedAt" IS NULL' })
@Index('IDX_agent_status', ['status'], { where: '"deletedAt" IS NULL' })
@Entity()
export class Agent extends BaseEntity {
  @OneToOne(() => User, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
  })
  user: User;

  @RelationId((agent: Agent) => agent.user)
  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  agentType: AgentTypeEnum;

  @Column({ type: 'varchar', nullable: false })
  abnNumber: string;

  @Column({ type: 'varchar', nullable: false })
  vehicleMake: string;

  @Column({ type: 'varchar', nullable: false })
  vehicleModel: string;

  @Column({ type: 'varchar', nullable: false })
  vehicleYear: number;

  @Column({ type: 'varchar', nullable: true })
  profilePhoto: string;

  @Column({
    type: 'varchar',
    default: AgentStatusEnum.OFFLINE,
    nullable: true,
  })
  status: AgentStatusEnum;
}
