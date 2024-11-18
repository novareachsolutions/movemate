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
        const request: Request = context.switchToHttp().getRequest();
        const accessToken = request.cookies['accessToken'];

        if (!accessToken) {
            logger.error('Access token not found');
            throw new UnauthorizedException('Access token not found');
        }

        try {
            const payload = this.jwtService.verify(accessToken, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });

            request['user'] = {
                id: payload.id,
                role: payload.role,
                phoneNumber: payload.phoneNumber,
            };

            logger.info(`User with phoneNumber ${payload.phoneNumber} authenticated`)

            return true;
        } catch (error) {
            logger.error('Invalid access token')
            throw new UnauthorizedException('Invalid access token');
        }
    }
}
