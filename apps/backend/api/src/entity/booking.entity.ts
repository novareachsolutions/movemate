import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Payment } from './payment.entity';
import { SendPackage } from './send-package.entity';
import { BuyFromStore } from './buy-from-store.entity';
import { CarTowing } from './car-towing.entity';
import { BookingStatus, BookingType } from 'src/shared/utils/booking.enum';
import { Location } from './location.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BookingType })
  type: BookingType;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.BOOKED })
  status: BookingStatus;

  @ManyToOne(() => User, user => user.customerBookings)
  customer: User;

  @ManyToOne(() => User, user => user.agentBookings, { nullable: true })
  agent: User;

  @ManyToOne(() => Location)
  pickupLocation: Location;

  @ManyToOne(() => Location, { nullable: true })
  dropLocation: Location;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  @OneToOne(() => Payment, payment => payment.booking, { nullable: true })
  @JoinColumn()
  payment: Payment;

  @OneToOne(() => SendPackage, sendPackage => sendPackage.booking, { nullable: true })
  sendPackage: SendPackage;

  @OneToOne(() => BuyFromStore, buyFromStore => buyFromStore.booking, { nullable: true })
  buyFromStore: BuyFromStore;

  @OneToOne(() => CarTowing, carTowing => carTowing.booking, { nullable: true })
  carTowing: CarTowing;
}