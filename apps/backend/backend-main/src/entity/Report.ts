// src/modules/order/entities/report.entity.ts

import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Order } from './Order';

@Index('IDX_report_customerId', ['customerId'], {
  where: '"deletedAt" IS NULL',
})
@Index('IDX_report_orderId', ['orderId'], {
  where: '"deletedAt" IS NULL',
})
@Entity()
export class Report extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  reason: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @ManyToOne(() => User, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  customer: User;

  @RelationId((report: Report) => report.customer)
  @Column({ type: 'integer' })
  customerId: number;

  @ManyToOne(() => Order, (order) => order.report, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  order: Order;

  @RelationId((report: Report) => report.order)
  @Column({ type: 'integer' })
  orderId: number;
}
