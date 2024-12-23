import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AgentService } from "../../agent/agent.service";
import { AuthService } from "../../auth/auth.service";
import { OnboardingGuard } from "../../../shared/guards/onboarding.guard";
import { RedisService } from "../../redis/redis.service";
import { JwtService } from "@nestjs/jwt";
import { OtpService } from "../../auth/utils/otp";
import { TokenService } from "../../auth/utils/generateTokens";
import { BuyFromStoreController } from "./buyFromAStore.controller";
import { BuyFromStoreService } from "./buyFromAStore.service";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [BuyFromStoreController],
  providers: [BuyFromStoreService, AgentService, AuthService, OnboardingGuard, RedisService, JwtService, OtpService, TokenService],
})
export class BuyFromStoreModule { }
