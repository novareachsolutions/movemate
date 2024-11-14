import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { JwtService } from '@nestjs/jwt';
import { generate as randToken } from 'rand-token';
import { RedisService } from '../redis/redis.service';
import { CryptoService } from './utils/crypto';
import { OtpService } from './utils/otp';
import { logger } from 'src/logger';

@Injectable()
export class AuthService {
  private twilioClient: Twilio;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly cryptoService: CryptoService,
  ) {
    const accountSid = this.configService.get<string>('TW_ACC_SID');
    const authToken = this.configService.get<string>('TW_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new HttpException(
        {
          success: false,
          message: 'Twilio credentials are not set',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async requestOtp(
    phoneNumber: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.manageOtpRequests(phoneNumber);
    const otp = this.otpService.generateOTP();
    await this.storeOtp(phoneNumber, otp);
    await this.sendOtp(phoneNumber, otp);
    return { success: true, message: 'OTP sent successfully' };
  }

  async signupInitiate(
    phoneNumber: string,
    otp: string,
  ): Promise<{
    success: boolean;
    message: string;
    onboardingToken: string;
  }> {
    const existingUser =
      this.configService.get<string>('ENVIRONMENT') === 'local' && false; // Temporarily set to false for testing as user.service is not defined

    if (existingUser) {
      throw new HttpException(
        {
          success: false,
          message: 'The phone number is already registered.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.validateOtp(phoneNumber, otp);
    const onboardingToken = await this.generateOnboardingToken(phoneNumber);
    return {
      success: true,
      message: 'Signup initiated successfully',
      onboardingToken,
    };
  }

  async verifyOnboardingToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('ONBOARDING_JWT_SECRET'),
      })

      if (!payload.phone || !payload.tokenId) return false

      const verifyPhone = await this.redisService.get(
        `onboardingToken:${payload.tokenId}`,
      )
      if (!verifyPhone) return false

      if (verifyPhone === payload.phone) {
        await this.redisService.del(`onboardingToken:${payload.tokenId}`) 
        return true
      }
      return false
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  private async manageOtpRequests(phoneNumber: string): Promise<void> {
    const requestKey = `otpRequests:${phoneNumber}`;
    const ttwKey = `ttw:${phoneNumber}`;

    const requests = await this.redisService.incr(requestKey);
    if (requests === 1) {
      await this.redisService.expire(requestKey, 86400);
    }

    const currentTtw = parseInt(
      (await this.redisService.get(ttwKey)) || '0',
      10,
    );
    const now = Date.now();

    if (now < currentTtw) {
      const waitTime = Math.ceil((currentTtw - now) / 1000);
      throw new HttpException(
        {
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new OTP.`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (requests <= 3) {
      const newTtw = now + requests * 30 * 1000;
      await this.redisService.set(ttwKey, newTtw.toString(), 'EX', 86400);
    } else {
      await this.redisService.set(`ban:${phoneNumber}`, 'banned', 'EX', 86400);
      throw new HttpException(
        {
          success: false,
          message: 'Too many OTP requests. You are banned for 24 hours.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async storeOtp(phoneNumber: string, otp: string): Promise<void> {
    const otpKey = `otp:${phoneNumber}`;
    const otpRequestKey = `otp_request:${phoneNumber}`;
    const secret = this.otpService.generateSecret(otp);

    await this.redisService.set(otpKey, secret, 'EX', 180);
    await this.redisService.set(otpRequestKey, 'requested', 'EX', 360);
  }

  private async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    if (!phoneNumber) {
      throw new HttpException(
        {
          success: false,
          message: 'Phone number is required to send OTP.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.twilioClient.messages.create({
        body: `Your OTP for NOVATECH SOL is ${otp}`,
        from: this.configService.get<string>('TW_PHONE_NUMBER'),
        to: phoneNumber,
      });
    } catch (error: any) {
      logger.error(`AuthService.sendOtp: failed to send otp. error: ${error}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send OTP.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async validateOtp(
    phoneNumber: string,
    inputOtp: string,
  ): Promise<boolean> {
    const otpKey = `otp:${phoneNumber}`;
    const otpRequestKey = `otp_request:${phoneNumber}`;

    const otpExists = await this.redisService.get(otpRequestKey);
    if (!otpExists) {
      throw new HttpException(
        {
          success: false,
          message: 'No OTP request was found associated with this number',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const storedSecret = await this.redisService.get(otpKey);
    if (!storedSecret) {
      throw new HttpException(
        {
          success: false,
          message: "The OTP you're trying to verify has expired, please retry!",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isValid = this.otpService.verifyOTP(inputOtp, storedSecret);
    if (!isValid) {
      throw new HttpException(
        {
          success: false,
          message:
            "The OTP you're trying to verify is incorrect, please retry!",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  private async generateOnboardingToken(phoneNumber: string): Promise<string> {
    const encryptedPhone = this.cryptoService.encryptPhone(phoneNumber);
    const tokenId = randToken(24);
    const token = this.jwtService.sign(
      { phone: encryptedPhone, tokenId },
      {
        secret: this.configService.get<string>('ONBOARDING_JWT_SECRET'),
        expiresIn: this.configService.get<string>('ONBOARDING_JWT_EXPIRY'),
      },
    );
    await this.redisService.set(
      `onboardingToken:${tokenId}`,
      encryptedPhone,
      'EX',
      180,
    );
    return token;
  }
}
