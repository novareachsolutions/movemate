import { applyDecorators } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";

import {
  AgentDocumentDto,
  CreateAgentDto,
  UpdateAgentProfileDto,
  UpdateAgentStatusDto,
} from "../../../modules/agent/dto/agent.dto";
import {
  AgentStatusEnum,
  AgentTypeEnum,
  ApprovalStatusEnum,
} from "../../enums";

export const AgentSignUpSwagger = (): any => {
  return applyDecorators(
    ApiOperation({ summary: "Create a new agent account" }),
    ApiBody({
      type: CreateAgentDto,
    }),
    ApiResponse({
      status: 201,
      description: "Agent successfully created",
      schema: {
        example: {
          success: true,
          message: "Agent created successfully",
          data: {
            id: 1,
            abnNumber: "12345678901",
            agentType: AgentTypeEnum.CAR_TOWING,
            vehicleMake: "Toyota",
            vehicleModel: "Hilux",
            vehicleYear: 2020,
            profilePhoto: "https://example.com/photo.jpg",
            status: AgentStatusEnum.OFFLINE,
            approvalStatus: ApprovalStatusEnum.PENDING,
            user: {
              id: 1,
              email: "agent@example.com",
              phoneNumber: "+61412345678",
            },
            createdAt: "2024-03-26T10:00:00.000Z",
            updatedAt: "2024-03-26T10:00:00.000Z",
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: "Agent already exists",
      schema: {
        example: {
          success: false,
          message: "Agent with ABN number 12345678901 already exists",
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
            "The provided phone number does not match the authenticated user's phone number",
          statusCode: 401,
        },
      },
    }),
  );
};

export const AgentGetProfileSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({ summary: "Get own agent profile" }),
    ApiResponse({
      status: 200,
      description: "Agent profile retrieved successfully",
      schema: {
        example: {
          success: true,
          message: "Agent profile retrieved successfully",
          data: {
            id: 1,
            abnNumber: "12345678901",
            agentType: AgentTypeEnum.CAR_TOWING,
            vehicleMake: "Toyota",
            vehicleModel: "Hilux",
            vehicleYear: 2020,
            profilePhoto: "https://example.com/photo.jpg",
            status: AgentStatusEnum.ONLINE,
            approvalStatus: ApprovalStatusEnum.APPROVED,
            user: {
              id: 1,
              email: "agent@example.com",
              phoneNumber: "+61412345678",
            },
            createdAt: "2024-03-26T10:00:00.000Z",
            updatedAt: "2024-03-26T10:00:00.000Z",
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Agent not found",
      schema: {
        example: {
          success: false,
          message: "Agent not found for ID 1",
          statusCode: 404,
        },
      },
    }),
  );
};

export const AgentPatchProfileSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({
      summary: "Update own profile",
      description:
        "Allows the authenticated agent to update their profile information.",
    }),
    ApiBody({ type: UpdateAgentProfileDto }),
    ApiResponse({
      status: 200,
      description: "Agent profile updated successfully",
      schema: {
        example: {
          success: true,
          message: "Agent profile updated successfully",
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
      description: "Agent not found",
      schema: {
        example: {
          success: false,
          message: "Agent with ID 1 not found",
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized",
      schema: {
        example: {
          success: false,
          message: "Token refresh failed",
          statusCode: 401,
        },
      },
    }),
  );
};

export const AgentPostDocumentSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({ summary: "Submit agent document" }),
    ApiBody({ type: AgentDocumentDto }),
    ApiResponse({
      status: 201,
      description: "Document submitted successfully",
      type: AgentDocumentDto,
    }),
    ApiResponse({
      status: 201,
      description: "Document submitted successfully",
      schema: {
        example: {
          success: true,
          message: "Document submitted successfully",
          data: {
            name: "DRIVER_LICENSE",
            description: "Driver license front and back",
            url: "https://example.com/documents/license.pdf",
            agentId: 1,
            createdAt: "2024-03-26T10:00:00.000Z",
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: "Document already exists",
      schema: {
        example: {
          success: false,
          message: "Document DRIVER_LICENSE already exists",
          statusCode: 409,
        },
      },
    }),
  );
};

export const AgentDeleteDocumentSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({ summary: "Remove agent document" }),
    ApiParam({
      name: "documentId",
      description: "Document ID to remove",
      type: Number,
    }),
    ApiResponse({
      status: 200,
      description: "Document removed successfully",
    }),
    ApiResponse({
      status: 200,
      description: "Document removed successfully",
      schema: {
        example: {
          success: true,
          message: "Document removed successfully",
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Document not found",
      schema: {
        example: {
          success: false,
          message: "Document with ID 1 not found",
          statusCode: 404,
        },
      },
    }),
  );
};

export const AgentPatchStatusSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({ summary: "Update agent status" }),
    ApiBody({ type: UpdateAgentStatusDto }),
    ApiResponse({
      status: 200,
      description: "Status updated successfully",
      schema: {
        example: {
          success: true,
          message: "Agent status updated to ONLINE",
          data: {
            generatedMaps: [],
            raw: [],
            affected: 1,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Invalid status or agent not approved",
      schema: {
        example: {
          success: false,
          message: "Cannot set status. Agent is not approved",
          statusCode: 400,
        },
      },
    }),
  );
};

export const AgentGetProfileByIdSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({
      summary: "Get agent profile (Admin)",
      description:
        "Allows an admin to retrieve any agent's profile information.",
    }),
    ApiParam({
      name: "id",
      description: "Agent ID",
      type: Number,
    }),
    ApiResponse({
      status: 200,
      description: "Agent profile retrieved successfully",
      schema: {
        example: {
          success: true,
          message: "Agent profile retrieved successfully",
          data: {
            id: 1,
            abnNumber: "12345678901",
            agentType: AgentTypeEnum.CAR_TOWING,
            vehicleMake: "Toyota",
            vehicleModel: "Hilux",
            vehicleYear: 2020,
            profilePhoto: "https://example.com/photo.jpg",
            status: AgentStatusEnum.ONLINE,
            approvalStatus: ApprovalStatusEnum.APPROVED,
            user: {
              id: 1,
              email: "agent@example.com",
              phoneNumber: "+61412345678",
            },
            createdAt: "2024-03-26T10:00:00.000Z",
            updatedAt: "2024-03-26T10:00:00.000Z",
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Agent not found",
      schema: {
        example: {
          success: false,
          message: "Agent not found for ID 1",
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Forbidden - Admin access required",
      schema: {
        example: {
          success: false,
          message: "Access denied - Admin role required",
          statusCode: 403,
        },
      },
    }),
  );
};

export const AgentPatchProfileByIdSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({
      summary: "Update agent profile (Admin)",
      description: "Allows an admin to update any agent's profile information.",
    }),
    ApiParam({
      name: "id",
      description: "Agent ID",
      type: Number,
    }),
    ApiBody({ type: UpdateAgentProfileDto }),
    ApiResponse({
      status: 200,
      description: "List of all agents retrieved successfully",
      schema: {
        example: {
          success: true,
          message: "All agents retrieved successfully",
          data: [
            {
              id: 1,
              abnNumber: "12345678901",
              agentType: AgentTypeEnum.CAR_TOWING,
              vehicleMake: "Toyota",
              vehicleModel: "Hilux",
              vehicleYear: 2020,
              profilePhoto: "https://example.com/photo.jpg",
              status: AgentStatusEnum.ONLINE,
              approvalStatus: ApprovalStatusEnum.APPROVED,
              user: {
                id: 1,
                email: "agent@example.com",
                phoneNumber: "+61412345678",
              },
              createdAt: "2024-03-26T10:00:00.000Z",
              updatedAt: "2024-03-26T10:00:00.000Z",
            },
          ],
        },
      },
    }),
    ApiResponse({ status: 404, description: "Agent not found" }),
    ApiResponse({
      status: 403,
      description: "Forbidden - Admin access required",
    }),
  );
};

export const AgentPostDocumentByIdSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({
      summary: "Submit agent document (Admin)",
      description: "Allows an admin to submit a document for any agent.",
    }),
    ApiParam({
      name: "id",
      description: "Agent ID",
      type: Number,
    }),
    ApiBody({ type: AgentDocumentDto }),
    ApiResponse({
      status: 201,
      description: "Document submitted successfully",
      schema: {
        example: {
          success: true,
          message: "Document submitted successfully",
          data: {
            name: "DRIVER_LICENSE",
            description: "Driver license front and back",
            url: "https://example.com/documents/license.pdf",
            agentId: 1,
            createdAt: "2024-03-26T10:00:00.000Z",
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Invalid document",
      schema: {
        example: {
          success: false,
          message: "Invalid document type provided",
          statusCode: 400,
        },
      },
    }),
    ApiResponse({ status: 409, description: "Document already exists" }),
    ApiResponse({
      status: 403,
      description: "Forbidden - Admin access required",
    }),
  );
};

export const AgentGetAllSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({ summary: "Get all agents (Admin only)" }),
    ApiResponse({
      status: 200,
      description: "List of all agents retrieved successfully",
      schema: {
        example: {
          success: true,
          message: "All agents retrieved successfully",
          data: [
            {
              id: 1,
              abnNumber: "12345678901",
              agentType: AgentTypeEnum.CAR_TOWING,
              vehicleMake: "Toyota",
              vehicleModel: "Hilux",
              vehicleYear: 2020,
              profilePhoto: "https://example.com/photo.jpg",
              status: AgentStatusEnum.ONLINE,
              approvalStatus: ApprovalStatusEnum.APPROVED,
              user: {
                id: 1,
                email: "agent@example.com",
                phoneNumber: "+61412345678",
              },
              createdAt: "2024-03-26T10:00:00.000Z",
              updatedAt: "2024-03-26T10:00:00.000Z",
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Forbidden - Admin access required",
      schema: {
        example: {
          success: false,
          message: "Access denied - Admin role required",
          statusCode: 403,
        },
      },
    }),
  );
};

export const AgentUpdateLocationSwagger = (): any => {
  return applyDecorators(
    ApiBearerAuth("JWT-auth"),
    ApiOperation({ summary: "Update agent's location (Agent only)" }),
    ApiBody({
      description: "Latitude and Longitude for the agent's current location",
      required: true,
      schema: {
        example: {
          latitude: -33.8688,
          longitude: 151.2093,
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: "Location updated successfully",
      schema: {
        example: {
          success: true,
          message: "Location updated successfully.",
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Forbidden - Agent access required",
      schema: {
        example: {
          success: false,
          message: "Access denied - Agent role required",
          statusCode: 403,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error - Agent is not ONLINE",
      schema: {
        example: {
          success: false,
          message: "Cannot update location. Agent is not ONLINE.",
          statusCode: 500,
        },
      },
    }),
  );
};
