import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './utils/jwt.strategy';
import { RedisModule } from '@/redis/redis.module';
import { RedisService } from '@/redis/redis.service';

@Module({
  imports: [
    RedisModule, // Ensure RedisService is available
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    AuthService,
    JwtStrategy,
    RedisService,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
