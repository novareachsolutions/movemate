import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@/redis/redis.service'; // Adjust the path as needed
import { generate as randToken } from 'rand-token';
import { CryptoService } from './crypto';


@Injectable()
export class TokenService {
  private readonly jwtService: JwtService;
  private readonly redisService: RedisService;
  private readonly cryptoService: CryptoService;

  constructor(
    jwtService: JwtService,
    redisService: RedisService,
    cryptoService: CryptoService,
  ) {
    this.jwtService = jwtService;
    this.redisService = redisService;
    this.cryptoService = cryptoService;
  }

  generateAccessToken(user: { id: string; phoneNumber: string; role: string }, xsrfToken: string): string {
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: `${process.env.JWT_ACCESS_SECRET}${xsrfToken}`,
      expiresIn: process.env.JWT_ACCESS_EXPIRY,
    });
  }

  generateRefreshToken(user: { id: string }): string {
    const payload = { userId: user.id };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRY,
    });
  }

  generateXsrfToken(length: number = 32): string {
    return randToken(length);
  }

  async verifyAccessToken(accessToken: string, xsrfToken: string): Promise<any> {
    return this.jwtService.verify(accessToken, {
      secret: `${process.env.JWT_ACCESS_SECRET}${xsrfToken}`,
    });
  }

  async verifyRefreshToken(refreshToken: string): Promise<any> {
    return this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }

  generateOnboardingToken(phoneNumber: string): string {
    const encryptedPhone = this.cryptoService.encrypt(phoneNumber);
    const tokenId = randToken(24);

    return this.jwtService.sign(
      { phone: encryptedPhone, tokenId: tokenId },
      {
        secret: process.env.ONBOARDING_JWT_SECRET,
        expiresIn: '60m',
      },
    );
  }

  async verifyOnboardingToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.ONBOARDING_JWT_SECRET,
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
