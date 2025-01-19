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
import { UpdateResult } from "typeorm";

import { Agent } from "../../entity/Agent";
import { Roles } from "../../shared/decorators/roles.decorator";
import {
  AgentStatusEnum,
  AgentTypeEnum,
  ApprovalStatusEnum,
  UserRoleEnum,
} from "../../shared/enums";
import { UnauthorizedError } from "../../shared/errors/authErrors";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { IApiResponse, ICustomRequest } from "../../shared/interface";
import { AgentService } from "./agent.service";
import { TAgent, TAgentDocument, TAgentPartial } from "./agent.types";
import {
  AgentDocumentDto,
  CreateAgentDto,
  UpdateAgentProfileDto,
  UpdateAgentStatusDto,
} from "./dto/agent.dto";
@ApiTags("Agent")
@Controller("agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post("signup")
  @UseGuards(OnboardingGuard)
  @ApiOperation({ summary: "Create a new agent account" })
  @ApiBody({
    type: CreateAgentDto,
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 409,
    description: "Agent already exists",
    schema: {
      example: {
        success: false,
        message: "Agent with ABN number 12345678901 already exists",
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
          "The provided phone number does not match the authenticated user's phone number",
        statusCode: 401,
      },
    },
  })
  async create(
    @Req() request: ICustomRequest,
    @Body() agent: TAgent,
  ): Promise<IApiResponse<Agent>> {
    const phoneNumberFromGuard = request.user.phoneNumber;
    if (
      agent.user.phoneNumber &&
      agent.user.phoneNumber !== phoneNumberFromGuard
    ) {
      throw new UnauthorizedError(
        "The provided phone number does not match the authenticated user's phone number.",
      );
    }
    agent.user.phoneNumber = phoneNumberFromGuard;
    const data = await this.agentService.createAgent(agent);
    return {
      success: true,
      message: "Agent created successfully.",
      data,
    };
  }

  @Get("profile")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get own agent profile" })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 404,
    description: "Agent not found",
    schema: {
      example: {
        success: false,
        message: "Agent not found for ID 1",
        statusCode: 404,
      },
    },
  })
  async getOwnProfile(
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<Agent>> {
    const agentId = request.user.agent.id;
    const agent = await this.agentService.getAgentById(agentId);
    return {
      success: true,
      message: "Agent profile retrieved successfully.",
      data: agent,
    };
  }

  @Patch("profile")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Update own profile",
    description:
      "Allows the authenticated agent to update their profile information.",
  })
  @ApiBody({ type: UpdateAgentProfileDto })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 404,
    description: "Agent not found",
    schema: {
      example: {
        success: false,
        message: "Agent with ID 1 not found",
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    schema: {
      example: {
        success: false,
        message: "Token refresh failed",
        statusCode: 401,
      },
    },
  })
  async updateOwnProfile(
    @Body() updateAgentPartial: TAgentPartial,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<UpdateResult>> {
    const agentId = request.user.agent.id;
    const data = await this.agentService.updateAgentProfile(
      agentId,
      updateAgentPartial,
    );
    return {
      success: true,
      message: "Agent profile updated successfully.",
      data,
    };
  }

  @Post("document")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Submit agent document" })
  @ApiBody({ type: AgentDocumentDto })
  @ApiResponse({
    status: 201,
    description: "Document submitted successfully",
    type: AgentDocumentDto,
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 409,
    description: "Document already exists",
    schema: {
      example: {
        success: false,
        message: "Document DRIVER_LICENSE already exists",
        statusCode: 409,
      },
    },
  })
  async submitOwnDocument(
    @Body() submitDocumentDto: TAgentDocument,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<TAgentDocument>> {
    const agentId = request.user.agent.id;
    const document: TAgentDocument = {
      ...submitDocumentDto,
      agentId,
    };
    const data = await this.agentService.submitDocument(agentId, document);
    return {
      success: true,
      message: "Document submitted successfully.",
      data,
    };
  }

  @Delete("document/:documentId")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Remove agent document" })
  @ApiParam({
    name: "documentId",
    description: "Document ID to remove",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Document removed successfully",
  })
  @ApiResponse({
    status: 200,
    description: "Document removed successfully",
    schema: {
      example: {
        success: true,
        message: "Document removed successfully",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Document not found",
    schema: {
      example: {
        success: false,
        message: "Document with ID 1 not found",
        statusCode: 404,
      },
    },
  })
  async removeOwnDocument(
    @Param("documentId", ParseIntPipe) documentId: number,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<null>> {
    const agentId = request.user.agent.id;
    await this.agentService.removeDocument(agentId, documentId);
    return {
      success: true,
      message: "Document removed successfully.",
      data: null,
    };
  }

  @Patch("status")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update agent status" })
  @ApiBody({ type: UpdateAgentStatusDto })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 400,
    description: "Invalid status or agent not approved",
    schema: {
      example: {
        success: false,
        message: "Cannot set status. Agent is not approved",
        statusCode: 400,
      },
    },
  })
  async setOwnAgentStatus(
    @Body() body: { status: AgentStatusEnum },
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<UpdateResult>> {
    const { status } = body;
    const agentId = request.user.agent.id;
    const data = await this.agentService.setAgentStatus(agentId, status);
    return {
      success: true,
      message: `Agent status updated to ${status}.`,
      data,
    };
  }

  @Get("profile/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get agent profile (Admin)",
    description: "Allows an admin to retrieve any agent's profile information.",
  })
  @ApiParam({
    name: "id",
    description: "Agent ID",
    type: Number,
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 404,
    description: "Agent not found",
    schema: {
      example: {
        success: false,
        message: "Agent not found for ID 1",
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
    schema: {
      example: {
        success: false,
        message: "Access denied - Admin role required",
        statusCode: 403,
      },
    },
  })
  async getAgentProfile(
    @Param("id", ParseIntPipe) agentId: number,
  ): Promise<IApiResponse<Agent>> {
    const agent = await this.agentService.getAgentById(agentId);
    return {
      success: true,
      message: "Agent profile retrieved successfully.",
      data: agent,
    };
  }

  @Patch("profile/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Update agent profile (Admin)",
    description: "Allows an admin to update any agent's profile information.",
  })
  @ApiParam({
    name: "id",
    description: "Agent ID",
    type: Number,
  })
  @ApiBody({ type: UpdateAgentProfileDto })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 404, description: "Agent not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async updateAgentProfile(
    @Param("id", ParseIntPipe) agentId: number,
    @Body() updateAgentPartial: TAgentPartial,
  ): Promise<IApiResponse<UpdateResult>> {
    const isAdmin = true;
    const data = await this.agentService.updateAgentProfile(
      agentId,
      updateAgentPartial,
      isAdmin,
    );
    return {
      success: true,
      message: "Agent profile updated successfully.",
      data,
    };
  }

  @Post("document/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Submit agent document (Admin)",
    description: "Allows an admin to submit a document for any agent.",
  })
  @ApiParam({
    name: "id",
    description: "Agent ID",
    type: Number,
  })
  @ApiBody({ type: AgentDocumentDto })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 400,
    description: "Invalid document",
    schema: {
      example: {
        success: false,
        message: "Invalid document type provided",
        statusCode: 400,
      },
    },
  })
  @ApiResponse({ status: 409, description: "Document already exists" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async submitAgentDocument(
    @Param("id", ParseIntPipe) agentId: number,
    @Body() submitDocumentDto: TAgentDocument,
  ): Promise<IApiResponse<TAgentDocument>> {
    const document: TAgentDocument = {
      ...submitDocumentDto,
      agentId,
    };
    const data = await this.agentService.submitDocument(agentId, document);
    return {
      success: true,
      message: "Document submitted successfully.",
      data,
    };
  }

  @Delete("document/:id/:documentId")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Remove agent document (Admin)",
    description:
      "Allows an admin to remove a specific document from any agent.",
  })
  @ApiParam({
    name: "id",
    description: "Agent ID",
    type: Number,
  })
  @ApiParam({
    name: "documentId",
    description: "Document ID to remove",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Document removed successfully",
    schema: {
      example: {
        success: true,
        message: "Document removed successfully",
        data: null,
      },
    },
  })
  @ApiResponse({ status: 404, description: "Document not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async removeAgentDocument(
    @Param("id", ParseIntPipe) agentId: number,
    @Param("documentId", ParseIntPipe) documentId: number,
  ): Promise<IApiResponse<null>> {
    await this.agentService.removeDocument(agentId, documentId);
    return {
      success: true,
      message: "Document removed successfully.",
      data: null,
    };
  }

  @Get("list")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get all agents (Admin only)" })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
    schema: {
      example: {
        success: false,
        message: "Access denied - Admin role required",
        statusCode: 403,
      },
    },
  })
  async getAllAgents(): Promise<IApiResponse<Agent[]>> {
    const agents = await this.agentService.getAllAgents();
    return {
      success: true,
      message: "All agents retrieved successfully.",
      data: agents,
    };
  }

  @Patch("location")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  async updateLocation(
    @Body() body: { latitude: number; longitude: number },
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<null>> {
    const agentId = request.user.agent.id;
    const { latitude, longitude } = body;
    await this.agentService.updateAgentLocation(agentId, latitude, longitude);
    return {
      success: true,
      message: "Location updated successfully.",
      data: null,
    };
  }
}
