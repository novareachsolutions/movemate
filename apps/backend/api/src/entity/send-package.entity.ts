import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Booking } from './booking.entity';
import { PackageType } from 'src/shared/utils/package.enum';

@Entity()
export class SendPackage {
  @PrimaryGeneratedColumn()
  bookingId: number;

  @Column()
  senderName: string;

  @Column()
  senderMobile: string;

  @Column({ type: 'enum', enum: PackageType })
  packageType: PackageType;

  @OneToOne(() => Booking, booking => booking.sendPackage)
  booking: Booking;
}