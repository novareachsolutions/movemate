import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { DeleteResult, UpdateResult } from "typeorm";

import { User } from "../../entity/User";
import { Roles } from "../../shared/decorators/roles.decorator";
import { UserRoleEnum } from "../../shared/enums";
import { UnauthorizedError } from "../../shared/errors/authErrors";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { RoleGuard } from "../../shared/guards/roles.guard";
import { IApiResponse, ICustomRequest } from "../../shared/interface";
import { UserService } from "./user.service";
import { TCreateUser, TGetUserProfile, TUpdateUser } from "./user.types";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new user.
   * POST /user/signup
   */
  @Post("signup")
  @UseGuards(OnboardingGuard)
  async createUser(
    @Body() createUserDto: TCreateUser,
    @Req() request: ICustomRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IApiResponse<{ accessToken: string }>> {
    const phoneNumberFromGuard = request.user.phoneNumber;
    if (
      createUserDto.phoneNumber &&
      createUserDto.phoneNumber !== phoneNumberFromGuard
    ) {
      throw new UnauthorizedError(
        "The provided phone number does not match the authenticated user's phone number.",
      );
    }
    createUserDto.phoneNumber = phoneNumberFromGuard;
    createUserDto.role = UserRoleEnum.CUSTOMER;

    const { accessToken, refreshToken } =
      await this.userService.createUser(createUserDto);

    response.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>("ENVIRONMENT") === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    return {
      success: true,
      message: "User created successfully.",
      data: { accessToken },
    };
  }

  /**
   * Get the authenticated user's profile.
   * GET /user/me
   */
  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.CUSTOMER)
  async getCurrentUser(
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<User>> {
    const userId = request.user.id;

    const user = await this.userService.getUserById(userId);
    return {
      success: true,
      message: "User profile retrieved successfully.",
      data: user,
    };
  }

  /**
   * Get user profile by ID. This controller is for admin
   * GET /user/profile/:id
   */
  @Get("profile/:id")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  async getUserById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<IApiResponse<User>> {
    const user = await this.userService.getUserById(id);
    return {
      success: true,
      message: "User profile retrieved successfully.",
      data: user,
    };
  }

  /**
   * Get user profile by specific criteria.
   * POST /user/profile
   */
  @Post("profile")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  async getUserProfile(
    @Body() getUserProfileDto: TGetUserProfile,
  ): Promise<IApiResponse<User>> {
    const user = await this.userService.getUserProfile(getUserProfileDto);
    return {
      success: true,
      message: "User profile retrieved successfully.",
      data: user,
    };
  }

  /**
   * Get all users.
   * GET /user/list
   */
  @Get("list")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  async getAllUsers(): Promise<IApiResponse<User[]>> {
    const users = await this.userService.getAllUsers();
    return {
      success: true,
      message: "All users retrieved successfully.",
      data: users,
    };
  }

  /**
   * Update user profile.
   * PUT /user/profile/:id
   */
  @Patch("profile/:id")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  async updateUser(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: TUpdateUser,
  ): Promise<IApiResponse<UpdateResult>> {
    const result = await this.userService.updateUser(id, updateUserDto);
    return {
      success: true,
      message: "User profile updated successfully.",
      data: result,
    };
  }

  /**
   * Delete a user.
   * DELETE /user/profile/:id
   */
  @Delete("profile/:id")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  async deleteUser(
    @Param("id", ParseIntPipe) id: string,
  ): Promise<IApiResponse<DeleteResult>> {
    const result = await this.userService.deleteUser(id);
    return {
      success: true,
      message: "User deleted successfully.",
      data: result,
    };
  }
}
