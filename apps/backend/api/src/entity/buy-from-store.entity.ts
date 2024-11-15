import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne } from 'typeorm';
import { Booking } from './booking.entity';
import { Store } from './store.entity';
import { BookingItem } from './booking-item.entity';

@Entity()
export class BuyFromStore {
  @PrimaryGeneratedColumn()
  bookingId: number;

  @ManyToOne(() => Store, store => store.storeBookings)
  store: Store;

  @OneToMany(() => BookingItem, bookingItem => bookingItem.booking)
  bookingItems: BookingItem[];

  @OneToOne(() => Booking, booking => booking.buyFromStore)
  booking: Booking;
}