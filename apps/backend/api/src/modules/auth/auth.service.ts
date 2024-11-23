import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Twilio } from 'twilio';

import { User } from '../../entity/User';
import { logger } from '../../logger';
import { UserRoleEnum } from '../../shared/enums';
import { dbRepo } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { TokenService } from './utils/generateTokens';
import { OtpService } from './utils/otp';

@Injectable()
export class AuthService {
  private twilioClient: Twilio;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
  ) {
    const accountSid = this.configService.get<string>('TW_ACC_SID');
    const authToken = this.configService.get<string>('TW_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      logger.error('AuthService: Twilio credentials are not set');
      throw new InternalServerErrorException('Twilio credentials are not set');
    }
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async requestOtp(phoneNumber: string): Promise<void> {
    logger.debug(`AuthService.requestOtp: Requesting OTP for ${phoneNumber}`);
    await this.manageOtpRequests(phoneNumber);
    const otp = this.otpService.generateOTP();
    await this.storeOtp(phoneNumber, otp);
    await this.sendOtp(phoneNumber, otp);
  }

  async signupInitiate(phoneNumber: string, otp: string): Promise<string> {
    logger.debug(
      `AuthService.signupInitiate: Initiating signup for ${phoneNumber}`,
    );
    const existingUser = await dbRepo(User).findOne({ where: { phoneNumber } });

    if (existingUser) {
      logger.error(
        `AuthService.signupInitiate: Phone number ${phoneNumber} already registered`,
      );
      throw new BadRequestException('The phone number is already registered.');
    }

    await this.validateOtp(phoneNumber, otp);
    const onboardingToken =
      await this.tokenService.generateOnboardingToken(phoneNumber);

    return onboardingToken;
  }

  async login(
    phoneNumber: string,
    otp: string,
    role: UserRoleEnum,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    logger.debug(
      `AuthService.login: Logging in user with phone number ${phoneNumber}`,
    );
    await this.validateOtp(phoneNumber, otp);
    const user = await dbRepo(User).findOne({ where: { phoneNumber } });

    if (!user) {
      logger.error(
        `AuthService.login: User with phone number ${phoneNumber} not found`,
      );
      throw new NotFoundException('User not found.');
    }

    if (user.role !== role) {
      logger.error(
        `AuthService.login: Role mismatch. Expected ${role}, got ${user.role}`,
      );
      throw new ForbiddenException(
        `User role mismatch. Expected ${role} but got ${user.role}`,
      );
    }

    const accessToken = this.tokenService.generateAccessToken(
      user.id,
      user.phoneNumber,
      user.role,
    );
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    logger.debug('AuthService.refreshToken: Refreshing token');
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await dbRepo(User).findOne({
        where: { id: payload.userId },
      });
      if (!user) {
        logger.error(
          `AuthService.refreshToken: User with ID ${payload.userId} not found`,
        );
        throw new NotFoundException('User not found.');
      }

      const newAccessToken = this.tokenService.generateAccessToken(
        user.id,
        user.phoneNumber,
        user.role,
      );
      const newRefreshToken = this.tokenService.generateRefreshToken(user.id);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      logger.error(
        `AuthService.refreshToken: Failed to refresh token. Error: ${error}`,
      );
      throw new UnauthorizedException('Failed to refresh token.');
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
      logger.error(
        `AuthService.manageOtpRequests: Rate limit reached. Wait ${waitTime} seconds`,
      );
      throw new BadRequestException(
        `Please wait ${waitTime} seconds before requesting a new OTP.`,
      );
    }

    if (requests <= 3) {
      const newTtw = now + requests * 30 * 1000;
      await this.redisService.set(ttwKey, newTtw.toString(), 'EX', 86400);
    } else {
      await this.redisService.set(`ban:${phoneNumber}`, 'banned', 'EX', 86400);
      logger.error(
        'AuthService.manageOtpRequests: Too many OTP requests. User banned for 24 hours',
      );
      throw new BadRequestException(
        'Too many OTP requests. You are banned for 24 hours.',
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
    logger.debug(`AuthService.sendOtp: Sending OTP to ${phoneNumber}`);
    if (!phoneNumber) {
      logger.error('AuthService.sendOtp: Phone number is required to send OTP');
      throw new BadRequestException('Phone number is required to send OTP.');
    }

    try {
      await this.twilioClient.messages.create({
        body: `Your OTP for NOVATECH SOL is ${otp}`,
        from: this.configService.get<string>('TW_PHONE_NUMBER'),
        to: phoneNumber,
      });
      logger.debug(
        `AuthService.sendOtp: OTP sent successfully to ${phoneNumber}`,
      );
    } catch (error: any) {
      logger.error(`Failed to send OTP. Error: ${error}`);
      throw new InternalServerErrorException('Failed to send OTP.');
    }
  }

  private async validateOtp(
    phoneNumber: string,
    inputOtp: string,
  ): Promise<void> {
    logger.debug(`AuthService.validateOtp: Validating OTP for ${phoneNumber}`);
    const otpKey = `otp:${phoneNumber}`;
    const otpRequestKey = `otp_request:${phoneNumber}`;

    const otpExists = await this.redisService.get(otpRequestKey);
    if (!otpExists) {
      logger.error(
        'AuthService.validateOtp: No OTP request found for this number',
      );
      throw new BadRequestException(
        'No OTP request was found associated with this number.',
      );
    }

    const storedSecret = await this.redisService.get(otpKey);
    if (!storedSecret) {
      logger.error('AuthService.validateOtp: OTP expired');
      throw new BadRequestException(
        "The OTP you're trying to verify has expired, please retry!",
      );
    }

    const isValid = this.otpService.verifyOTP(inputOtp, storedSecret);
    if (!isValid) {
      logger.error('AuthService.validateOtp: Invalid OTP');
      throw new BadRequestException(
        "The OTP you're trying to verify is incorrect, please retry!",
      );
    }

    await this.redisService.del(otpKey);
    await this.redisService.del(otpRequestKey);
    logger.debug('AuthService.validateOtp: OTP validated successfully');
  }
}
