import {
  Entity,
  Column,
  ManyToOne,
  Index,
  RelationId,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../User';
import { Agent } from '../Agent';
import { BaseEntity } from '../BaseEntity';
import { PickupLocation } from '../PickupLocation';
import { DropLocation } from '../DropLocation';
import {
  OrderStatusEnum,
  OrderTypeEnum,
  CancellationSourceEnum,
} from 'src/shared/enums';

@Index('IDX_order_customerId', ['customerId'], { where: '"deletedAt" IS NULL' })
@Index('IDX_order_agentId', ['agentId'], { where: '"deletedAt" IS NULL' })
@Index('IDX_order_status', ['status'], { where: '"deletedAt" IS NULL' })
@Entity()
export class Order extends BaseEntity {
  @Column({
    type: 'varchar',
    default: OrderStatusEnum.PENDING,
    nullable: false,
  })
  status: OrderStatusEnum;

  @Column({
    type: 'varchar',
    default: OrderTypeEnum.DELIVERY,
    nullable: false,
  })
  type: OrderTypeEnum;

  @OneToOne(() => PickupLocation, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  pickupLocation: PickupLocation;

  @RelationId((order: Order) => order.pickupLocation)
  @Column({ type: 'integer' })
  pickupLocationId: number;

  @OneToOne(() => DropLocation, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  dropLocation: DropLocation;

  @RelationId((order: Order) => order.dropLocation)
  @Column({ type: 'integer' })
  dropLocationId: number;

  @Column({ nullable: true })
  distance: number;

  @Column({ nullable: true })
  estimatedTime: number;

  @ManyToOne(() => User, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
  })
  customer: User;

  @RelationId((order: Order) => order.customer)
  @Column({ type: 'integer' })
  customerId: number;

  @ManyToOne(() => Agent, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
  })
  agent: Agent;

  @RelationId((order: Order) => order.agent)
  @Column({ type: 'integer', nullable: true })
  agentId: number;


  @Column({ type: 'float', nullable: true })
  price: number;

  @Column({ type: 'float', nullable: true })
  actualDistance: number;

  @Column({ type: 'float', nullable: true })
  actualTime: number;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  canceledBy: CancellationSourceEnum;

  @ManyToOne(() => Agent, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
  })
  assignedAgent: Agent;

  @RelationId((order: Order) => order.assignedAgent)
  @Column({ type: 'integer', nullable: true })
  assignedAgentId: number;

  @Column({ type: 'text', nullable: true })
  completionPhoto: string;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  report: string;

  @Column({ type: 'text', nullable: true })
  review: string;
}
