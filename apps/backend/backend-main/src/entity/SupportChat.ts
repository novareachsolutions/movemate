import { Column, Entity, ManyToOne, RelationId } from "typeorm";

import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

@Entity()
export class SupportChat extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  channelId: string;

  @ManyToOne(() => User, {
    cascade: true,
    deferrable: "INITIALLY IMMEDIATE",
    onDelete: "CASCADE",
    nullable: false,
  })
  sender: User;

  @RelationId((supportChat: SupportChat) => supportChat.sender)
  @Column({ type: "integer" })
  senderId: number;

  @ManyToOne(() => User, {
    cascade: true,
    deferrable: "INITIALLY IMMEDIATE",
    onDelete: "CASCADE",
    nullable: false,
  })
  recipient: User;

  @RelationId((supportChat: SupportChat) => supportChat.recipient)
  @Column({ type: "integer" })
  recipientId: number;

  @Column({ type: "varchar", nullable: false })
  message: string;

  @Column({ default: false })
  isDeleted: boolean;
}
