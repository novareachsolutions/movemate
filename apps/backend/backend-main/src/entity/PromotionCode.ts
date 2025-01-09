import { Column, Entity, ManyToOne, OneToMany, Unique } from "typeorm";

import { OrderTypeEnum } from "../shared/enums";
import { BaseEntity } from "./BaseEntity";
import { PromotionUsage } from "./PromotionUsage";
import { User } from "./User";

@Entity()
@Unique(["code"])
export class PromotionCode extends BaseEntity {
  @Column({ type: "varchar", length: 20 })
  code: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @Column({ type: "float", nullable: true })
  discountAmount: number;

  @Column({ type: "float", nullable: true })
  discountPercentage: number;

  @Column({ type: "integer", nullable: true })
  usageLimit: number;

  @Column({ type: "integer", default: 0 })
  usageCount: number;

  @Column({ type: "timestamp", nullable: true })
  expirationDate: Date;

  @Column({
    type: "varchar",
    array: true,
    nullable: false,
  })
  applicableOrderTypes: OrderTypeEnum[];
  s;
  @ManyToOne(() => User, (user) => user.createdPromotions, {
    nullable: false,
    onDelete: "SET NULL",
  })
  createdBy: User;

  @OneToMany(() => PromotionUsage, (usage) => usage.promotionCode)
  usages: PromotionUsage[];
}
