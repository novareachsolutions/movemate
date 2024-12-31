import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";

import { WalletTransactionTypeEnum } from "../shared/enums";
import { BaseEntity } from "./BaseEntity";
import { Wallet } from "./Wallet";

@Entity()
export class WalletTransaction extends BaseEntity {
  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: "walletId" })
  wallet: Wallet;

  @RelationId((transaction: WalletTransaction) => transaction.wallet)
  @Column({ type: "integer", nullable: false })
  walletId: number;

  @Column({
    type: "enum",
    enum: WalletTransactionTypeEnum,
    nullable: false,
  })
  type: WalletTransactionTypeEnum;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  balanceAfter: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  reference: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  stripeTransferId: string;
}
