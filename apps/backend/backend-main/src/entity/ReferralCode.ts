import { Column, Entity, ManyToOne, OneToMany, Unique } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { Referral } from "./Referral";
import { User } from "./User";

@Entity()
@Unique(["code"])
export class ReferralCode extends BaseEntity {
  @Column({ type: "varchar", length: 20 })
  code: string;

  @ManyToOne(() => User, (user) => user.referralCodes, {
    nullable: false,
    onDelete: "CASCADE",
  })
  referrer: User;

  @OneToMany(() => Referral, (referral) => referral.referralCode)
  referrals: Referral[];
}
