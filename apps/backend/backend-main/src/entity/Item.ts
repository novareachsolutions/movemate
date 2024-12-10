import {
    Entity,
    Column,
    ManyToOne,
    RelationId,
    JoinColumn,
  } from 'typeorm';
  import { BuyFromStoreOrder } from './BuyFromStoreOrder';
  import { ItemStatusEnum } from '../shared/enums';
  import { BaseEntity } from './BaseEntity';
  
  @Entity()
  export class Item extends BaseEntity {
    @ManyToOne(() => BuyFromStoreOrder, (order) => order.items, {
      onDelete: 'CASCADE',
      nullable: false,
    })
    @JoinColumn()
    order: BuyFromStoreOrder;
  
    @RelationId((item: Item) => item.order)
    @Column({ type: 'integer' })
    orderId: number;
  
    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;
  
    @Column({ type: 'integer', nullable: false })
    quantity: number;
  
    @Column({ type: 'float', nullable: false })
    price: number;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    imageUrl: string;
  
    @Column({
      type: 'varchar',
      length: 50,
      default: ItemStatusEnum.PROPOSED,
      nullable: false,
    })
    currentStatus: ItemStatusEnum;
  
    @Column({ type: 'integer', default: 0, nullable: false })
    alternativeCount: number;
  
    @Column({ type: 'timestamp', nullable: true })
    timerExpiresAt: Date;
  }
  