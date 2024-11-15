import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';
import { BookingImage } from './booking-image.entity';
import { Condition, ServiceType, VehicleType } from 'src/shared/utils/car-towing.enum';
import { Booking } from './booking.entity';

@Entity()
export class CarTowing {
  @PrimaryGeneratedColumn()
  bookingId: number;

  @Column({ type: 'enum', enum: ServiceType })
  serviceType: ServiceType;

  @Column({ type: 'enum', enum: VehicleType })
  vehicleType: VehicleType;

  @Column()
  vehicleModel: string;

  @Column()
  vehicleMake: string;

  @Column({ type: 'enum', enum: Condition })
  condition: Condition;

  @Column({ nullable: true })
  specialInstructions: string;

  @OneToMany(() => BookingImage, bookingImage => bookingImage.carTowing)
  bookingImages: BookingImage[];

  @OneToOne(() => Booking, booking => booking.carTowing)
  booking: Booking;
}