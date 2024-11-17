import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OtpService } from './utils/otp';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { CryptoService } from './utils/crypto';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60d' },
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
  ],
  exports: [AuthService],
})  
export class AuthModule {}
