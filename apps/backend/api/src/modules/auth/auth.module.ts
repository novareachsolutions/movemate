import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './utils/jwt.strategy';
import { OtpService } from './utils/otp';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';

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
  controllers: [],
  providers: [
    AuthService,
    JwtStrategy,
    RedisService,
    OtpService
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
