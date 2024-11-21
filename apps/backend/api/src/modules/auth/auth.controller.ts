import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(
    @Body() requestOtpDto,
  ): Promise<{ success: boolean; message: string }> {
    const { phoneNumber } = requestOtpDto;
    return this.authService.requestOtp(phoneNumber);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto, @Res() res: Response): Promise<void> {
    const { phoneNumber, otp } = verifyOtpDto;
    const { success, message, onboardingToken } =
      await this.authService.signupInitiate(phoneNumber, otp);
    res.cookie('onboarding_token', onboardingToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatus.OK).json({ success, message });
  }
}
