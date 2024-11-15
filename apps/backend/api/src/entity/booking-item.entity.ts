import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BuyFromStore } from './buy-from-store.entity';
import { StoreItem } from './store-item.entity';

@Entity()
export class BookingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BuyFromStore, buyFromStore => buyFromStore.bookingItems)
  booking: BuyFromStore;

  @ManyToOne(() => StoreItem, storeItem => storeItem.bookingItems)
  storeItem: StoreItem;

  @Column()
  quantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}