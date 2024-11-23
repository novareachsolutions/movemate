import { Column, Entity } from 'typeorm';

import { UserRoleEnum } from '../shared/enums';
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
