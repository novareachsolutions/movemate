import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SendPackageController } from "./sendPackage.controller";
import { SendAPackageService } from "./sendPackage.service";
import { AgentService } from "../../agent/agent.service";
import { AuthService } from "../../auth/auth.service";
import { OnboardingGuard } from "../../../shared/guards/onboarding.guard";
import { RedisService } from "../../redis/redis.service";
import { JwtService } from "@nestjs/jwt";
import { OtpService } from "../../auth/utils/otp";
import { TokenService } from "../../auth/utils/generateTokens";
import { AgentNotificationGateway } from "../../../shared/gateways/agent.notification.gateway";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [SendPackageController],
  providers: [SendAPackageService, AgentService, AuthService, OnboardingGuard, RedisService, JwtService, OtpService, TokenService, AgentNotificationGateway],
})
export class SendAPackageModule { }
