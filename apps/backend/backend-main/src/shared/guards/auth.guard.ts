import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { Agent } from "../../entity/Agent";
import { logger } from "../../logger";
import { dbRepo } from "../../modules/database/database.service";
import { UserRoleEnum } from "../../shared/enums";
import { UnauthorizedError } from "../errors/authErrors";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeaders(request);

    if (accessToken) {
      const payload = this.verifyToken(accessToken, "JWT_ACCESS_SECRET");
      if (payload) {
        this.setUserInRequest(request, payload);
        if (payload.role === UserRoleEnum.AGENT) {
          const agent = await dbRepo(Agent).findOne({
            where: { userId: payload.id },
          });
          if (agent) {
            request.user.agent = { id: agent.id };
          } else {
            throw new UnauthorizedError("Agent profile not found.");
          }
        }
        return true;
      }
    }

    throw new UnauthorizedError("Invalid or missing access token");
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

  private extractTokenFromHeaders(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      logger.debug(
        "AuthGuard.extractTokenFromHeaders: Token extracted from headers",
      );
      return token;
    }
    logger.warn(
      "AuthGuard.extractTokenFromHeaders: Token not found in headers",
    );
    return null;
  }
}
