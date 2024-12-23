import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { RedisModule } from "../redis/redis.module";
import { RedisService } from "../redis/redis.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CryptoService } from "./utils/crypto";
import { TokenService } from "./utils/generateTokens";
import { OtpService } from "./utils/otp";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "60d" },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RedisService,
    OtpService,
    CryptoService,
    TokenService,
  ],
  exports: [AuthService, JwtModule], 
})
export class AuthModule {}
