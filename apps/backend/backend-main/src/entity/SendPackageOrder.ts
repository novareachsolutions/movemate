import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  RelationId,
} from 'typeorm';
import { DropLocation } from './DropLocation';
import { PickupLocation } from './PickupLocation';
import { Report } from './Report';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import {
  OrderStatusEnum,
  OrderTypeEnum,
  PaymentStatusEnum,
  UserRoleEnum,
} from '../shared/enums';
import { Agent } from './Agent';
@Entity()
export class SendPackageOrder extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  senderName: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  senderPhoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  receiverName: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  receiverPhoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  packageType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deliveryInstructions: string;

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

  @ManyToOne(() => PickupLocation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  pickupLocation: PickupLocation;

  @ManyToOne(() => DropLocation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  dropLocation: DropLocation;

  @Column({ type: 'integer', nullable: true })
  estimatedDistance: number;

  @Column({ nullable: false, type: 'time' })
  estimatedTime: number;

  @ManyToOne(() => User, { nullable: true })
  customer: User;

  @ManyToOne(() => Agent, { nullable: true, onDelete: 'SET NULL' })
  agent: Agent;

  @Column({ type: 'float', nullable: true })
  price: number;

  @Column({ type: 'float', nullable: true })
  actualDistance: number;

  @Column({ type: 'float', nullable: true })
  actualTime: number;

  @Column({ type: 'varchar', nullable: true })
  cancellationReason: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  canceledBy: UserRoleEnum;

  @Column({ type: 'varchar', nullable: true })
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

  @OneToOne(() => Report, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  report: Report;

  @RelationId((sendPackageOrder: SendPackageOrder) => sendPackageOrder.report)
  @Column({ type: 'integer', nullable: true })
  reportId: number;
}

