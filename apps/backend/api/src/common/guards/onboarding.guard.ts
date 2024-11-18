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
        logger.debug('OnboardingGuard: Starting canActivate method');

        const request = context.switchToHttp().getRequest();

        const token = request.headers['x-onboarding-token'];
        logger.debug(`OnboardingGuard: Extracted onboarding token from headers`);

        if (!token) {
            logger.error('OnboardingGuard: Onboarding token is missing');
            throw new UnauthorizedException('Onboarding token is missing');
        }

        try {
            logger.debug('OnboardingGuard: Verifying onboarding token with AuthService');
            const isValid = await this.authService.verifyOnboardingToken(token);

            if (!isValid) {
                logger.error('OnboardingGuard: Invalid onboarding token');
                throw new UnauthorizedException('Invalid onboarding token');
            }

            logger.debug('OnboardingGuard: Onboarding token verified successfully');
            return true;
        } catch (error) {
            logger.error('OnboardingGuard: Error occurred during onboarding token validation');
            throw new UnauthorizedException('Invalid onboarding token');
        }
    }
}
