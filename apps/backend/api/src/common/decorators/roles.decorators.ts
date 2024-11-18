import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from 'src/shared/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleEnum[]) => SetMetadata(ROLES_KEY, roles);
