import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiOperation, ApiResponse } from "@nestjs/swagger";

import {
  LoginDto,
  RequestOtpDto,
  VerifyOtpDto,
} from "../../../modules/auth/dto/auth.dto";
import { UserRoleEnum } from "../../enums";

export const AuthPostOtpRequestSwagger = (): any => {
  return applyDecorators(
    ApiOperation({
      summary: "Request OTP",
      description: "Request a one-time password to be sent via SMS",
    }),
    ApiBody({ type: RequestOtpDto }),
    ApiResponse({
      status: 200,
      description: "OTP sent successfully",
      schema: {
        example: {
          success: true,
          message: "OTP sent successfully.",
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Phone number is required",
      schema: {
        example: {
          success: false,
          message: "Phone number is required",
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: 429,
      description: "Too many requests",
      schema: {
        example: {
          success: false,
          message: "Please wait 30 seconds before requesting a new OTP.",
          statusCode: 429,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Phone number blocked",
      schema: {
        example: {
          success: false,
          message: "Too many OTP requests. Please try again after 24 hours.",
          statusCode: 403,
        },
      },
    }),
  );
};

export const AuthPostOtpVerifySwagger = (): any => {
  return applyDecorators(
    ApiOperation({
      summary: "Verify OTP",
      description: "Verify the OTP received via SMS for signup",
    }),
    ApiBody({ type: VerifyOtpDto }),
    ApiResponse({
      status: 200,
      description: "OTP verified successfully",
      headers: {
        onboarding_token: {
          description: "Token for completing signup",
          schema: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
      schema: {
        example: {
          success: true,
          message: "OTP verified successfully.",
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: "Phone number already registered",
      schema: {
        example: {
          success: false,
          message: "Phone number +61412345678 is already registered",
          statusCode: 409,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Invalid OTP",
      schema: {
        example: {
          success: false,
          message: "Please request a new OTP.",
          statusCode: 401,
        },
      },
    }),
  );
};

export const AuthPostLoginSwagger = (): any => {
  return applyDecorators(
    ApiOperation({
      summary: "User Login",
      description: "Login with phone number, OTP and role",
    }),
    ApiBody({ type: LoginDto }),
    ApiHeader({
      name: "role",
      enum: UserRoleEnum,
      required: true,
      description: "User role for login",
    }),
    ApiResponse({
      status: 200,
      description: "Login successful",
      schema: {
        example: {
          success: true,
          message: "Login successful.",
          data: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "User not found",
      schema: {
        example: {
          success: false,
          message: "User with phone number +61412345678 not found",
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Role mismatch",
      schema: {
        example: {
          success: false,
          message: "Role mismatch. Expected AGENT",
          statusCode: 403,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Invalid OTP",
      schema: {
        example: {
          success: false,
          message: "Please request a new OTP.",
          statusCode: 401,
        },
      },
    }),
  );
};

export const AuthPostRefreshTokenSwagger = (): any => {
  return applyDecorators(
    ApiOperation({
      summary: "Refresh Token",
      description: "Get new access token using refresh token",
    }),
    ApiResponse({
      status: 200,
      description: "Tokens refreshed successfully",
      schema: {
        example: {
          success: true,
          message: "Tokens refreshed successfully.",
          data: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Refresh token not found",
      schema: {
        example: {
          success: false,
          message: "Refresh token not found.",
          statusCode: 403,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Invalid refresh token",
      schema: {
        example: {
          success: false,
          message: "Failed to refresh token",
          statusCode: 401,
        },
      },
    }),
  );
};
