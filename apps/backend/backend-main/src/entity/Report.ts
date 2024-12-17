import { Column, Entity, Index, ManyToOne, RelationId } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

@Index('IDX_report_customerId', ['customerId'], {
  where: '"deletedAt" IS NULL',
})
@Index('IDX_report_orderId', ['sendPackageOrderId'], {
  where: '"deletedAt" IS NULL',
})
@Entity()
export class Report extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  reason: string;

  @Column({ type: 'varchar', nullable: true })
  details: string;

  @ManyToOne(() => User, {
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  customer: User;

  @RelationId((report: Report) => report.customer)
  @Column({ type: 'integer' })
  customerId: number;

  @Column({ type: 'integer', nullable: true })
  sendPackageOrderId: number;
}
