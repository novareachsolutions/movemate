import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { logger } from "../../logger";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { ForbiddenError, UnauthorizedError } from "../errors/authErrors";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler()
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      logger.warn("RoleGuard.canActivate: No user found in request");
      throw new UnauthorizedError("No user found");
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      logger.warn(
        `RoleGuard.canActivate: User ${user.id} does not have required role`
      );
      throw new ForbiddenError(
        "You do not have permission to access this resource"
      );
    }

    logger.debug(`RoleGuard.canActivate: User ${user.id} has required role`);
    return true;
  }
}
