import {
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { User } from '../User';
import { Agent } from '../Agent';
import { BaseEntity } from '../BaseEntity';
import { PickupLocation } from '../PickupLocation';
import { DropLocation } from '../DropLocation';
import {
  OrderStatusEnum,
  OrderTypeEnum,
  PaymentStatusEnum,
  UserRoleEnum
} from '../../shared/enums';
import { Report } from '../Report';

export abstract class Order extends BaseEntity {
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

  @Column({ nullable: false })
  estimatedDistance: number;

  @Column({ nullable: false })
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
    nullable: true,
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
  canceledBy: UserRoleEnum;

  @ManyToOne(() => Agent, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
    nullable: true,
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

  @Column({
    type: 'varchar',
    default: PaymentStatusEnum.NOT_PAID,
    nullable: false,
  })
  paymentStatus: PaymentStatusEnum;

  @OneToOne(() => Report, (report) => report.order, {
    cascade: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  report: Report;

  @RelationId((order: Order) => order.report)
  @Column({ type: 'integer', nullable: true })
  reportId: number;
}
