import { Entity, Column, ManyToOne, Index, RelationId } from 'typeorm';
import { User } from './User';
import { Order } from './Order';
import { BaseEntity } from './BaseEntity';

@Index('IDX_review_customerId', ['customerId'], {
  where: '"deletedAt" IS NULL',
})
@Index('IDX_review_orderId', ['orderId'], {
  where: '"deletedAt" IS NULL',
})
@Entity()
export class OrderReview extends BaseEntity {
  @Column({ type: 'float', nullable: false })
  rating: number;

  @Column({ type: 'varchar', nullable: true })
  comment: string;

  @ManyToOne(() => User, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  customer: User;

  @RelationId((review: OrderReview) => review.customer)
  @Column({ type: 'integer' })
  customerId: number;

  @ManyToOne(() => Order, {
    cascade: true,
    deferrable: 'INITIALLY IMMEDIATE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  order: Order;

  @RelationId((review: OrderReview) => review.order)
  @Column({ type: 'integer' })
  orderId: number;
}
