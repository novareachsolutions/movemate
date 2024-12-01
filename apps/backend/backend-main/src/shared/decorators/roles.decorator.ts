import { SetMetadata } from "@nestjs/common";

import { UserRoleEnum } from "../enums";

export const ROLES_KEY = "roles";
export const Roles = (
  ...roles: UserRoleEnum[]
): ReturnType<typeof SetMetadata> => SetMetadata(ROLES_KEY, roles);
