import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generate as randToken } from 'rand-token';
import { CryptoService } from './crypto';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class TokenService {
  private readonly jwtService: JwtService;
  private readonly redisService: RedisService;
  private readonly cryptoService: CryptoService;
  private readonly configService: ConfigService;

  constructor(
    jwtService: JwtService,
    redisService: RedisService,
    cryptoService: CryptoService,
    configService: ConfigService,
  ) {
    this.jwtService = jwtService;
    this.redisService = redisService;
    this.cryptoService = cryptoService;
    this.configService = configService;
  }

  generateAccessToken(userId: number, phoneNumber: string, role: string): string {
    const payload = {
      id: userId,
      phoneNumber: phoneNumber,
      role: role,
    };

    return this.jwtService.sign(payload, {
      secret: `${this.configService.get<string>('JWT_ACCESS_SECRET')}`,
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRY'),
    });
  }

  generateRefreshToken(userId: number): string {

    return this.jwtService.sign({ userId }, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY'),
    });
  }

  generateOnboardingToken(phoneNumber: string): string {
    const tokenId = randToken(24);

    return this.jwtService.sign(
      { phone: phoneNumber, tokenId: tokenId },
      {
        secret: this.configService.get<string>('ONBOARDING_JWT_SECRET'),
        expiresIn: this.configService.get<string>('ONBOARDING_JWT_EXPIRY'),
      },
    );
  }

}
