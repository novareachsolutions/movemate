import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { DeleteResult, UpdateResult } from "typeorm";

import { User } from "../../entity/User";
import { Roles } from "../../shared/decorators/roles.decorator";
import { UserRoleEnum } from "../../shared/enums";
import { UnauthorizedError } from "../../shared/errors/authErrors";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { IApiResponse, ICustomRequest } from "../../shared/interface";
import {
  CreateUserDto,
  GetUserProfileDto,
  UpdateUserDto,
} from "./dto/user.dto";
import { UserService } from "./user.service";
import { TCreateUser, TGetUserProfile, TUpdateUser } from "./user.types";
@ApiTags("Users")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user.
   * POST /user/signup
   */
  @Post("signup")
  @UseGuards(OnboardingGuard)
  @ApiOperation({
    summary: "Create new user",
    description: "Create a new customer account after OTP verification",
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    schema: {
      example: {
        success: true,
        message: "User created successfully.",
        data: 1, // userId
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "User already exists",
    schema: {
      example: {
        success: false,
        message:
          "User with the provided email john.doe@example.com or phone number +61412345678 already exists.",
        statusCode: 409,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Phone number mismatch",
    schema: {
      example: {
        success: false,
        message:
          "The provided phone number does not match the authenticated user's phone number.",
        statusCode: 401,
      },
    },
  })
  async createUser(
    @Body() createUserDto: TCreateUser,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<number>> {
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
    const userId = await this.userService.createUser(createUserDto);
    return {
      success: true,
      message: "User created successfully.",
      data: userId,
    };
  }

  /**
   * Get the authenticated user's profile.
   * GET /user/me
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get current user profile",
    description: "Retrieve the authenticated customer's profile",
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    schema: {
      example: {
        success: true,
        message: "User profile retrieved successfully.",
        data: {
          id: 1,
          phoneNumber: "+61412345678",
          role: UserRoleEnum.CUSTOMER,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          street: "123 Main St",
          suburb: "Sydney",
          state: "NSW",
          postalCode: 2000,
          createdAt: "2024-03-26T10:00:00.000Z",
          updatedAt: "2024-03-26T10:00:00.000Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    schema: {
      example: {
        success: false,
        message: "User not found",
        statusCode: 404,
      },
    },
  })
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
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get user by ID (Admin)",
    description: "Retrieve a user's profile by their ID. Admin access only.",
  })
  @ApiParam({
    name: "id",
    type: "string",
    format: "uuid",
    description: "User ID",
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    schema: {
      example: {
        success: true,
        message: "User profile retrieved successfully.",
        data: {
          id: 1,
          phoneNumber: "+61412345678",
          role: UserRoleEnum.CUSTOMER,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          street: "123 Main St",
          suburb: "Sydney",
          state: "NSW",
          postalCode: 2000,
          createdAt: "2024-03-26T10:00:00.000Z",
          updatedAt: "2024-03-26T10:00:00.000Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    schema: {
      example: {
        success: false,
        message: "User not found",
        statusCode: 404,
      },
    },
  })
  async getUserById(
    @Param("id", ParseUUIDPipe) id: number,
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
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get user by criteria (Admin)",
    description:
      "Search for a user by email or phone number. Admin access only.",
  })
  @ApiBody({ type: GetUserProfileDto })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    schema: {
      example: {
        success: true,
        message: "User profile retrieved successfully.",
        data: {
          id: 1,
          phoneNumber: "+61412345678",
          role: UserRoleEnum.CUSTOMER,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          street: "123 Main St",
          suburb: "Sydney",
          state: "NSW",
          postalCode: 2000,
          createdAt: "2024-03-26T10:00:00.000Z",
          updatedAt: "2024-03-26T10:00:00.000Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    schema: {
      example: {
        success: false,
        message: "User not found",
        statusCode: 404,
      },
    },
  })
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
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get all users (Admin)",
    description: "Retrieve a list of all users. Admin access only.",
  })
  @ApiResponse({
    status: 200,
    description: "Users retrieved successfully",
    schema: {
      example: {
        success: true,
        message: "All users retrieved successfully.",
        data: [
          {
            id: 1,
            phoneNumber: "+61412345678",
            role: UserRoleEnum.CUSTOMER,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            street: "123 Main St",
            suburb: "Sydney",
            state: "NSW",
            postalCode: 2000,
            createdAt: "2024-03-26T10:00:00.000Z",
            updatedAt: "2024-03-26T10:00:00.000Z",
          },
        ],
      },
    },
  })
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
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Update user profile (Admin)",
    description: "Update a user's profile information. Admin access only.",
  })
  @ApiParam({
    name: "id",
    type: "string",
    format: "uuid",
    description: "User ID",
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: "User profile updated successfully",
    schema: {
      example: {
        success: true,
        message: "User profile updated successfully.",
        data: {
          generatedMaps: [],
          raw: [],
          affected: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    schema: {
      example: {
        success: false,
        message: "User with ID 1 not found",
        statusCode: 404,
      },
    },
  })
  async updateUser(
    @Param("id", ParseUUIDPipe) id: number,
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
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Delete user (Admin)",
    description: "Soft delete a user account. Admin access only.",
  })
  @ApiParam({
    name: "id",
    type: "string",
    format: "uuid",
    description: "User ID",
  })
  @ApiResponse({
    status: 200,
    description: "User deleted successfully",
    schema: {
      example: {
        success: true,
        message: "User deleted successfully.",
        data: {
          raw: [],
          affected: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    schema: {
      example: {
        success: false,
        message: "User not found",
        statusCode: 404,
      },
    },
  })
  async deleteUser(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<IApiResponse<DeleteResult>> {
    const result = await this.userService.deleteUser(id);
    return {
      success: true,
      message: "User deleted successfully.",
      data: result,
    };
  }
}
