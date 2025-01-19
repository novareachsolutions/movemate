import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  RelationId,
} from "typeorm";

import {
  OrderStatusEnum,
  OrderTypeEnum,
  PaymentStatusEnum,
  UserRoleEnum,
} from "../shared/enums";
import { Agent } from "./Agent";
import { BaseEntity } from "./BaseEntity";
import { DropLocation } from "./DropLocation";
import { OrderReview } from "./OrderReview";
import { PickupLocation } from "./PickupLocation";
import { Report } from "./Report";
import { User } from "./User";

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
    type: "enum",
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
    nullable: false,
  })
  status: OrderStatusEnum;

  @Column({
    type: "enum",
    enum: OrderTypeEnum,
    default: OrderTypeEnum.DELIVERY,
    nullable: false,
  })
  type: OrderTypeEnum;

  @ManyToOne(() => PickupLocation, (pickupLocation) => pickupLocation.id, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "pickupLocationId" })
  pickupLocation: PickupLocation;

  @RelationId((order: SendPackageOrder) => order.pickupLocation)
  @Column({ type: "integer", nullable: true })
  pickupLocationId: number;

  @ManyToOne(() => DropLocation, (dropLocation) => dropLocation.id, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "dropLocationId" })
  dropLocation: DropLocation;

  @RelationId((order: SendPackageOrder) => order.dropLocation)
  @Column({ type: "integer", nullable: true })
  dropLocationId: number;

  @Column({ type: "integer", nullable: true })
  estimatedDistance: number;

  @Column({ type: "time", nullable: false })
  estimatedTime: number;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: "customerId" })
  customer: User;

  @RelationId((order: SendPackageOrder) => order.customer)
  @Column({ type: "integer", nullable: true })
  customerId: number;

  @ManyToOne(() => Agent, (agent) => agent.id, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "agentId" })
  agent: Agent;

  @RelationId((order: SendPackageOrder) => order.agent)
  @Column({ type: "integer", nullable: true })
  agentId: number;

  @Column({ type: "float", nullable: true })
  price: number;

  @Column({ type: "float", nullable: true })
  actualDistance: number;

  @Column({ type: "float", nullable: true })
  actualTime: number;

  @Column({ type: "varchar", nullable: true })
  cancellationReason: string;

  @Column({
    type: "enum",
    enum: UserRoleEnum,
    nullable: true,
  })
  canceledBy: UserRoleEnum;

  @Column({ type: "varchar", nullable: true })
  completionPhoto: string;

  @Column({ type: "timestamp", nullable: true })
  acceptedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date;

  @Column({
    type: "enum",
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.NOT_PAID,
    nullable: false,
  })
  paymentStatus: PaymentStatusEnum;

  @OneToOne(() => Report, (report) => report.sendPackageOrder, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "reportId" })
  report: Report;

  @RelationId((order: SendPackageOrder) => order.report)
  @Column({ type: "integer", nullable: true })
  reportId: number;

  @OneToOne(() => OrderReview, (orderReview) => orderReview.sendPackageOrder, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "orderReviewId" })
  review: OrderReview;

  @RelationId((order: SendPackageOrder) => order.review)
  @Column({ type: "integer", nullable: true })
  orderReviewId: number;
}
