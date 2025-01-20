import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UpdateResult } from "typeorm";

import { Agent } from "../../entity/Agent";
import {
  AgentDeleteDocumentSwagger,
  AgentGetAllSwagger,
  AgentGetProfileByIdSwagger,
  AgentGetProfileSwagger,
  AgentPatchProfileByIdSwagger,
  AgentPatchProfileSwagger,
  AgentPatchStatusSwagger,
  AgentPostDocumentByIdSwagger,
  AgentPostDocumentSwagger,
  AgentSignUpSwagger,
  AgentUpdateLocationSwagger,
} from "../../shared/decorators/agents/agent.decorators";
import { Roles } from "../../shared/decorators/roles.decorator";
import { AgentStatusEnum, UserRoleEnum } from "../../shared/enums";
import { UnauthorizedError } from "../../shared/errors/authErrors";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { OnboardingGuard } from "../../shared/guards/onboarding.guard";
import { IApiResponse, ICustomRequest } from "../../shared/interface";
import { AgentService } from "./agent.service";
import { TAgent, TAgentDocument, TAgentPartial } from "./agent.types";
@ApiTags("Agent")
@Controller("agent")
export class AgentController {
  private readonly logger = new Logger(AgentController.name);

  constructor(private readonly agentService: AgentService) {}

  // *** Agent Sign Up, Status and List Specific Controllers ***
  @Post("signup")
  @UseGuards(OnboardingGuard)
  @AgentSignUpSwagger()
  async create(
    @Req() request: ICustomRequest,
    @Body() agent: TAgent,
  ): Promise<IApiResponse<Agent>> {
    this.logger.log(
      `AgentController.create: Attempting agent signup for phone number: ${agent.user.phoneNumber}`,
    );

    const phoneNumberFromGuard = request.user.phoneNumber;
    if (
      agent.user.phoneNumber &&
      agent.user.phoneNumber !== phoneNumberFromGuard
    ) {
      this.logger.warn(
        `AgentController.create: Phone number mismatch during signup. Provided: ${agent.user.phoneNumber}, Auth: ${phoneNumberFromGuard}`,
      );

      throw new UnauthorizedError(
        "The provided phone number does not match the authenticated user's phone number.",
      );
    }
    agent.user.phoneNumber = phoneNumberFromGuard;
    const data = await this.agentService.createAgent(agent);
    this.logger.log(
      `AgentController.create: Agent successfully created with ID: ${data.id}`,
    );

    return {
      success: true,
      message: "Agent created successfully.",
      data,
    };
  }

  @Patch("status")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @AgentPatchStatusSwagger()
  async setOwnAgentStatus(
    @Body() body: { status: AgentStatusEnum },
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<UpdateResult>> {
    const { status } = body;
    const agentId = request.user.agent.id;

    this.logger.debug(
      `AgentController.setOwnAgentStatus: Updating status for agent ${agentId} to: ${status}`,
    );

    const data = await this.agentService.setAgentStatus(agentId, status);

    this.logger.log(
      `AgentController.setOwnAgentStatus: Agent ${agentId} status updated to ${status}`,
    );

    return {
      success: true,
      message: `Agent status updated to ${status}.`,
      data,
    };
  }

  @Get("list")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @AgentGetAllSwagger()
  async getAllAgents(): Promise<IApiResponse<Agent[]>> {
    this.logger.debug(
      "AgentController.getAllAgents: Retrieving all agents list",
    );

    const agents = await this.agentService.getAllAgents();

    this.logger.log(
      `AgentController.getAllAgents: ${agents.length} agents retrieved successfully.`,
    );
    return {
      success: true,
      message: "All agents retrieved successfully.",
      data: agents,
    };
  }

  // *** Agent Profile Specific Controllers ***
  @Get("profile")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @AgentGetProfileSwagger()
  async getOwnProfile(
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<Agent>> {
    const agentId = request.user.agent.id;
    this.logger.debug(
      `AgentController.getOwnProfile: Retrieving profile for agent ${agentId}`,
    );
    const agent = await this.agentService.getAgentById(agentId);
    this.logger.log(
      `AgentController.getOwnProfile: Profile for agent ${agentId} retrieved successfully.`,
      agent,
    );
    return {
      success: true,
      message: "Agent profile retrieved successfully.",
      data: agent,
    };
  }

  @Patch("profile")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @AgentPatchProfileSwagger()
  async updateOwnProfile(
    @Body() updateAgentPartial: TAgentPartial,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<UpdateResult>> {
    const agentId = request.user.agent.id;

    this.logger.debug(
      `AgentController.updateOwnProfile: Updating profile for agent ${agentId}`,
      {
        updatedFields: Object.keys(updateAgentPartial),
      },
    );

    const data = await this.agentService.updateAgentProfile(
      agentId,
      updateAgentPartial,
    );

    this.logger.log(
      `AgentController.updateOwnProfile: Profile for agent ${agentId} updated successfully.`,
      data,
    );
    return {
      success: true,
      message: "Agent profile updated successfully.",
      data,
    };
  }

  @Get("profile/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @AgentGetProfileByIdSwagger()
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
  @AgentPatchProfileByIdSwagger()
  async updateAgentProfile(
    @Param("id", ParseIntPipe) agentId: number,
    @Body() updateAgentPartial: TAgentPartial,
  ): Promise<IApiResponse<UpdateResult>> {
    this.logger.debug(
      `AgentController.updateAgentProfile: Updating profile for agent ${agentId}`,
    );
    const isAdmin = true;
    const data = await this.agentService.updateAgentProfile(
      agentId,
      updateAgentPartial,
      isAdmin,
    );
    this.logger.log(
      `AgentController.updateAgentProfile: Profile for agent ${agentId} updated successfully.`,
      data,
    );
    return {
      success: true,
      message: "Agent profile updated successfully.",
      data,
    };
  }

  // *** Document Specific Controllers ***
  @Post("document")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @AgentPostDocumentSwagger()
  async submitOwnDocument(
    @Body() submitDocumentDto: TAgentDocument,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<TAgentDocument>> {
    const agentId = request.user.agent.id;
    this.logger.debug(
      `AgentController.submitOwnDocument: Submitting document for agent ${agentId}`,
    );

    const document: TAgentDocument = {
      ...submitDocumentDto,
      agentId,
    };
    const data = await this.agentService.submitDocument(agentId, document);

    this.logger.log(
      `AgentController.submitOwnDocument: Document for agent ${agentId} submitted successfully.`,
      data,
    );
    return {
      success: true,
      message: "Document submitted successfully.",
      data,
    };
  }

  @Delete("document/:documentId")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @AgentDeleteDocumentSwagger()
  async removeOwnDocument(
    @Param("documentId", ParseIntPipe) documentId: number,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<null>> {
    const agentId = request.user.agent.id;
    this.logger.debug(
      `AgentController.removeOwnDocument: Removing document ${documentId} for agent ${agentId}`,
    );
    await this.agentService.removeDocument(agentId, documentId);

    this.logger.log(
      `AgentController.removeOwnDocument: Document ${documentId} for agent ${agentId} removed successfully.`,
    );
    return {
      success: true,
      message: "Document removed successfully.",
      data: null,
    };
  }

  @Post("document/:id")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @AgentPostDocumentByIdSwagger()
  async submitAgentDocument(
    @Param("id", ParseIntPipe) agentId: number,
    @Body() submitDocumentDto: TAgentDocument,
  ): Promise<IApiResponse<TAgentDocument>> {
    this.logger.debug(
      `AgentController.submitAgentDocument: Submitting document for agent ${agentId}`,
    );
    const document: TAgentDocument = {
      ...submitDocumentDto,
      agentId,
    };
    const data = await this.agentService.submitDocument(agentId, document);

    this.logger.log(
      `AgentController.submitAgentDocument: Document for agent ${agentId} submitted successfully.`,
      data,
    );
    return {
      success: true,
      message: "Document submitted successfully.",
      data,
    };
  }

  // ! Duplicate controller, should be removed. Same service is being used
  @Delete("document/:id/:documentId")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.ADMIN)
  @AgentDeleteDocumentSwagger()
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

  // *** Agent Location Specific Controller
  @Patch("location")
  @UseGuards(AuthGuard)
  @Roles(UserRoleEnum.AGENT)
  @AgentUpdateLocationSwagger()
  async updateLocation(
    @Body() body: { latitude: number; longitude: number },
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<null>> {
    const agentId = request.user.agent.id;

    this.logger.debug(
      `AgentController.updateLocation: Updating location for agent ${agentId}`,
    );
    const { latitude, longitude } = body;
    await this.agentService.updateAgentLocation(agentId, latitude, longitude);

    this.logger.log(
      `AgentController.updateLocation: Location for agent ${agentId} updated successfully.`,
    );
    return {
      success: true,
      message: "Location updated successfully.",
      data: null,
    };
  }
}
