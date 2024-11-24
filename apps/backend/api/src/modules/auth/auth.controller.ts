import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { logger } from '../../logger';
import { UserRoleEnum } from '../../shared/enums';
import { IApiResponse } from '../../shared/interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  async requestOtp(
    @Body('phoneNumber') phoneNumber: string,
  ): Promise<IApiResponse<null>> {
    await this.authService.requestOtp(phoneNumber);

    return { success: true, message: 'OTP sent successfully.', data: null };
  }

  @Post('otp/verify')
  async verifyOtp(
    @Body() body: { phoneNumber: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<IApiResponse<null>> {
    const { phoneNumber, otp } = body;
    logger.debug(
      `AuthController.verifyOtp: Verifying OTP for phoneNumber: ${phoneNumber}`,
    );
    const onboardingToken = await this.authService.signupInitiate(
      phoneNumber,
      otp,
    );

    res.setHeader('x-onboarding-token', onboardingToken);

    return { success: true, message: 'OTP verified successfully.', data: null };
  }

  @Post('login')
  async login(
    @Body() body: { phoneNumber: string; otp: string },
    @Headers('role') role: UserRoleEnum,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IApiResponse<null>> {
    const { phoneNumber, otp } = body;
    logger.debug(
      `AuthController.login: Login request for phoneNumber: ${phoneNumber}, role: ${role}`,
    );
    const { accessToken, refreshToken } = await this.authService.login(
      phoneNumber,
      otp,
      role,
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.ENVIRONMEMNT === 'production',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.ENVIRONMEMNT === 'production',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return { success: true, message: 'Login successful.', data: null };
  }

  @Post('refresh-token')
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<IApiResponse<null>> {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token not found.');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);
    logger.debug(
      'AuthController.refreshToken: Refresh token validated, setting new tokens in cookies',
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.ENVIRONMEMNT === 'production',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.ENVIRONMEMNT === 'production',
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return {
      success: true,
      message: 'Tokens refreshed successfully.',
      data: null,
    };
  }
}
