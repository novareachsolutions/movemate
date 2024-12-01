import { Entity, Column } from 'typeorm';
import { Order } from '.';

@Entity()
export class SendPackageOrder extends Order {
  @Column({ type: 'varchar', length: 255, nullable: false })
  senderName: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  senderPhoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  receiverName: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  receiverPhoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  packageType: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deliveryInstructions: string;
}
