import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Twilio } from "twilio";

import { User } from "../../entity/User";
import { logger } from "../../logger";
import { UserRoleEnum } from "../../shared/enums";
import {
  UserAccessDeniedError,
  UserNotFoundError,
  UserOtpRequestTooSoonException,
  UserPhoneNumberAlreadyExistsError,
  UserPhoneNumberBlockedError,
  UserPhoneNumberIsRequiredError,
  UserRetryOtpError,
  UserTokenRefreshError,
} from "../../shared/errors/user";
import { dbRepo } from "../database/database.service";
import { RedisService } from "../redis/redis.service";
import { TokenService } from "./utils/generateTokens";
import { OtpService } from "./utils/otp";

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
    const accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID");
    const authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN");

    if (!accountSid || !authToken) {
      logger.error("AuthService: Twilio credentials are not set");
      throw new InternalServerErrorException("Twilio credentials are not set");
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
      throw new UserPhoneNumberAlreadyExistsError(
        `Phone number ${phoneNumber} is already registered`,
      );
    }

    await this.validateOtp(phoneNumber, otp);
    const onboardingToken =
      this.tokenService.generateOnboardingToken(phoneNumber);

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
      throw new UserNotFoundError(
        `User with phone number ${phoneNumber} not found`,
      );
    }

    if (user.role !== role) {
      logger.error(
        `AuthService.login: Role mismatch. Expected ${role}, got ${user.role}`,
      );
      throw new UserAccessDeniedError(`You are not registered`);
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
    logger.debug("AuthService.refreshToken: Refreshing token");
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      const user: Pick<User, "id" | "phoneNumber" | "role"> = await dbRepo(
        User,
      ).findOne({
        where: { id: payload.userId },
      });
      if (!user) {
        logger.error(
          `AuthService.refreshToken: User with ID ${payload.userId} not found`,
        );
        throw new UserNotFoundError(
          `User ${user.id} with ${user.phoneNumber} not found`,
        );
      }

      const newAccessToken = this.tokenService.generateAccessToken(
        user.id,
        user.phoneNumber,
        user.role,
      );
      const newRefreshToken = this.tokenService.generateRefreshToken(user.id);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      logger.error(
        `AuthService.refreshToken: Failed to refresh token. Error: ${error}`,
      );
      throw new UserTokenRefreshError("Failed to refresh token");
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
      (await this.redisService.get(ttwKey)) || "0",
      10,
    );
    const now = Date.now();

    if (now < currentTtw) {
      const waitTime = Math.ceil((currentTtw - now) / 1000);
      logger.error(
        `AuthService.manageOtpRequests: Rate limit reached. Wait ${waitTime} seconds`,
      );
      throw new UserOtpRequestTooSoonException(waitTime);
    }

    if (requests <= 100) {
      const newTtw = now + requests * 30 * 1000;
      await this.redisService.set(ttwKey, newTtw.toString(), "EX", 86400);
    } else {
      await this.redisService.set(`ban:${phoneNumber}`, "banned", "EX", 86400);
      logger.error(
        "AuthService.manageOtpRequests: Too many OTP requests. User banned for 24 hours",
      );
      throw new UserPhoneNumberBlockedError(
        "Too many OTP requests. Please try again after 24 hours.",
      );
    }
  }

  private async storeOtp(phoneNumber: string, otp: string): Promise<void> {
    const otpKey = `otp:${phoneNumber}`;
    const otpRequestKey = `otp_request:${phoneNumber}`;
    const secret = this.otpService.generateSecret(otp);

    await this.redisService.set(otpKey, secret, "EX", 180);
    await this.redisService.set(otpRequestKey, "requested", "EX", 360);
  }

  private async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    if (!phoneNumber) {
      logger.error("AuthService.sendOtp: Phone number is required to send OTP");
      throw new UserPhoneNumberIsRequiredError("Phone number is required");
    }

    logger.debug(`AuthService.sendOtp: Sending OTP to ${phoneNumber}`);
    try {
      await this.twilioClient.messages.create({
        body: `Your OTP for NOVATECH SOL is ${otp}`,
        from: this.configService.get<string>("TWILIO_PHONE_NUMBER"),
        to: phoneNumber,
      });
      logger.debug(
        `AuthService.sendOtp: OTP sent successfully to ${phoneNumber}`,
      );
    } catch (error: any) {
      logger.error(`Failed to send OTP. Error: ${error}`);
      throw new InternalServerErrorException("Failed to send OTP.");
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
        `AuthService.validateOtp: No OTP request found for this number ${phoneNumber}`,
      );
      throw new UserRetryOtpError(`Please request a new OTP.`);
    }

    const storedSecret = await this.redisService.get(otpKey);
    if (!storedSecret) {
      logger.error("AuthService.validateOtp: OTP expired");
      throw new UserRetryOtpError(`Please request a new OTP.`);
    }

    const isValid = this.otpService.verifyOTP(inputOtp, storedSecret);
    if (!isValid) {
      logger.error("AuthService.validateOtp: Invalid OTP");
      throw new UserRetryOtpError(`Please request a new OTP.`);
    }

    await this.redisService.del(otpKey);
    await this.redisService.del(otpRequestKey);
    logger.debug("AuthService.validateOtp: OTP validated successfully");
  }
}
