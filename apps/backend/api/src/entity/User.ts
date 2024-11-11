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
import { Location } from './Location';
import { UserRoleEnum } from 'src/common/enums/userRole';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
  })
  role: UserRoleEnum;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  street: string;

  @Column({ type: 'varchar' })
  suburb: string;

  @Column({ type: 'varchar' })
  state: string;

  @Column({ type: 'int' })
  postalCode: number;

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

  @OneToMany(() => Location, (address) => address.user)
  locations: Location[];

  @OneToOne(() => Agent, (agent) => agent.user)
  agent: Agent;

  @OneToMany(() => Review, (review) => review.customer)
  reviews: Review[];
}
