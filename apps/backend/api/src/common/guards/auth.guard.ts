import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
            throw new UnauthorizedException('Access token not found');
        }

        try {
            const payload = this.jwtService.verify(accessToken, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            request['userId'] = payload.userId
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid access token');
        }
    }
}
