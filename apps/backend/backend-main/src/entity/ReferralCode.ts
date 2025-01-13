import { Column, Entity, ManyToOne, Unique } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

@Entity()
@Unique(["code"])
export class ReferralCode extends BaseEntity {
  @Column({ type: "varchar", length: 20 })
  code: string;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  referrer: User;
}
