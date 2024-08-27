import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/redis/redis.service';
import { Twilio } from 'twilio';
import { OtpService } from './utils/otp';

@Injectable()
export class AuthService {
  private readonly twilioClient: Twilio;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {
    // Initialize Twilio client with credentials
    const accountSid = this.configService.get<string>('TW_ACC_SID');
    const authToken = this.configService.get<string>('TW_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new HttpException(
        'Twilio credentials are not set',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  // Request an OTP for a given phone number
  async requestOtp(phoneNumber: string): Promise<void> {
    await this.manageOtpRequests(phoneNumber);
    const otp = this.otpService.generateOTP();
    await this.storeOtp(phoneNumber, otp);
    await this.sendOtp(phoneNumber, otp);
  }

  // Send the OTP to the provided phone number using Twilio
  private async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body: `Your OTP is ${otp}`,
        from: this.configService.get<string>('TW_PHONE_NUMBER') || '+12513090278',
        to: phoneNumber,
      });
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send OTP.',
          error: {
            code: error.error_code || 500,
            reason: error.error_message,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Manage the OTP request rate limit and ban logic
  private async manageOtpRequests(phoneNumber: string): Promise<void> {
    const requestKey = `otpRequests:${phoneNumber}`;
    const ttwKey = `ttw:${phoneNumber}`;
    const requests = await this.redisService.incr(requestKey);

    if (requests === 1) {
      await this.redisService.expire(requestKey, 86400); // 24 hours tracking
    }

    const currentTtw = parseInt((await this.redisService.get(ttwKey)) || '0');
    const now = Date.now();

    if (now < currentTtw) {
      throw new HttpException(
        {
          success: false,
          message: `Please wait ${Math.ceil((currentTtw - now) / 1000)} seconds before requesting a new OTP.`,
          error: { code: 'Early_Call' },
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
          error: { code: 'TOO_MANY_REQS' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Store the generated OTP in Redis with a 5-minute validity
  private async storeOtp(phoneNumber: string, otp: string): Promise<void> {
    const otpKey = `otp:${phoneNumber}`;
    const otpRequestKey = `otp_request:${phoneNumber}`;
    const secret = this.otpService.generateSecret(otp);

    await this.redisService.set(otpKey, secret, 'EX', 300); // 5 minutes validity
    await this.redisService.set(otpRequestKey, 'requested', 'EX', 360); // Slightly longer TTL
  }

  // Validate the provided OTP against the stored OTP
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
          error: { code: 'OTP_NO_REQUEST' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const storedSecret = await this.redisService.get(otpKey);
    if (!storedSecret) {
      throw new HttpException(
        {
          success: false,
          message: "The OTP you're trying to verify has expired, Please Retry!",
          error: { code: 'OTP_EXPIRED' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isValid = this.otpService.generateSecret(inputOtp) === storedSecret;
    if (!isValid) {
      throw new HttpException(
        {
          success: false,
          message: "The OTP you're trying to verify is wrong, Please Retry!",
          error: { code: 'OTP_INVALID' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }
}
