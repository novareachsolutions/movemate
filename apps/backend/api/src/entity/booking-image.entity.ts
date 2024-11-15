import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CarTowing } from './car-towing.entity';

@Entity()
export class BookingImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CarTowing, carTowing => carTowing.bookingImages)
  carTowing: CarTowing;

  @Column()
  url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}