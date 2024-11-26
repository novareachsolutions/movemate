import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Get,
  ParseUUIDPipe,
  Put,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { TCreateUser, TUpdateUser, TGetUserProfile } from "./user.types";
import { UpdateResult, DeleteResult } from "typeorm";
import { User } from "../../entity/User";
import { IApiResponse } from "../../shared/interface";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user.
   * POST /user/signup
   */
  @Post("signup")
  async createUser(
    @Body() createUserDto: TCreateUser
  ): Promise<IApiResponse<User>> {
    try {
      const user = await this.userService.createUser(createUserDto);
      return {
        success: true,
        message: "User created successfully.",
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: "User creation failed.",
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  /**
   * Get user profile by ID.
   * GET /user/profile/:id
   */
  @Get("profile/:id")
  async getUserById(
    @Param("id", ParseUUIDPipe) id: number
  ): Promise<IApiResponse<User>> {
    try {
      const user = await this.userService.getUserById(id);
      return {
        success: true,
        message: "User profile retrieved successfully.",
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: "User profile retrieval failed.",
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  /**
   * Get user profile by specific criteria.
   * POST /user/profile
   */
  @Post("profile")
  async getUserProfile(
    @Body() getUserProfileDto: TGetUserProfile
  ): Promise<IApiResponse<User>> {
    try {
      const user = await this.userService.getUserProfile(getUserProfileDto);
      return {
        success: true,
        message: "User profile retrieved successfully.",
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: "User profile retrieval failed.",
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  /**
   * Get all users.
   * GET /user/list
   */
  @Get("list")
  async getAllUsers(): Promise<IApiResponse<User[]>> {
    try {
      const users = await this.userService.getAllUsers();
      return {
        success: true,
        message: "All users retrieved successfully.",
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        message: "User retrieval failed.",
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  /**
   * Update user profile.
   * PUT /user/profile/:id
   */
  @Put("profile/:id")
  async updateUser(
    @Param("id", ParseUUIDPipe) id: number,
    @Body() updateUserDto: TUpdateUser
  ): Promise<IApiResponse<UpdateResult>> {
    try {
      const result = await this.userService.updateUser(id, updateUserDto);
      return {
        success: true,
        message: "User profile updated successfully.",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: "User profile update failed.",
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  /**
   * Delete a user.
   * DELETE /user/profile/:id
   */
  @Delete("profile/:id")
  async deleteUser(
    @Param("id", ParseUUIDPipe) id: string
  ): Promise<IApiResponse<DeleteResult>> {
    try {
      const result = await this.userService.deleteUser(id);
      return {
        success: true,
        message: "User deleted successfully.",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: "User deletion failed.",
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }
}
