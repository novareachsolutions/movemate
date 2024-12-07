import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { logger } from "../../logger";
import { AuthService } from "../../modules/auth/auth.service";
import { UnauthorizedError } from "../errors/authErrors";

@Injectable()
export class OnboardingGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeaders(request);

    if (!token) {
      logger.warn("OnboardingGuard.canActivate: Token not found");
      throw new UnauthorizedError("Token not found");
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>("ONBOARDING_JWT_SECRET"),
      });
      request.user = {
        phoneNumber: payload.phone,
      };
      logger.debug(
        `OnboardingGuard.canActivate: Token verified for phone number ${payload.phone}`,
      );
    } catch (error) {
      logger.error("OnboardingGuard.canActivate: Invalid token", error);
      throw new UnauthorizedError("Invalid token");
    }

    return true;
  }

  private extractTokenFromHeaders(request: any): string | null {
    const token = request.headers["onboarding_token"];
    if (token) {
      logger.debug(
        "OnboardingGuard.extractTokenFromHeaders: Token extracted from headers",
      );
      return token;
    }
    logger.warn(
      "OnboardingGuard.extractTokenFromHeaders: Token not found in headers",
    );
    return null;
  }
}
