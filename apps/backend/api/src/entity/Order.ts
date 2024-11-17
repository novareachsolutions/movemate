import {
  Entity,
  Column,
  ManyToOne,
  Index,
  RelationId,
  OneToOne,
} from 'typeorm';
import { User } from './User';
import { Agent } from './Agent';
import { OrderStatusEnum, OrderTypeEnum } from 'src/common/enums/orderStatus';
import { BaseEntity } from './BaseEntity';
import { PickupLocation } from './PickupLocation';
import { DropLocation } from './DropLocation';

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
  pickupLocation: PickupLocation;

  @RelationId((order: Order) => order.pickupLocation)
  @Column({ type: 'integer' })
  pickupLocationId: number;

  @OneToOne(() => DropLocation, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
  })
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
  @Column({ type: 'integer' })
  agentId: number;
}
