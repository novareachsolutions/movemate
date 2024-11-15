import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { AgentProfile } from './agent-profile.entity';
import { Booking } from './booking.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.reviews)
  customer: User;

  @ManyToOne(() => AgentProfile, agentProfile => agentProfile.reviews)
  agent: AgentProfile;

  @ManyToOne(() => Booking)
  booking: Booking;
}