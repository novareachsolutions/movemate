import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from 'src/common/enums/userRole';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entity/User';
import { ROLES_KEY } from '../decorators/roles.decorators';
import { logger } from 'src/logger'; 

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user.id;

        if (!userId) {
            logger.error('userId not found in request')
            throw new ForbiddenException('userId not found in request');
        }

        const userEntity = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!userEntity) {
            logger.error('User not found in database')

            if (!requiredRoles.includes(userEntity.role)) {
                logger.error('Insufficient role for user')
                throw new ForbiddenException('Insufficient role');
            }

            return true;
        }
    }
}