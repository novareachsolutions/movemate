import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { UserRoleEnum } from "../../../shared/enums";

export class CreateUserDto {
  @ApiProperty({
    description: "User phone number",
    example: "+61412345678",
  })
  phoneNumber: string;

  @ApiProperty({
    enum: UserRoleEnum,
    description: "User role",
    example: UserRoleEnum.CUSTOMER,
  })
  role: UserRoleEnum;

  @ApiProperty({
    description: "User first name",
    example: "John",
  })
  firstName: string;

  @ApiPropertyOptional({
    description: "User last name",
    example: "Doe",
  })
  lastName?: string;

  @ApiProperty({
    description: "User email",
    example: "john.doe@example.com",
  })
  email: string;

  @ApiPropertyOptional({
    description: "Street address",
    example: "123 Main St",
  })
  street?: string;

  @ApiPropertyOptional({
    description: "Suburb",
    example: "Sydney",
  })
  suburb?: string;

  @ApiPropertyOptional({
    description: "State",
    example: "NSW",
  })
  state?: string;

  @ApiPropertyOptional({
    description: "Postal code",
    example: 2000,
  })
  postalCode?: number;
}

export class GetUserProfileDto {
  @ApiPropertyOptional({
    description: "User phone number",
    example: "+61412345678",
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: "User email",
    example: "john.doe@example.com",
  })
  email?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: "User first name",
    example: "John",
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: "User last name",
    example: "Doe",
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: "Street address",
    example: "123 Main St",
  })
  street?: string;

  @ApiPropertyOptional({
    description: "Suburb",
    example: "Sydney",
  })
  suburb?: string;

  @ApiPropertyOptional({
    description: "State",
    example: "NSW",
  })
  state?: string;

  @ApiPropertyOptional({
    description: "Postal code",
    example: 2000,
  })
  postalCode?: number;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "+61412345678" })
  phoneNumber: string;

  @ApiProperty({ enum: UserRoleEnum, example: UserRoleEnum.CUSTOMER })
  role: UserRoleEnum;

  @ApiProperty({ example: "John" })
  firstName: string;

  @ApiProperty({ example: "Doe" })
  lastName: string;

  @ApiProperty({ example: "john.doe@example.com" })
  email: string;

  @ApiProperty({ example: "123 Main St" })
  street: string;

  @ApiProperty({ example: "Sydney" })
  suburb: string;

  @ApiProperty({ example: "NSW" })
  state: string;

  @ApiProperty({ example: 2000 })
  postalCode: number;

  @ApiProperty({ example: "2024-03-26T10:00:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-03-26T10:00:00.000Z" })
  updatedAt: Date;
}
