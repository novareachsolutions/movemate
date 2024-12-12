import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { logger } from "../../logger";
import { UnauthorizedError } from "../errors/authErrors";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const token = this.extractTokenFromCookies(request);

    if (!token) {
      logger.warn("AuthGuard.canActivate: Token not found");
      throw new UnauthorizedError("Token not found");
    }

    const payload = this.verifyToken(token, "jwt.accessSecret");
    if (payload) {
      this.setUserInRequest(request, payload);
      return true;
    }

    const refreshToken = this.extractRefreshTokenFromCookies(request);
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token not found");
    }

    const refreshPayload = this.verifyToken(refreshToken, "jwt.refreshSecret");
    if (!refreshPayload) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const newAccessToken = this.generateAccessToken(refreshPayload);
    response.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: this.configService.get<string>("ENVIRONMENT") === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    this.setUserInRequest(request, refreshPayload);

    return true;
  }

  private verifyToken(token: string, secretKey: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(secretKey),
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        logger.warn(`AuthGuard.verifyToken: ${secretKey} expired`);
      } else {
        logger.error(`AuthGuard.verifyToken: Invalid ${secretKey}`, error);
      }
      return null;
    }
  }

  private generateAccessToken(payload: any): string {
    return this.jwtService.sign(
      {
        id: payload.id,
        role: payload.role,
        phoneNumber: payload.phoneNumber,
      },
      {
        secret: this.configService.get<string>("jwt.accessSecret"),
        expiresIn: "15m",
      },
    );
  }

  private setUserInRequest(request: any, payload: any): void {
    request.user = {
      id: payload.id,
      role: payload.role,
      phoneNumber: payload.phoneNumber,
    };
    logger.debug(
      `AuthGuard.setUserInRequest: User ${payload.id} set in request`,
    );
  }

  private extractTokenFromCookies(request: any): string | null {
    const token = request.cookies?.access_token;
    if (token) {
      logger.debug(
        "AuthGuard.extractTokenFromCookies: Token extracted from cookies",
      );
      return token;
    }
    logger.warn(
      "AuthGuard.extractTokenFromCookies: Token not found in cookies",
    );
    return null;
  }

  private extractRefreshTokenFromCookies(request: any): string | null {
    const refreshToken = request.cookies?.refresh_token;
    if (refreshToken) {
      logger.debug(
        "AuthGuard.extractRefreshTokenFromCookies: Refresh token extracted from cookies",
      );
      return refreshToken;
    }
    logger.warn(
      "AuthGuard.extractRefreshTokenFromCookies: Refresh token not found in cookies",
    );
    return null;
  }
}
