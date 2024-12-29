import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";

import { UserRoleEnum } from "../../shared/enums";
import { IApiResponse } from "../../shared/interface";
import { AuthService } from "./auth.service";
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("otp/request")
  async requestOtp(
    @Body("phoneNumber") phoneNumber: string,
  ): Promise<IApiResponse<null>> {
    await this.authService.requestOtp(phoneNumber);
    return { success: true, message: "OTP sent successfully.", data: null };
  }

  @Post("otp/verify")
  async verifyOtp(
    @Body() body: { phoneNumber: string; otp: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<IApiResponse<null>> {
    const { phoneNumber, otp } = body;
    const onboardingToken = await this.authService.signupInitiate(
      phoneNumber,
      otp,
    );

    response.setHeader("onboarding_token", onboardingToken);
    return { success: true, message: "OTP verified successfully.", data: null };
  }

  @Post("login")
  async login(
    @Body() body: { phoneNumber: string; otp: string },
    @Headers("role") role: UserRoleEnum,
    @Res() response: Response,
  ): Promise<void> {
    const { phoneNumber, otp } = body;
    const { accessToken, refreshToken } = await this.authService.login(
      phoneNumber,
      otp,
      role,
    );

    response.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>("ENVIRONMENT") === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    response.json({
      success: true,
      message: "Login successful.",
      data: { accessToken },
    });
  }

  @Post("refresh_token")
  async refreshToken(
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    const refreshToken = request.cookies["refresh_token"];
    if (!refreshToken) {
      throw new ForbiddenException("Refresh token not found.");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    response.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>("ENVIRONMENT") === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    response.json({
      success: true,
      message: "Tokens refreshed successfully.",
      data: { accessToken },
    });
  }
}
