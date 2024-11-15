import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BuyFromStore } from './buy-from-store.entity';
import { StoreItem } from './store-item.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => StoreItem, storeItem => storeItem.store)
  items: StoreItem[];

  @OneToMany(() => BuyFromStore, buyFromStore => buyFromStore.store)
  storeBookings: BuyFromStore[];
}