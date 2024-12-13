import {
  Entity,
  Column,
  RelationId,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { DropLocation } from "./DropLocation";
import { PickupLocation } from "./PickupLocation";
import { Report } from "./Report";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import {
  OrderStatusEnum,
  OrderTypeEnum,
  PaymentStatusEnum,
  UserRoleEnum,
} from "../shared/enums";
import { Agent } from "./Agent";

@Entity()
export class SendPackageOrder extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  senderName: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  senderPhoneNumber: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  receiverName: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  receiverPhoneNumber: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  packageType: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  deliveryInstructions: string;

  @Column({
    type: "varchar",
    default: OrderStatusEnum.PENDING,
    nullable: false,
  })
  status: OrderStatusEnum;

  @Column({
    type: "varchar",
    default: OrderTypeEnum.DELIVERY,
    nullable: false,
  })
  type: OrderTypeEnum;

  @OneToOne(() => PickupLocation, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  pickupLocation: PickupLocation;

  @RelationId(
    (sendPackageOrder: SendPackageOrder) => sendPackageOrder.pickupLocation,
  )
  @Column({ type: "integer" })
  pickupLocationId: number;

  @OneToOne(() => DropLocation, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  dropLocation: DropLocation;

  @RelationId(
    (sendPackageOrder: SendPackageOrder) => sendPackageOrder.dropLocation,
  )
  @Column({ type: "integer" })
  dropLocationId: number;

  @Column({ nullable: false })
  estimatedDistance: number;

  @Column({ nullable: false })
  estimatedTime: number;

  @ManyToOne(() => User, {
    cascade: true,
    onDelete: "CASCADE",
  })
  customer: User;

  @RelationId((sendPackageOrder: SendPackageOrder) => sendPackageOrder.customer)
  @Column({ type: "integer" })
  customerId: number;

  @ManyToOne(() => Agent, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  agent: Agent;

  @RelationId((sendPackageOrder: SendPackageOrder) => sendPackageOrder.agent)
  @Column({ type: "integer", nullable: true })
  agentId: number;

  @Column({ type: "float", nullable: true })
  price: number;

  @Column({ type: "float", nullable: true })
  actualDistance: number;

  @Column({ type: "float", nullable: true })
  actualTime: number;

  @Column({ type: "text", nullable: true })
  cancellationReason: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  canceledBy: UserRoleEnum;

  @ManyToOne(() => Agent, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  assignedAgent: Agent;

  @RelationId(
    (sendPackageOrder: SendPackageOrder) => sendPackageOrder.assignedAgent,
  )
  @Column({ type: "integer", nullable: true })
  assignedAgentId: number;

  @Column({ type: "text", nullable: true })
  completionPhoto: string;

  @Column({ type: "timestamp", nullable: true })
  acceptedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date;

  @Column({
    type: "varchar",
    default: PaymentStatusEnum.NOT_PAID,
    nullable: false,
  })
  paymentStatus: PaymentStatusEnum;

  @OneToOne(() => Report, (report) => report.sendPackageOrder, {
    cascade: true,
    nullable: true,
    onDelete: "SET NULL",
  })
  report: Report;

  @RelationId((sendPackageOrder: SendPackageOrder) => sendPackageOrder.report)
  @Column({ type: "integer", nullable: true })
  reportId: number;
}
