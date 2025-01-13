import { Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { ReferralCode } from "./ReferralCode";
import { User } from "./User";

@Entity()
export class Referral extends BaseEntity {
  @ManyToOne(() => ReferralCode, { nullable: false, onDelete: "CASCADE" })
  referralCode: ReferralCode;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  referredUser: User;

  @CreateDateColumn()
  referredAt: Date;

  @Column({ type: "float", default: 0 })
  referrerBenefit: number;

  @Column({ type: "float", default: 0 })
  referredBenefit: number;
}
