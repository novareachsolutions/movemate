import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import configuration from "./config/configuration";
import { AgentModule } from "./modules/agent/agent.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DatabaseModule } from "./modules/database/database.module";
import { RedisModule } from "./modules/redis/redis.module";
import { StripeModule } from "./modules/stripe/stripe.module";
import { UserModule } from "./modules/user/user.module";
import { AuthGuard } from "./shared/guards/auth.guard";
import { OnboardingGuard } from "./shared/guards/onboarding.guard";
import { RoleGuard } from "./shared/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    AgentModule,
    UserModule,
    StripeModule
  ],
  controllers: [AppController],
  providers: [AppService, RoleGuard, OnboardingGuard, AuthGuard, JwtService],
})
export class AppModule {}
