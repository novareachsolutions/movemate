import { Entity, Column, OneToOne, RelationId } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Order } from './Order';

@Entity()
export class PickupLocation extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  addressLine1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  landmark: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @OneToOne(() => Order, (order) => order.pickupLocation)
  order: Order;

  @RelationId((pickupLocation: PickupLocation) => pickupLocation.order)
  @Column({ type: 'integer' })
  orderId: number;
}
