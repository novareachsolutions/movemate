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
import { UpdateResult } from "typeorm";

import { Agent } from "../../entity/Agent";
import { Roles } from "../../shared/decorators/roles.decorator";
import { AgentStatusEnum, UserRoleEnum } from "../../shared/enums";
import { UnauthorizedError } from "../../shared/errors/authErrors";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { IApiResponse, ICustomRequest } from "../../shared/interface";
import { AgentService } from "./agent.service";
import { TAgent, TAgentDocument, TAgentPartial } from "./agent.types";

@Controller("agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * Agent Signup
   * Endpoint: POST /agent/signup
   * Description: Allows an agent to sign up by providing necessary details.
   */
  @Post("signup")
  @UseGuards(OnboardingGuard)
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

  /**
   * Get Own Profile
   * Endpoint: GET /agent/profile
   * Description: Retrieves the authenticated agent's profile.
   */
  @Get("profile")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
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

  /**
   * Update Own Profile
   * Endpoint: PATCH /agent/profile
   * Description: Allows the authenticated agent to update their profile.
   */
  @Patch("profile")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
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

  /**
   * Submit Own Document
   * Endpoint: POST /agent/document
   * Description: Allows the authenticated agent to submit a document.
   */
  @Post("document")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
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

  /**
   * Remove Own Document
   * Endpoint: DELETE /agent/document/:documentId
   * Description: Allows the authenticated agent to remove a specific document.
   */
  @Delete("document/:documentId")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
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

  /**
   * Set Own Agent Status
   * Endpoint: PATCH /agent/status
   * Description: Allows the authenticated agent to update their status.
   */
  @Patch("status")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
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

  /**
   * Get Agent Profile (Admin)
   * Endpoint: GET /agent/profile/:id
   * Description: Allows an admin to retrieve any agent's profile.
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
   * Update Agent Profile (Admin)
   * Endpoint: PATCH /agent/profile/:id
   * Description: Allows an +
   *  to update any agent's profile.
   */
  @Patch("profile/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
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

  /**
   * Submit Agent Document (Admin)
   * Endpoint: POST /agent/document/:id
   * Description: Allows an admin to submit a document for any agent.
   */
  @Post("document/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
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

  /**
   * Remove Agent Document (Admin)
   * Endpoint: DELETE /agent/document/:id/:documentId
   * Description: Allows an admin to remove a specific document from any agent.
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
   * Get All Agents (Admin)
   * Endpoint: GET /agent/list
   * Description: Allows an admin to retrieve a list of all agents.
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
}
