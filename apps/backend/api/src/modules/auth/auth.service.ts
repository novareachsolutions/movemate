import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { JwtService } from '@nestjs/jwt';
import { generate as randToken } from 'rand-token';
import { RedisService } from '../redis/redis.service';
import { CryptoService } from './utils/crypto';
import { OtpService } from './utils/otp';
import { logger } from 'src/logger';
import { dbRepo } from 'src/config/database/database.service';
import { User } from 'src/entity/User';
import { UserRoleEnum } from 'src/shared/enums';
import { TokenService } from './utils/generateTokens';

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
      logger.error('Twilio credentials are not set');
      throw new InternalServerErrorException('Twilio credentials are not set')
    }
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async requestOtp(phoneNumber: string): Promise<any> {
    logger.debug(`Requesting OTP for ${phoneNumber}`);
    await this.manageOtpRequests(phoneNumber);
    const otp = this.otpService.generateOTP();
    await this.storeOtp(phoneNumber, otp);
    await this.sendOtp(phoneNumber, otp);
    return { success: true, message: 'OTP sent successfully', data: null };
  }

  async signupInitiate(phoneNumber: string, otp: string): Promise<any> {
    logger.debug(`Initiating signup for ${phoneNumber}`);
    const existingUser = await dbRepo(User).findOne({ where: { phoneNumber } });

    if (existingUser) {
      logger.error(`Phone number ${phoneNumber} already registered`);
      throw new BadRequestException('The phone number is already registered.')

    }

    await this.validateOtp(phoneNumber, otp);
    const onboardingToken = await this.tokenService.generateOnboardingToken(phoneNumber);

    return { success: true, message: 'Signup initiated successfully', data: { onboardingToken } };
  }  

  async login(phoneNumber: string, otp: string, role: UserRoleEnum): Promise<any> {
    logger.debug(`Logging in user with phone number ${phoneNumber}`);
    await this.validateOtp(phoneNumber, otp);
    const user = await dbRepo(User).findOne({ where: { phoneNumber } });

    if (!user) {
      logger.error(`User with phone number ${phoneNumber} not found`);
      throw new NotFoundException('User not found.'
      );
    }

    if (user.role !== role) {
      logger.error(`Role mismatch. Expected ${role}, got ${user.role}`);
      throw new ForbiddenException(`User role mismatch. Expected ${role} but got ${user.role}`
      );
    }

    const accessToken = await this.tokenService.generateAccessToken(user.id, user.phoneNumber, user.role);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    await this.redisService.set(
      `refreshToken:${user.id}`,
      refreshToken,
      'EX',
      60 * 60 * 24 * 7,
    );

    return { success: true, message: 'Login successful', data: { accessToken, refreshToken } };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    logger.debug('Refreshing token');
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await dbRepo(User).findOne({ where: { id: payload.userId } });

      if (!user) {
        logger.error(`User with ID ${payload.userId} not found`);
        throw new NotFoundException('User not found.');
      }

      const newAccessToken = await this.tokenService.generateAccessToken(user.id, user.phoneNumber, user.role);
      const newRefreshToken = await this.tokenService.generateRefreshToken(user.id);
      
      return { success: true, message: 'Tokens refreshed successfully.', data: { accessToken: newAccessToken, refreshToken: newRefreshToken } };
    } catch (error) {
      logger.error(`Failed to refresh token. Error: ${error.message}`);
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

    const currentTtw = parseInt((await this.redisService.get(ttwKey)) || '0', 10);
    const now = Date.now();

    if (now < currentTtw) {
      const waitTime = Math.ceil((currentTtw - now) / 1000);
      logger.error(`Rate limit reached. Wait ${waitTime} seconds`);
      throw new BadRequestException(`Please wait ${waitTime} seconds before requesting a new OTP.`
      );
    }

    if (requests <= 3) {
      const newTtw = now + requests * 30 * 1000;
      await this.redisService.set(ttwKey, newTtw.toString(), 'EX', 86400);
    } else {
      await this.redisService.set(`ban:${phoneNumber}`, 'banned', 'EX', 86400);
      logger.error('Too many OTP requests. User banned for 24 hours');
      throw new BadRequestException('Too many OTP requests. You are banned for 24 hours.'
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
    logger.debug(`Sending OTP to ${phoneNumber}`);
    if (!phoneNumber) {
      logger.error('Phone number is required to send OTP');
      throw new BadRequestException('Phone number is required to send OTP.'
      );
    }

    try {
      await this.twilioClient.messages.create({
        body: `Your OTP for NOVATECH SOL is ${otp}`,
        from: this.configService.get<string>('TW_PHONE_NUMBER'),
        to: phoneNumber,
      });
      logger.debug(`OTP sent successfully to ${phoneNumber}`);
    } catch (error: any) {
      logger.error(`Failed to send OTP. Error: ${error.message}`);
      throw new InternalServerErrorException('Failed to send OTP.'
      );
    }
  }

  private async validateOtp(phoneNumber: string, inputOtp: string): Promise<void> {
    logger.debug(`Validating OTP for ${phoneNumber}`);
    const otpKey = `otp:${phoneNumber}`;
    const otpRequestKey = `otp_request:${phoneNumber}`;

    const otpExists = await this.redisService.get(otpRequestKey);
    if (!otpExists) {
      logger.error('No OTP request found for this number');
      throw new BadRequestException('No OTP request was found associated with this number'
      );
    }

    const storedSecret = await this.redisService.get(otpKey);
    if (!storedSecret) {
      logger.error('OTP expired');
      throw new BadRequestException("The OTP you're trying to verify has expired, please retry!"
      );
    }

    const isValid = this.otpService.verifyOTP(inputOtp, storedSecret);
    if (!isValid) {
      logger.error('Invalid OTP');
      throw new BadRequestException("The OTP you're trying to verify is incorrect, please retry!")

    }

    await this.redisService.del(otpKey);
    await this.redisService.del(otpRequestKey);
    logger.debug('OTP validated successfully');
  }

}
