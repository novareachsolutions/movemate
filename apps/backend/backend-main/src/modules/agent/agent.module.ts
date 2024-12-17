import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";
import { AuthService } from "../auth/auth.service";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { RedisService } from "../redis/redis.service";
import { JwtService } from "@nestjs/jwt";
import { OtpService } from "../auth/utils/otp";
import { TokenService } from "../auth/utils/generateTokens";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AgentController],
  providers: [AgentService,AuthService,OnboardingGuard,RedisService,JwtService,OtpService,TokenService],
  exports: [AgentService],
})
export class AgentModule {}
