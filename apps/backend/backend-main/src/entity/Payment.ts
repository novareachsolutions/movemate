import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";

import { PaymentStatusEnum, PaymentTypeEnum } from "../shared/enums";
import { Agent } from "./Agent";
import { BaseEntity } from "./BaseEntity";
import { SendPackageOrder } from "./SendPackageOrder";

@Entity()
export class Payment extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  stripePaymentIntentId: string;

  @Column({
    type: "enum",
    enum: PaymentTypeEnum,
    nullable: false,
  })
  type: PaymentTypeEnum;

  @Column({
    type: "enum",
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
    nullable: false,
  })
  status: PaymentStatusEnum;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  commissionAmount: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  failureReason: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  stripeTransferId: string;

  @ManyToOne(() => SendPackageOrder, (order) => order.payments, {
    nullable: true,
  })
  @JoinColumn({ name: "orderId" })
  order: SendPackageOrder;

  @RelationId((payment: Payment) => payment.order)
  @Column({ type: "integer", nullable: true })
  orderId: number;

  @ManyToOne(() => Agent, (agent) => agent.payments, { nullable: true })
  @JoinColumn({ name: "agentId" })
  agent: Agent;

  @RelationId((payment: Payment) => payment.agent)
  @Column({ type: "integer", nullable: true })
  agentId: number;
}
