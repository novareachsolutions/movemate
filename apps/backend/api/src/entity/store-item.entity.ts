import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { BookingItem } from './booking-item.entity';
import { Store } from './store.entity';

@Entity()
export class StoreItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Store, store => store.items)
  store: Store;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('float')
  price: number;

  @Column()
  quantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => BookingItem, bookingItem => bookingItem.storeItem)
  bookingItems: BookingItem[];
}