import { Column, Entity } from "typeorm";

import { AgentTypeEnum } from "../shared/enums";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class RequiredDocument extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: AgentTypeEnum,
    nullable: false,
  })
  agentType: AgentTypeEnum;

  @Column({ type: "boolean", default: true })
  isRequired: boolean;
}
