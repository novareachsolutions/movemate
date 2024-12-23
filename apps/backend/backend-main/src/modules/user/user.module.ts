import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule
  ],
  controllers: [UserController],
  providers: [UserService,OnboardingGuard],
  exports: [UserService],
})
export class UserModule {}
