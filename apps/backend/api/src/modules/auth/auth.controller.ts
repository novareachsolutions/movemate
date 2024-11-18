import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
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
  async requestOtp(@Body() requestOtpDto: { phoneNumber: string }): Promise<any> {
    const { phoneNumber } = requestOtpDto;
    logger.debug(`Received OTP request for phoneNumber: ${phoneNumber}`);
    try {
      await this.authService.requestOtp(phoneNumber);
      logger.debug('OTP sent successfully');
      return { success: true, message: 'OTP sent successfully.', data: null };
    } catch (error) {
      logger.error(`Error sending OTP: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to send OTP. Please try again later.'
      );
    }
  }

  @Post('otp/verify')
  async verifyOtp(
    @Body() verifyOtpDto: { phoneNumber: string; otp: string },
    @Res() res: Response,
  ): Promise<ApiResponse<any>> {
    const { phoneNumber, otp } = verifyOtpDto;
    logger.debug(`Verifying OTP for phoneNumber: ${phoneNumber}`);
    try {
      const response = await this.authService.signupInitiate(phoneNumber, otp);
      if (response.success) {
        logger.debug('OTP verification successful, setting onboarding token cookie');
        res.setHeader('x-onboarding-token', response.data.onboardingToken);
      }
      return { success: response.success, message: response.message };
    } catch (error) {
      logger.error(`Error verifying OTP: ${error.message}`);
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
  ): Promise<ApiResponse<any>> {
    const { phoneNumber, otp } = body;
    logger.debug(`Login request for phoneNumber: ${phoneNumber}, role: ${role}`);
    try {
      const response = await this.authService.login(phoneNumber, otp, role);
      if (response.success) {
        logger.debug('Login successful, setting access and refresh token cookies');
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
      logger.error(`Error during login: ${error.message}`);
      throw new UnauthorizedException(
        'Invalid credentials or role. Please try again.'
      );
    }
  }

  @Post('refresh-token')
  async refreshToken(@Res() res: Response, @Req() req: Request): Promise<ApiResponse<any>> {
    const refreshToken = req.cookies['refresh_token'];
    logger.debug('Refresh token request received');
    if (!refreshToken) {
      logger.error('Refresh token not found in cookies');
      throw new ForbiddenException('Refresh token not found.');
    }
    try {
      const response = await this.authService.refreshToken(refreshToken);
      if (response.success) {
        logger.debug('Refresh token validated, setting new tokens in cookies');
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
      return { success: response.success, message: response.message };
    } catch (error) {
      logger.error(`Error during token refresh: ${error.message}`);
      throw new UnauthorizedException(
        'Failed to refresh token. Please log in again.'
      );
    }
  }
}
