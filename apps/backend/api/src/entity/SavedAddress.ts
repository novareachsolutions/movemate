import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class SavedAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column()
  suburb: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.savedAddresses, { onDelete: 'CASCADE' })
  user: User;
}
