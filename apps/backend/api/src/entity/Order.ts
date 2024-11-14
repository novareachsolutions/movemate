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
import { OrderStatusEnum, OrderTypeEnum } from 'src/common/enums/orderStatus';
import { Location } from './Location';

@Entity()
@Index(['status'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  status: OrderStatusEnum;

  @Column({
    type: 'enum',
    enum: OrderTypeEnum,
    default: OrderTypeEnum.DELIVERY,
  })
  type: OrderTypeEnum;

  @ManyToOne(() => Location, {
    eager: true,
    onDelete: 'SET NULL',
  })
  pickupLocation: Location;

  @ManyToOne(() => Location, {
    eager: true,
    onDelete: 'SET NULL',
  })
  dropLocation: Location;

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
