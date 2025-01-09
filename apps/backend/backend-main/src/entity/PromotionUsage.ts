import { CreateDateColumn, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { PromotionCode } from "./PromotionCode";
import { User } from "./User";

@Entity()
export class PromotionUsage extends BaseEntity {
  @ManyToOne(() => PromotionCode, (promotionCode) => promotionCode.usages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  promotionCode: PromotionCode;

  @ManyToOne(() => User, (user) => user.promotionUsages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user: User;

  @CreateDateColumn()
  usedAt: Date;
}
