import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import {
  AgentRegistrationDocumentEnum,
  AgentStatusEnum,
  AgentTypeEnum,
  ApprovalStatusEnum,
} from "../../../shared/enums";

export class CreateAgentDto {
  @ApiProperty({
    description: "Australian Business Number",
    example: "12345678901",
    minLength: 11,
    maxLength: 11,
  })
  abnNumber: string;

  @ApiProperty({
    enum: AgentTypeEnum,
    description: "Type of agent service",
    example: AgentTypeEnum.CAR_TOWING,
  })
  agentType: AgentTypeEnum;

  @ApiPropertyOptional({
    description: "Vehicle make",
    example: "Toyota",
  })
  vehicleMake?: string;

  @ApiPropertyOptional({
    description: "Vehicle model",
    example: "Hilux",
  })
  vehicleModel?: string;

  @ApiPropertyOptional({
    description: "Vehicle year",
    example: 2020,
    minimum: 1900,
    maximum: new Date().getFullYear(),
  })
  vehicleYear?: number;

  @ApiPropertyOptional({
    description: "Profile photo URL",
    example: "https://example.com/photo.jpg",
  })
  profilePhoto?: string;

  @ApiProperty({
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "agent@example.com",
      },
      phoneNumber: {
        type: "string",
        example: "+61412345678",
      },
    },
    required: ["email", "phoneNumber"],
  })
  user: {
    email: string;
    phoneNumber: string;
  };
}

export class AgentDocumentDto {
  @ApiProperty({
    enum: AgentRegistrationDocumentEnum,
    description: "Document type",
    example: AgentRegistrationDocumentEnum.DRIVER_LICENSE,
  })
  name: string;

  @ApiProperty({
    description: "Document description",
    example: "Driver license front and back",
  })
  description: string;

  @ApiProperty({
    description: "Document URL",
    example: "https://example.com/document.pdf",
  })
  url: string;

  @ApiPropertyOptional({
    description: "Agent ID - Only required for admin submissions",
    example: 1,
  })
  agentId?: number;
}

export class UpdateAgentStatusDto {
  @ApiProperty({
    enum: AgentStatusEnum,
    description: "Agent availability status",
    example: AgentStatusEnum.ONLINE,
  })
  status: AgentStatusEnum;
}

export class UpdateAgentProfileDto {
  @ApiPropertyOptional({
    description: "Vehicle make",
    example: "Toyota",
  })
  vehicleMake?: string;

  @ApiPropertyOptional({
    description: "Vehicle model",
    example: "Hilux",
  })
  vehicleModel?: string;

  @ApiPropertyOptional({
    description: "Vehicle year",
    example: 2020,
    minimum: 1900,
    maximum: new Date().getFullYear(),
  })
  vehicleYear?: number;

  @ApiPropertyOptional({
    description: "Profile photo URL",
    example: "https://example.com/photo.jpg",
  })
  profilePhoto?: string;

  @ApiPropertyOptional({
    enum: ApprovalStatusEnum,
    description: "Agent approval status (Admin only)",
    example: ApprovalStatusEnum.APPROVED,
  })
  approvalStatus?: ApprovalStatusEnum;

  @ApiPropertyOptional({
    enum: AgentTypeEnum,
    description: "Type of agent service",
    example: AgentTypeEnum.CAR_TOWING,
  })
  agentType?: AgentTypeEnum;
}

export class AgentResponseDto {
  @ApiProperty({
    description: "Agent ID",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Australian Business Number",
    example: "12345678901",
  })
  abnNumber: string;

  @ApiProperty({
    enum: AgentTypeEnum,
    description: "Type of agent service",
    example: AgentTypeEnum.CAR_TOWING,
  })
  agentType: AgentTypeEnum;

  @ApiProperty({
    description: "Vehicle make",
    example: "Toyota",
  })
  vehicleMake: string;

  @ApiProperty({
    description: "Vehicle model",
    example: "Hilux",
  })
  vehicleModel: string;

  @ApiProperty({
    description: "Vehicle year",
    example: 2020,
  })
  vehicleYear: number;

  @ApiProperty({
    description: "Profile photo URL",
    example: "https://example.com/photo.jpg",
  })
  profilePhoto: string;

  @ApiProperty({
    enum: AgentStatusEnum,
    description: "Agent availability status",
    example: AgentStatusEnum.ONLINE,
  })
  status: AgentStatusEnum;

  @ApiProperty({
    enum: ApprovalStatusEnum,
    description: "Agent approval status",
    example: ApprovalStatusEnum.APPROVED,
  })
  approvalStatus: ApprovalStatusEnum;

  @ApiProperty({
    description: "User ID",
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: "Created at timestamp",
    example: "2024-03-25T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Updated at timestamp",
    example: "2024-03-25T10:30:00Z",
  })
  updatedAt: Date;
}

export class ApiResponseDto<T> {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Operation completed successfully",
  })
  message: string;

  @ApiProperty({
    description: "Response data",
  })
  data: T;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: "Error status",
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: "Error message",
    example: "Invalid document type provided",
  })
  message: string;

  @ApiProperty({
    description: "Error code",
    example: "INVALID_DOCUMENT_TYPE",
  })
  code?: string;

  @ApiProperty({
    description: "HTTP status code",
    example: 400,
  })
  statusCode: number;
}
