import { OrderStatus, OrderType } from 'src/common/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Review } from './Review';
import { Agent } from './Agent';

@Entity()
@Index(['agent', 'status'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.DELIVERY,
  })
  type: OrderType;

  @Column({ nullable: true })
  pickupLocation: string;

  @Column({ nullable: true })
  dropLocation: string;

  @Column({ nullable: true })
  distance: number;

  @Column({ nullable: true })
  estimatedTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.customerOrders, {
    eager: true,
    onDelete: 'SET NULL',
  })
  customer: User;

  @ManyToOne(() => Agent, (agent) => agent.agentOrders, {
    eager: true,
    onDelete: 'SET NULL',
  })
  agent: Agent;

  @OneToOne(() => Review, (review) => review.order, {
    cascade: true,
    eager: true,
  })
  review: Review;
}
