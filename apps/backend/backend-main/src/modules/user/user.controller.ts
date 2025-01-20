import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DeleteResult, UpdateResult } from "typeorm";

import { User } from "../../entity/User";
import { Roles } from "../../shared/decorators/roles.decorator";
import {
  UserDeleteProfileByIdSwagger,
  UserGetAllSwagger,
  UserGetByIdSwagger,
  UserGetProfileByIdSwagger,
  UserPatchProfileByIdSwagger,
  UserPostSignUpSwagger,
} from "../../shared/decorators/user/user.decorators";
import { UserRoleEnum } from "../../shared/enums";
import { UnauthorizedError } from "../../shared/errors/authErrors";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { IApiResponse, ICustomRequest } from "../../shared/interface";
import { UserService } from "./user.service";
import { TCreateUser, TGetUserProfile, TUpdateUser } from "./user.types";
@ApiTags("Users")
@Controller("user")
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user.
   * POST /user/signup
   */
  @Post("signup")
  @UseGuards(OnboardingGuard)
  @UserPostSignUpSwagger()
  async createUser(
    @Body() createUserDto: TCreateUser,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<number>> {
    const phoneNumberFromGuard = request.user.phoneNumber;
    if (
      createUserDto.phoneNumber &&
      createUserDto.phoneNumber !== phoneNumberFromGuard
    ) {
      this.logger.warn(
        `UserController.createUser: The provided phone number ${createUserDto.phoneNumber} does not match the authenticated user's phone number ${phoneNumberFromGuard}.`,
      );
      throw new UnauthorizedError(
        "The provided phone number does not match the authenticated user's phone number.",
      );
    }
    createUserDto.phoneNumber = phoneNumberFromGuard;
    createUserDto.role = UserRoleEnum.CUSTOMER;

    this.logger.debug(
      `UserController.createUser: Creating user with data: ${JSON.stringify(
        createUserDto,
      )}`,
    );
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
  @Roles(UserRoleEnum.CUSTOMER)
  @UserGetByIdSwagger()
  async getCurrentUser(
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<User>> {
    const userId = request.user.id;

    this.logger.debug(
      `UserController.getCurrentUser: Retrieving user profile for user ID: ${userId}`,
    );

    const user = await this.userService.getUserById(userId);

    if (!user) {
      this.logger.error(
        `UserController.getCurrentUser: User with ID ${userId} not found.`,
      );
      throw new UnauthorizedError(`User with ID ${userId} not found.`);
    }

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
  @UserGetProfileByIdSwagger()
  async getUserById(
    @Param("id", ParseUUIDPipe) id: number,
  ): Promise<IApiResponse<User>> {
    this.logger.debug(
      `UserController.getUserById: Retrieving user with ID ${id}`,
    );
    const user = await this.userService.getUserById(id);
    if (!user) {
      this.logger.error(
        `UserController.getUserById: User with ID ${id} not found.`,
      );
      throw new UnauthorizedError(`User with ID ${id} not found.`);
    }
    this.logger.log(
      `UserController.getUserById: User with ID ${id} retrieved successfully.`,
    );
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
  @UserGetProfileByIdSwagger()
  async getUserProfile(
    @Body() getUserProfileDto: TGetUserProfile,
  ): Promise<IApiResponse<User>> {
    this.logger.debug(
      `UserController.getUserProfile: Retrieving user profile with data: ${JSON.stringify(
        getUserProfileDto,
      )}`,
    );
    const user = await this.userService.getUserProfile(getUserProfileDto);
    if (!user) {
      this.logger.error(
        `UserController.getUserProfile: User with criteria ${JSON.stringify(
          getUserProfileDto,
        )} not found.`,
      );
      throw new UnauthorizedError(`User not found.`);
    }
    this.logger.log(
      `UserController.getUserProfile: User profile retrieved successfully.`,
    );
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
  @UserGetAllSwagger()
  async getAllUsers(): Promise<IApiResponse<User[]>> {
    this.logger.debug(`UserController.getAllUsers: Retrieving all users.`);
    const users = await this.userService.getAllUsers();
    this.logger.log(
      `UserController.getAllUsers: All users retrieved successfully.`,
    );
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
  @UserPatchProfileByIdSwagger()
  async updateUser(
    @Param("id", ParseUUIDPipe) id: number,
    @Body() updateUserDto: TUpdateUser,
  ): Promise<IApiResponse<UpdateResult>> {
    this.logger.debug(
      `UserController.updateUser: Updating user with ID ${id} with data: ${JSON.stringify(
        updateUserDto,
      )}`,
    );
    const result = await this.userService.updateUser(id, updateUserDto);
    this.logger.log(
      `UserController.updateUser: User profile updated successfully for user ID ${id}.`,
    );
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
  @UserDeleteProfileByIdSwagger()
  async deleteUser(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<IApiResponse<DeleteResult>> {
    this.logger.debug(`UserController.deleteUser: Deleting user with ID ${id}`);
    const result = await this.userService.deleteUser(id);
    this.logger.log(
      `UserController.deleteUser: User deleted successfully for user ID ${id}.`,
    );
    return {
      success: true,
      message: "User deleted successfully.",
      data: result,
    };
  }
}
