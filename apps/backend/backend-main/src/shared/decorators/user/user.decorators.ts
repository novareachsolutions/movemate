import { applyDecorators } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";

import {
  CreateUserDto,
  UpdateUserDto,
} from "../../../modules/user/dto/user.dto";
import { UserRoleEnum } from "../../enums";

export const UserPostSignUpSwagger = (): any => {
  return applyDecorators(
    ApiOperation({
      summary: "Create new user",
      description: "Create a new customer account after OTP verification",
    }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({
      status: 201,
      description: "User created successfully",
      schema: {
        example: {
          success: true,
          message: "User created successfully.",
          data: 1, // userId
        },
      },
    }),
    ApiResponse({
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
    }),
    ApiResponse({
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
    }),
  );
};

export const UserGetByIdSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({
      summary: "Get current user profile",
      description: "Retrieve the authenticated customer's profile",
    }),
    ApiResponse({
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
    }),
    ApiResponse({
      status: 404,
      description: "User not found",
      schema: {
        example: {
          success: false,
          message: "User not found",
          statusCode: 404,
        },
      },
    }),
  );
};

export const UserGetProfileByIdSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({
      summary: "Get user by ID (Admin)",
      description: "Retrieve a user's profile by their ID. Admin access only.",
    }),
    ApiParam({
      name: "id",
      type: "string",
      format: "uuid",
      description: "User ID",
    }),
    ApiResponse({
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
    }),
    ApiResponse({
      status: 404,
      description: "User not found",
      schema: {
        example: {
          success: false,
          message: "User not found",
          statusCode: 404,
        },
      },
    }),
  );
};

export const UserGetAllSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({
      summary: "Get all users (Admin)",
      description: "Retrieve a list of all users. Admin access only.",
    }),
    ApiResponse({
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
    }),
  );
};

export const UserPatchProfileByIdSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({
      summary: "Update user profile (Admin)",
      description: "Update a user's profile information. Admin access only.",
    }),
    ApiParam({
      name: "id",
      type: "string",
      format: "uuid",
      description: "User ID",
    }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({
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
    }),
    ApiResponse({
      status: 404,
      description: "User not found",
      schema: {
        example: {
          success: false,
          message: "User with ID 1 not found",
          statusCode: 404,
        },
      },
    }),
  );
};

export const UserDeleteProfileByIdSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({
      summary: "Delete user (Admin)",
      description: "Soft delete a user account. Admin access only.",
    }),
    ApiParam({
      name: "id",
      type: "string",
      format: "uuid",
      description: "User ID",
    }),
    ApiResponse({
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
    }),
    ApiResponse({
      status: 404,
      description: "User not found",
      schema: {
        example: {
          success: false,
          message: "User not found",
          statusCode: 404,
        },
      },
    }),
  );
};
