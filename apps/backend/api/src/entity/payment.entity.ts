import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Booking } from './booking.entity';
import { PaymentStatus } from 'src/shared/utils/payment.enum';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  stripeId: string;

  @Column('float')
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => Booking, booking => booking.payment)
  booking: Booking;
}