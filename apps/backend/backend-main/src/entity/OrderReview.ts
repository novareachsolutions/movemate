import { Column, Entity, Index, ManyToOne, RelationId } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { SendPackageOrder } from "./SendPackageOrder";
import { User } from "./User";

@Index("IDX_review_customerId", ["customerId"], {
  where: '"deletedAt" IS NULL',
})
@Index("IDX_review_orderId", ["sendPackageOrderId"], {
  where: '"deletedAt" IS NULL',
})
@Entity()
export class OrderReview extends BaseEntity {
  @Column({ type: "float", nullable: false })
  rating: number;

  @Column({ type: "varchar", nullable: true })
  comment: string;

  @ManyToOne(() => User, {
    cascade: true,
    deferrable: "INITIALLY IMMEDIATE",
    onDelete: "SET NULL",
    nullable: false,
  })
  customer: User;

  @RelationId((review: OrderReview) => review.customer)
  @Column({ type: "integer" })
  customerId: number;

  @ManyToOne(() => SendPackageOrder, {
    cascade: true,
    deferrable: "INITIALLY IMMEDIATE",
    onDelete: "CASCADE",
    nullable: false,
  })
  sendPackageOrder: SendPackageOrder;

  @RelationId((review: OrderReview) => review.sendPackageOrder)
  @Column({ type: "integer" })
  sendPackageOrderId: number;
}
