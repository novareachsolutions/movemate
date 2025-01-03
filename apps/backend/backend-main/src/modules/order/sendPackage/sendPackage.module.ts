import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { AgentNotificationGateway } from "../../../shared/gateways/agent.notification.gateway";
import { CustomerNotificationGateway } from "../../../shared/gateways/customer.notification.gateway";
import { OnboardingGuard } from "../../../shared/guards/onboarding.guard";
import { AgentService } from "../../agent/agent.service";
import { AuthService } from "../../auth/auth.service";
import { TokenService } from "../../auth/utils/generateTokens";
import { OtpService } from "../../auth/utils/otp";
import { AwsModule } from "../../media/aws.module";
import { MediaService } from "../../media/media.service";
import { PricingService } from "../../pricing/pricing.service";
import { RedisService } from "../../redis/redis.service";
import { SendPackageController } from "./sendPackage.controller";
import { SendAPackageService } from "./sendPackage.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AwsModule,
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
    MediaService,
    PricingService,
    CustomerNotificationGateway,
  ],
})
export class SendAPackageModule {}
