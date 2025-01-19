import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Logger,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";

import {
  AuthPostLoginSwagger,
  AuthPostOtpRequestSwagger,
  AuthPostOtpVerifySwagger,
  AuthPostRefreshTokenSwagger,
} from "../../shared/decorators/auth/auth.decorators";
import { UserRoleEnum } from "../../shared/enums";
import { IApiResponse } from "../../shared/interface";
import { AuthService } from "./auth.service";
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("otp/request")
  @AuthPostOtpRequestSwagger()
  async requestOtp(
    @Body("phoneNumber") phoneNumber: string,
  ): Promise<IApiResponse<null>> {
    this.logger.debug(
      `AuthController.requestOtp: Requesting OTP for ${phoneNumber}`,
    );
    await this.authService.requestOtp(phoneNumber);

    this.logger.log(
      `AuthController.requestOtp: OTP sent successfully to ${phoneNumber}`,
    );
    return { success: true, message: "OTP sent successfully.", data: null };
  }

  @Post("otp/verify")
  @AuthPostOtpVerifySwagger()
  async verifyOtp(
    @Body() body: { phoneNumber: string; otp: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<IApiResponse<null>> {
    const { phoneNumber, otp } = body;

    this.logger.debug(
      `AuthController.verifyOtp: Verifying OTP for ${phoneNumber}`,
    );

    const onboardingToken = await this.authService.signupInitiate(
      phoneNumber,
      otp,
    );

    response.setHeader("onboarding_token", onboardingToken);

    this.logger.log(
      `AuthController.verifyOtp: OTP verified successfully for ${phoneNumber}`,
    );
    return { success: true, message: "OTP verified successfully.", data: null };
  }

  @Post("login")
  @AuthPostLoginSwagger()
  async login(
    @Body() body: { phoneNumber: string; otp: string },
    @Headers("role") role: UserRoleEnum,
    @Res() response: Response,
  ): Promise<void> {
    const { phoneNumber, otp } = body;
    this.logger.debug(
      `AuthController.login: Logging in with OTP for ${phoneNumber}`,
    );
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

    this.logger.log(
      `AuthController.login: Login successful for ${phoneNumber}`,
    );
    response.json({
      success: true,
      message: "Login successful.",
      data: { accessToken },
    });
  }

  @Post("refresh-token")
  @AuthPostRefreshTokenSwagger()
  async refreshToken(
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    this.logger.debug("AuthController.refreshToken: Refreshing tokens");

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

    this.logger.log(
      "AuthController.refreshToken: Tokens refreshed successfully",
    );

    response.json({
      success: true,
      message: "Tokens refreshed successfully.",
      data: { accessToken },
    });
  }
}
