import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { logger } from 'src/logger';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        logger.debug('AuthGuard: Checking authorization for the incoming request');

        const request: Request = context.switchToHttp().getRequest();

        const accessToken = request.cookies['accessToken'];
        logger.debug(`AuthGuard: Retrieved access token from cookies`)

        if (!accessToken) {
            logger.error('AuthGuard: Access token not found');
            throw new UnauthorizedException('Access token not found');
        }

        try {
            const payload = this.jwtService.verify(accessToken, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });
            logger.debug('AuthGuard: JWT verification successful');

            request['user'] = {
                id: payload.id,
                role: payload.role,
                phoneNumber: payload.phoneNumber,
            };
            logger.debug(`AuthGuard: User payload attached to request: ${ JSON.stringify(request['user']) }`);

            return true;
        } catch (error) {
            logger.error('AuthGuard: Invalid access token');
            throw new UnauthorizedException('Invalid access token');
        }
    }
}
