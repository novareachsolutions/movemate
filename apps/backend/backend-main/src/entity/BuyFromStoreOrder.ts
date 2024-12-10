import {
    Entity,
    Column,
    RelationId,
    ManyToOne,
    OneToMany,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { DropLocation } from './DropLocation';
import { Report } from './Report';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Agent } from './Agent';
import { Store } from './Store';
import {
    OrderStatusEnum,
    PaymentStatusEnum,
    UserRoleEnum,
} from '../shared/enums';
import { Item } from './Item';

@Entity()
export class BuyFromStoreOrder extends BaseEntity {
    @ManyToOne(() => Store, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn()
    store: Store;

    @RelationId((order: BuyFromStoreOrder) => order.store)
    @Column({ type: 'integer' })
    storeId: number;

    @ManyToOne(() => DropLocation, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn()
    dropLocation: DropLocation;

    @RelationId((order: BuyFromStoreOrder) => order.dropLocation)
    @Column({ type: 'integer' })
    dropLocationId: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    deliveryInstructions: string;

    @Column({ type: 'float', nullable: false })
    estimatedDistance: number;

    @Column({ type: 'float', nullable: false })
    estimatedTime: number;

    @Column({
        type: 'varchar',
        length: 50,
        default: OrderStatusEnum.PENDING,
        nullable: false,
    })
    status: OrderStatusEnum;


    @ManyToOne(() => User, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    })
    customer: User;

    @RelationId((order: BuyFromStoreOrder) => order.customer)
    @Column({ type: 'integer' })
    customerId: number;

    @ManyToOne(() => Agent, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: true,
    })
    agent: Agent;

    @RelationId((order: BuyFromStoreOrder) => order.agent)
    @Column({ type: 'integer', nullable: true })
    agentId: number;

    @Column({
        type: 'varchar',
        length: 50,
        default: PaymentStatusEnum.NOT_PAID,
        nullable: false,
    })
    deliveryPaymentStatus: PaymentStatusEnum;

    @Column({ type: 'float', nullable: true })
    deliveryFee: number;

    @Column({ type: 'timestamp', nullable: true })
    deliveryFeePaidAt: Date;

    @Column({
        type: 'varchar',
        length: 50,
        default: PaymentStatusEnum.NOT_PAID,
        nullable: false,
    })
    itemsPaymentStatus: PaymentStatusEnum;

    @Column({ type: 'float', nullable: true })
    itemsAmount: number;

    @Column({ type: 'timestamp', nullable: true })
    itemsPaymentReceivedAt: Date;

    @Column({ type: 'text', nullable: true })
    cancellationReason: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    canceledBy: UserRoleEnum;

    @Column({ type: 'text', nullable: true })
    completionPhoto: string;

    @Column({ type: 'timestamp', nullable: true })
    acceptedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @ManyToOne(() => Agent, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: true,
    })
    assignedAgent: Agent;

    @RelationId((order: BuyFromStoreOrder) => order.assignedAgent)
    @Column({ type: 'integer', nullable: true })
    assignedAgentId: number;

    @Column({
        type: 'varchar',
        default: PaymentStatusEnum.NOT_PAID,
        nullable: false,
    })
    paymentStatus: PaymentStatusEnum;

    @OneToOne(() => Report, (report) => report.buyFromStoreOrder, {
        cascade: true,
        nullable: true,
        onDelete: 'SET NULL',
    })
    report: Report;

    @RelationId((order: BuyFromStoreOrder) => order.report)
    @Column({ type: 'integer', nullable: true })
    reportId: number;

    @OneToMany(() => Item, (item) => item.order, {
        cascade: true,
        eager: true,
    })
    items: Item[];
}
