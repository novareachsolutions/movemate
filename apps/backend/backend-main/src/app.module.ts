import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  HealthCheckService,
  HttpHealthIndicator,
  TerminusModule,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import configuration from "./config/configuration";
import { AgentModule } from "./modules/agent/agent.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DatabaseModule } from "./modules/database/database.module";
import { GatewayModule } from "./modules/gateway/gateway.module";
import { SendAPackageModule } from "./modules/order/sendPackage/sendPackage.module";
import { RedisModule } from "./modules/redis/redis.module";
import { StripeModule } from "./modules/stripe/stripe.module";
import { SupportModule } from "./modules/support/support.module";
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
    SupportModule,
    GatewayModule,
    UserModule,
    SendAPackageModule,
    TerminusModule,
    HttpModule.register({}),
    StripeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RoleGuard,
    OnboardingGuard,
    AuthGuard,
    JwtService,
    HttpHealthIndicator,
    HealthCheckService,
    TypeOrmHealthIndicator,
  ],
  exports: [HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator],
})
export class AppModule {}
