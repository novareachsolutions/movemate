// src/entity/Report.ts
import { Column, Entity, Index, JoinColumn, OneToOne, RelationId } from "typeorm";
import { SendPackageOrder } from "./SendPackageOrder";
import { BaseEntity } from "./BaseEntity";

@Index('IDX_report_orderId', ['sendPackageOrderId'], {
  where: '"deletedAt" IS NULL',
})
@Entity()
export class Report extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  reason: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  details: string;

  @OneToOne(() => SendPackageOrder, (sendPackageOrder) => sendPackageOrder.report, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sendPackageOrderId" })
  sendPackageOrder: SendPackageOrder;

  @RelationId((report: Report) => report.sendPackageOrder)
  @Column({ type: "integer", nullable: false })
  sendPackageOrderId: number;
}
