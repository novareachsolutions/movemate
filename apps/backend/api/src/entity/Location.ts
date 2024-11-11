import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Order } from './Order';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  addressLine1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  landmark: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column({ type: 'boolean', default: false })
  isSaved: boolean;

  @ManyToOne(() => User, (user) => user.locations, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  user: User;

  @OneToMany(() => Order, (order) => order.pickupLocation)
  pickupBookings: Order[];

  @OneToMany(() => Order, (order) => order.dropLocation)
  dropBookings: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
