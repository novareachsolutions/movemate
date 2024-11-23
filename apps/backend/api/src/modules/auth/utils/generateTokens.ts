import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { generate as randToken } from 'rand-token';

import { RedisService } from '../../../modules/redis/redis.service';
import { CryptoService } from './crypto';

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

  generateAccessToken(
    user: { id: string; phoneNumber: string; role: string },
    xsrfToken: string,
  ): string {
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: `${this.configService.get<string>('JWT_ACCESS_SECRET')}${xsrfToken}`,
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRY'),
    });
  }

  generateRefreshToken(user: { id: string }): string {
    const payload = { userId: user.id };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY'),
    });
  }

  generateXsrfToken(length: number = 32): string {
    return randToken(length);
  }

  generateOnboardingToken(phoneNumber: string): string {
    const encryptedPhone = this.cryptoService.encrypt(phoneNumber);
    const tokenId = randToken(24);

    return this.jwtService.sign(
      { phone: encryptedPhone, tokenId: tokenId },
      {
        secret: this.configService.get<string>('ONBOARDING_JWT_SECRET'),
        expiresIn: '60m',
      },
    );
  }

  async verifyAccessToken(
    accessToken: string,
    xsrfToken: string,
  ): Promise<any> {
    return this.jwtService.verify(accessToken, {
      secret: `${this.configService.get<string>('JWT_ACCESS_SECRET')}${xsrfToken}`,
    });
  }

  async verifyRefreshToken(refreshToken: string): Promise<any> {
    return this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async verifyOnboardingToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('ONBOARDING_JWT_SECRET'),
      });

      if (!payload.phone || !payload.tokenId) return false;

      const verifyPhone = await this.redisService.get(
        `onboardingToken:${payload.tokenId}`,
      );
      if (!verifyPhone) return false;

      // Decrypt the phone number to compare
      const decryptedPhone = this.cryptoService.decrypt(payload.phone);
      return verifyPhone === decryptedPhone;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
