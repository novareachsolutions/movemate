import {
  Column,
  Entity,
  Index,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { SendPackageOrder } from './SendPackageOrder';
import { BuyFromStoreOrder } from './BuyFromStoreOrder';

@Index('IDX_report_customerId', ['customerId'], {
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

  @ManyToOne(() => SendPackageOrder, (sendPackageOrder) => sendPackageOrder.report, {
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  sendPackageOrder?: SendPackageOrder;

  @RelationId((report: Report) => report.sendPackageOrder)
  @Column({ type: 'integer', nullable: true })
  sendPackageOrderId?: number;

  @ManyToOne(() => BuyFromStoreOrder, (buyFromStoreOrder) => buyFromStoreOrder.report, {
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  buyFromStoreOrder?: BuyFromStoreOrder;

  @RelationId((report: Report) => report.buyFromStoreOrder)
  @Column({ type: 'integer', nullable: true })
  buyFromStoreOrderId?: number;
}
