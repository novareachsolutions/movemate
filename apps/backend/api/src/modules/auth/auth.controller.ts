import {
  Controller,
  Post,
  Body,
  Res,
  Headers,
  Req,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { UserRoleEnum } from 'src/shared/enums';
import { logger } from 'src/logger';
import { ApiResponse } from 'src/shared/interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('otp/request')
  async requestOtp(@Body() phoneNumber: string): Promise<ApiResponse<null>> {
    logger.debug(`AuthController. requestOtp: Received OTP request for phoneNumber: ${phoneNumber}`);
    try {
      await this.authService.requestOtp(phoneNumber);
      logger.debug('AuthController. requestOtp: OTP sent successfully');

      return { success: true, message: 'OTP sent successfully.', data: null };
    } catch (error) {
      logger.error(`AuthController. requestOtp: Error sending OTP: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to send OTP. Please try again later.'
      );
    }
  }

  @Post('otp/verify')
  async verifyOtp(
    @Body() body: { phoneNumber: string; otp: string },
    @Res() res: Response,
  ): Promise<ApiResponse<null>> {
    const { phoneNumber, otp } = body;
    logger.debug(`AuthController. verifyOtp: Verifying OTP for phoneNumber: ${phoneNumber}`);
    try {
      const response = await this.authService.signupInitiate(phoneNumber, otp);
      if (response.success) {
        logger.debug('AuthController. verifyOtp: OTP verification successful, setting onboarding token cookie');
        res.setHeader('x-onboarding-token', response.data.onboardingToken);
      }
      return { success: response.success, message: response.message, data: null };
    } catch (error) {
      logger.error(`AuthController. verifyOtp: Error verifying OTP: ${error.message}`);
      throw new BadRequestException(
        'Invalid OTP or phone number. Please try again.'
      );
    }
  }

  @Post('login')
  async login(
    @Body() body: { phoneNumber: string; otp: string },
    @Headers('role') role: UserRoleEnum,
    @Res() res: Response,
  ): Promise<ApiResponse<null>> {
    const { phoneNumber, otp } = body;
    logger.debug(`AuthController. login: Login request for phoneNumber: ${phoneNumber}, role: ${role}`);
    try {
      const response = await this.authService.login(phoneNumber, otp, role);
      if (response.success) {
        logger.debug('AuthController. login: Login successful, setting access and refresh token cookies');
        res.cookie('access_token', response.data.accessToken, {
          httpOnly: true,
          secure: process.env.ENVIRONMEMNT === 'production',
          maxAge: 60 * 60 * 1000,
        });
        res.cookie('refresh_token', response.data.refreshToken, {
          httpOnly: true,
          secure: process.env.ENVIRONMEMNT === 'production',
          maxAge: 60 * 60 * 24 * 7 * 1000,
        });
      }
      return { success: response.success, message: response.message, data: null };
    } catch (error) {
      logger.error(`AuthController. login: Error during login: ${error.message}`);
      throw new UnauthorizedException(
        'Invalid credentials or role. Please try again.'
      );
    }
  }

  @Post('refresh-token')
  async refreshToken(@Res() res: Response, @Req() req: Request): Promise<ApiResponse<null>> {
    const refreshToken = req.cookies['refresh_token'];
    logger.debug('AuthController. refreshToken: Refresh token request received');
    if (!refreshToken) {
      logger.error('AuthController. refreshToken: Refresh token not found in cookies');
      throw new ForbiddenException('Refresh token not found.');
    }
    try {
      const response = await this.authService.refreshToken(refreshToken);
      if (response.success) {
        logger.debug('AuthController. refreshToken: Refresh token validated, setting new tokens in cookies');
        res.cookie('access_token', response.data.accessToken, {
          httpOnly: true,
          secure: process.env.ENVIRONMEMNT === 'production',
          maxAge: 60 * 60 * 1000,
        });
        res.cookie('refresh_token', response.data.refreshToken, {
          httpOnly: true,
          secure: process.env.ENVIRONMEMNT === 'production',
          maxAge: 60 * 60 * 24 * 7 * 1000,
        });
      }
      return { success: response.success, message: response.message, data: null };
    } catch (error) {
      logger.error(`AuthController. refreshToken: Error during token refresh: ${error.message}`);
      throw new UnauthorizedException(
        'Failed to refresh token. Please log in again.'
      );
    }
  }
}
