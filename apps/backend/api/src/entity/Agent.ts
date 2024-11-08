import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Order } from './Order';
import { Review } from './Review';
import { AgentType, AgentStatus } from 'src/common/enums';
import { AgentDocument } from './AgentDocument'; 

@Entity()
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.agent, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: AgentType,
    nullable: true,
  })
  agentType: AgentType;

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

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.OFFLINE,
    nullable: true,
  })
  status: AgentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.agent)
  agentOrders: Order[];

  @OneToMany(() => Review, (review) => review.agent)
  reviews: Review[];

  @OneToMany(() => AgentDocument, (agentDocument) => agentDocument.agent)
  agentDocuments: AgentDocument[];
}
