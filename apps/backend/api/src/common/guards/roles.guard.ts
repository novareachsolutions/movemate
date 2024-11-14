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
        const userId = request.userId;

        if (!userId) {
            throw new ForbiddenException('userId not found in request');
        }

        const userEntity = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!userEntity) {
            throw new ForbiddenException('User not found');
        }

        if (!requiredRoles.includes(userEntity.role)) {
            throw new ForbiddenException('Insufficient role');
        }

        return true;
    }
}
