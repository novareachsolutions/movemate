import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/entity/User';
import { ROLES_KEY } from '../decorators/roles.decorators';
import { logger } from 'src/logger';
import { dbRepo } from 'src/config/database/database.service';
import { UserRoleEnum } from 'src/shared/enums';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        logger.debug('RolesGuard: Starting canActivate method');

        const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        logger.debug(
            `RolesGuard: Retrieved required roles`,
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            logger.debug('RolesGuard: No roles specified, access granted');
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;


        if (!userId) {
            logger.error('RolesGuard: userId not found in request');
            throw new ForbiddenException('userId not found in request');
        }

        logger.debug(`RolesGuard: Retrieved userId from request: ${userId}`);

        try {
            logger.debug(`RolesGuard: Fetching user with id: ${userId}`);
            const userEntity = await dbRepo(User).findOne({
                where: { id: userId },
            });

            if (!userEntity) {
                logger.error('RolesGuard: User not found in database');
                throw new ForbiddenException('User not found in database');
            }

            logger.debug(`RolesGuard: User found: ${JSON.stringify(userEntity)}`);

            if (!requiredRoles.includes(userEntity.role)) {
                logger.error(
                    `RolesGuard: User role (${userEntity.role}) does not match required roles`,
                );
                throw new ForbiddenException('Insufficient role');
            }

            logger.debug(`RolesGuard: User role (${userEntity.role}) matches required roles`);
            return true;
        } catch (error) {
            logger.error('RolesGuard: Error occurred during role verification');
            throw new ForbiddenException('Error validating user role');
        }
    }
}
