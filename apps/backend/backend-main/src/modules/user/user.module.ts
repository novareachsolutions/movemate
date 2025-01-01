import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { AuthModule } from "../auth/auth.module";
import { TokenService } from "../auth/utils/generateTokens";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService, OnboardingGuard, TokenService],
  exports: [UserService],
})
export class UserModule {}
