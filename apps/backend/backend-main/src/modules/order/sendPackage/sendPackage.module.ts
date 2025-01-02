import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { AgentNotificationGateway } from "../../../shared/gateways/agent.notification.gateway";
import { OnboardingGuard } from "../../../shared/guards/onboarding.guard";
import { AgentService } from "../../agent/agent.service";
import { AuthService } from "../../auth/auth.service";
import { TokenService } from "../../auth/utils/generateTokens";
import { OtpService } from "../../auth/utils/otp";
import { RedisService } from "../../redis/redis.service";
import { SendPackageController } from "./sendPackage.controller";
import { SendAPackageService } from "./sendPackage.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [SendPackageController],
  providers: [
    SendAPackageService,
    AgentService,
    AuthService,
    OnboardingGuard,
    RedisService,
    JwtService,
    OtpService,
    TokenService,
    AgentNotificationGateway,
  ],
})
export class SendAPackageModule {}
