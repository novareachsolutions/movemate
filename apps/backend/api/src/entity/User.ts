import { UserRole } from 'src/common/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Order } from './Order';
import { Agent } from './Agent';
import { Review } from './Review';
import { SavedAddress } from './SavedAddress'; 

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  suburb: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.customer)
  customerOrders: Order[];

  @OneToMany(() => SavedAddress, (address) => address.user)
  savedAddresses: SavedAddress[];

  @OneToOne(() => Agent, (agent) => agent.user)
  agent: Agent;

  @OneToMany(() => Review, (review) => review.customer)
  reviews: Review[];
}
