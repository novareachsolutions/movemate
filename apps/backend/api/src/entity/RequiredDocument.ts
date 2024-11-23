import { UserRoleEnum } from 'src/shared/enums';
import { Column, Entity, OneToOne, RelationId } from 'typeorm';

import { BaseEntity } from './BaseEntity';

@Entity()
export class RequiredDocument extends BaseEntity {
  @Column({
    type: 'enum',
    enum: UserRoleEnum,
  })
  role: UserRoleEnum;

  @Column({ type: 'text', array: true, nullable: false })
  documents: string[];
}
