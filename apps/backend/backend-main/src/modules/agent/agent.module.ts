import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { AgentNotificationGateway } from "../../shared/gateways/agent.notification.gateway";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { AuthService } from "../auth/auth.service";
import { TokenService } from "../auth/utils/generateTokens";
import { OtpService } from "../auth/utils/otp";
import { AwsModule } from "../media/aws.module";
import { MediaService } from "../media/media.service";
import { RedisService } from "../redis/redis.service";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AwsModule,
  ],
  controllers: [AgentController],
  providers: [
    AgentService,
    AuthService,
    OnboardingGuard,
    RedisService,
    JwtService,
    OtpService,
    TokenService,
    MediaService,
    TokenService,
    AgentNotificationGateway,
  ],
  exports: [AgentService],
})
export class AgentModule {}
