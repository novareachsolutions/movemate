import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Order } from './Order';
import { Review } from './Review';
import { AgentDocument } from './AgentDocument';
import { AgentStatusEnum, AgentTypeEnum } from 'src/common/enums/agent';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.agent, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: AgentTypeEnum,
    nullable: true,
  })
  agentType: AgentTypeEnum;

  @Column()
  abnNumber: string;

  @Column()
  vehicleMake: string;

  @Column()
  vehicleModel: string;

  @Column()
  vehicleYear: number;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({
    type: 'enum',
    enum: AgentStatusEnum,
    default: AgentStatusEnum.OFFLINE,
    nullable: true,
  })
  status: AgentStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.agent)
  agentOrders: Order[];

  @OneToMany(() => Review, (review) => review.agent)
  reviews: Review[];

  @OneToMany(() => AgentDocument, (agentDocument) => agentDocument.agent)
  agentDocuments: AgentDocument[];
}
