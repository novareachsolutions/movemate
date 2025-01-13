import { Column, Entity, Index, Unique } from "typeorm";

import { UserRoleEnum } from "../shared/enums";
import { BaseEntity } from "./BaseEntity";

@Index("IDX_user_role", ["role"], { where: '"deletedAt" IS NULL' })
@Unique("UQ_user_email", ["email"])
@Unique("UQ_user_phoneNumber", ["phoneNumber"])
@Entity()
export class User extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  phoneNumber: string;

  @Column({
    type: "enum",
    enum: UserRoleEnum,
  })
  role: UserRoleEnum;

  @Column({ type: "varchar", nullable: false })
  firstName: string;

  @Column({ type: "varchar", nullable: true })
  lastName: string;

  @Column({ type: "varchar", nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: true })
  street: string;

  @Column({ type: "varchar", nullable: true })
  suburb: string;

  @Column({ type: "varchar", nullable: true })
  state: string;

  @Column({ type: "integer", nullable: true })
  postalCode: number;

  @Column({ type: "float", default: 0 })
  referralCredits: number;
}
