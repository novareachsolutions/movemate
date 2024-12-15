import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { UpdateResult, DeleteResult } from "typeorm";

import { Agent } from "../../entity/Agent";
import { IApiResponse, ICustomRequest } from "../../shared/interface";
import { AgentService } from "./agent.service";
import {
  TAgent,
  TAgentPartial,
  TAgentDocument,
} from "./agent.types";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { Roles } from "../../shared/decorators/roles.decorator";
import { UserRoleEnum, AgentStatusEnum } from "../../shared/enums";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { UnauthorizedError } from "../../shared/errors/authErrors";

@Controller("agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) { }

  /**
   * ===========================
   * Agent-Specific Routes
   * ===========================
   */

  /**
   * Agent Signup - Public Endpoint
   * Allows new agents to register without authentication.
   * Route: POST /agent/signup
   */
  @Post("signup")
  @UseGuards(OnboardingGuard)
  async create(@Req() request: ICustomRequest,
    @Body() agent: TAgent): Promise<IApiResponse<Agent>> {
    const phoneNumberFromGuard = request.user.phoneNumber;
    if (agent.user.phoneNumber && agent.user.phoneNumber !== phoneNumberFromGuard) {
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

  /**
   * Get Own Agent Profile
   * Accessible by AGENT role.
   * Route: GET /agent/profile
   */
  @Get("profile")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  async getOwnProfile(
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<Agent>> {
    const user = request.user;

    const agent = await this.agentService.getAgentByUserId(user.id);
    return {
      success: true,
      message: "Agent profile retrieved successfully.",
      data: agent,
    };
  }

  /**
   * Update Own Agent Profile
   * Accessible by AGENT role.
   * Route: PATCH /agent/profile
   */
  @Patch("profile")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  async updateOwnProfile(
    @Body() updateAgentPartial: TAgentPartial,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<UpdateResult>> {
    const user = request.user;

    const agentId = await this.agentService.getAgentIdByUserId(user.id);
    const isAdmin = false; // Agent updating their own profile

    const data = await this.agentService.updateAgentProfile(agentId, updateAgentPartial, isAdmin);
    return {
      success: true,
      message: "Agent profile updated successfully.",
      data,
    };
  }

  /**
   * Submit Own Document
   * Accessible by AGENT role.
   * Route: POST /agent/document
   */
  @Post("document")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  async submitOwnDocument(
    @Body() submitDocumentDto: TAgentDocument,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<TAgentDocument>> {
    const user = request.user;

    const agentId = await this.agentService.getAgentIdByUserId(user.id);

    // Assign agentId to the document
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

  /**
   * Remove Own Document
   * Accessible by AGENT role.
   * Route: DELETE /agent/document/:documentId
   */
  @Delete("document/:documentId")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  async removeOwnDocument(
    @Param("documentId", ParseIntPipe) documentId: number,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<null>> {
    const user = request.user;

    const agentId = await this.agentService.getAgentIdByUserId(user.id);

    await this.agentService.removeDocument(agentId, documentId);
    return {
      success: true,
      message: "Document removed successfully.",
      data: null,
    };
  }

  /**
   * Set Own Agent Status (Online/Offline)
   * Accessible by AGENT role.
   * Route: PATCH /agent/status
   */
  @Patch("status")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  async setOwnAgentStatus(
    @Body() body: { status: AgentStatusEnum },
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<UpdateResult>> {
    const { status } = body;
    const user = request.user;

    const agentId = await this.agentService.getAgentIdByUserId(user.id);

    const data = await this.agentService.setAgentStatus(agentId, status);
    return {
      success: true,
      message: `Agent status updated to ${status}.`,
      data,
    };
  }

  /**
   * ===========================
   * Admin-Specific Routes
   * ===========================
   */

  /**
   * Get Any Agent Profile
   * Accessible by ADMIN role.
   * Route: GET /agent/profile/:id
   */
  @Get("profile/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
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

  /**
   * Update Any Agent Profile
   * Accessible by ADMIN role.
   * Route: PATCH /agent/profile/:id
   */
  @Patch("profile/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  async updateAgentProfile(
    @Param("id", ParseIntPipe) agentId: number,
    @Body() updateAgentPartial: TAgentPartial,
  ): Promise<IApiResponse<UpdateResult>> {
    const isAdmin = true; // Admin updating any agent's profile

    const data = await this.agentService.updateAgentProfile(agentId, updateAgentPartial, isAdmin);
    return {
      success: true,
      message: "Agent profile updated successfully.",
      data,
    };
  }

  /**
   * Submit Any Agent Document
   * Accessible by ADMIN role.
   * Route: POST /agent/document/:id
   */
  @Post("document/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  async submitAgentDocument(
    @Param("id", ParseIntPipe) agentId: number,
    @Body() submitDocumentDto: TAgentDocument,
  ): Promise<IApiResponse<TAgentDocument>> {
    // Assign agentId to the document
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

  /**
   * Remove Any Agent Document
   * Accessible by ADMIN role.
   * Route: DELETE /agent/document/:id/:documentId
   */
  @Delete("document/:id/:documentId")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
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

  /**
   * Get All Agents
   * Accessible by ADMIN role.
   * Route: GET /agent/list
   */
  @Get("list")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  async getAllAgents(): Promise<IApiResponse<Agent[]>> {
    const agents = await this.agentService.getAllAgents();
    return {
      success: true,
      message: "All agents retrieved successfully.",
      data: agents,
    };
  }

  /**
   * Approve or Reject Any Agent
   * Accessible by ADMIN role.
   * Route: POST /agent/approve/:id
   */
  @Post("approve/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  async approveOrRejectAgent(
    @Param("id", ParseIntPipe) agentId: number,
    @Body() body: { approve: boolean },
  ): Promise<IApiResponse<Agent>> {
    const { approve } = body;

    if (approve) {
      const updatedAgent = await this.agentService.approveAgent(agentId);
      return {
        success: true,
        message: "Agent approved successfully.",
        data: updatedAgent,
      };
    } else {
      const updatedAgent = await this.agentService.rejectAgent(agentId);
      return {
        success: true,
        message: "Agent rejected successfully.",
        data: updatedAgent,
      };
    }
  }
}
