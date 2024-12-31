import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  RelationId,
} from "typeorm";

import { Agent } from "./Agent";
import { BaseEntity } from "./BaseEntity";
import { WalletTransaction } from "./WalletTransaction";

@Entity()
export class Wallet extends BaseEntity {
  @OneToOne(() => Agent)
  @JoinColumn({ name: "agentId" })
  agent: Agent;

  @RelationId((wallet: Wallet) => wallet.agent)
  @Column({ type: "integer", nullable: false })
  agentId: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  stripeConnectedAccountId: string;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions: WalletTransaction[];
}
