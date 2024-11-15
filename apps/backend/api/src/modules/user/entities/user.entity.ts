import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Booking } from '../../../entity/booking.entity';
import { UserRole } from '../utils/user-role.enum';
import { SavedAddress } from 'src/entity/saved-address.entity';
import { AgentProfile } from 'src/entity/agent-profile.entity';
import { Review } from 'src/entity/review.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  suburb: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Booking, booking => booking.customer)
  customerBookings: Booking[];

  @OneToMany(() => Booking, booking => booking.agent)
  agentBookings: Booking[];

  @OneToMany(() => SavedAddress, savedAddress => savedAddress.user)
  savedAddresses: SavedAddress[];

  @OneToOne(() => AgentProfile, agentProfile => agentProfile.user)
  @JoinColumn()
  agentProfile: AgentProfile;

  @OneToMany(() => Review, review => review.customer)
  reviews: Review[];
}