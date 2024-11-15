import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { AddressType } from 'src/shared/utils/address-type.enum';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class SavedAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  landmark: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column({ type: 'enum', enum: AddressType })
  addressType: AddressType;

  @ManyToOne(() => User, user => user.savedAddresses)
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}