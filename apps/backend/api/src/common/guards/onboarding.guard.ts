import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { logger } from 'src/logger'; 

@Injectable()
export class OnboardingGuard implements CanActivate {
    constructor(private authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['x-onboarding-token'];

        if (!token) {
            logger.error('Onboarding token is missing')
            throw new UnauthorizedException('Onboarding token is missing');
        }

        try {
            const isValid = await this.authService.verifyOnboardingToken(token);
            if (!isValid) {
                logger.error('Invalid onboarding token')
                throw new UnauthorizedException('Invalid onboarding token');
            }

            return true;
        } catch (error) {
            logger.error('Error validating onboarding token')
            throw new UnauthorizedException('Invalid onboarding token');
        }
    }
}
