import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';
import { AgentStatus, AgentType } from 'src/shared/utils/agent.enum';
import { User } from 'src/modules/user/entities/user.entity';
import { Booking } from './booking.entity';
import { Review } from './review.entity';
import { AgentDocument } from './agent-document.entity';

@Entity()
export class AgentProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, user => user.agentProfile)
  user: User;

  @Column({ type: 'enum', enum: AgentType })
  riderType: AgentType;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ nullable: true })
  abnNumber: string;

  @Column({ nullable: true })
  vehicleMake: string;

  @Column({ nullable: true })
  vehicleModel: string;

  @Column({ nullable: true })
  vehicleYear: number;

  @Column({ type: 'enum', enum: AgentStatus, default: AgentStatus.OFFLINE })
  status: AgentStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => AgentDocument, agentDocument => agentDocument.agentProfile)
  riderDocuments: AgentDocument[];

  @OneToMany(() => Booking, booking => booking.agent)
  bookings: Booking[];

  @OneToMany(() => Review, review => review.agent)
  reviews: Review[];
}