import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './User';
import { Agent } from './Agent';
import { Order } from './Order';

@Entity()
@Unique(['order'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'varchar', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.reviews, {
    eager: true,
    onDelete: 'CASCADE',
  })
  customer: User;

  @ManyToOne(() => Agent, (agent) => agent.reviews, {
    eager: true,
    onDelete: 'CASCADE',
  })
  agent: Agent;

  @ManyToOne(() => Order, (order) => order.review, {
    eager: true,
    onDelete: 'CASCADE',
  })
  order: Order;
}
