import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';

import { Agent } from '../../entity/Agent';
import { AgentDocument } from '../../entity/AgentDocument';
import { AgentReview } from '../../entity/AgentReview';
import { IApiResponse } from '../../shared/interface';
import { AgentService } from './agent.service';
import {
  TAgent,
  TAgentDocument,
  TAgentPartial,
  TGetAgentProfile,
} from './agent.types';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('signup')
  async create(@Body() agent: TAgent): Promise<IApiResponse<Agent>> {
    const data = await this.agentService.createAgent(agent);
    return {
      success: true,
      message: 'Agent created successfully.',
      data,
    };
  }

  @Get('profile/:id')
  async getProfileById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IApiResponse<Agent>> {
    const data = await this.agentService.getAgentById(id);
    return {
      success: true,
      message: 'Agent profile retrieved successfully.',
      data,
    };
  }

  @Get('profile')
  async getProfileByValue(
    @Body() agent: TGetAgentProfile,
  ): Promise<IApiResponse<Agent>> {
    const data = await this.agentService.getAgentProfile(agent);
    return {
      success: true,
      message: 'Agent profile retrieved successfully.',
      data,
    };
  }

  @Get('list')
  async getAll(): Promise<IApiResponse<Agent[]>> {
    const data = await this.agentService.getAllAgents();
    return {
      success: true,
      message: 'All agents retrieved successfully.',
      data,
    };
  }

  @Put('profile/:id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAgent: TAgentPartial,
  ): Promise<IApiResponse<UpdateResult>> {
    const data = await this.agentService.updateAgentProfile(id, updateAgent);
    return {
      success: true,
      message: 'Agent profile updated successfully.',
      data,
    };
  }

  @Delete('profile/:id')
  async delete(
    @Param('id', ParseIntPipe) agentId: number,
  ): Promise<IApiResponse<UpdateResult>> {
    const data = await this.agentService.deleteAgent(agentId);
    return {
      success: true,
      message: 'Agent deleted successfully.',
      data,
    };
  }

  @Post('profile/:id/document')
  async uploadDocument(
    @Param('id', ParseIntPipe) agentId: number,
    @Body() uploadDocument: TAgentDocument,
  ): Promise<IApiResponse<AgentDocument>> {
    const data = await this.agentService.uploadDocument(
      agentId,
      uploadDocument,
    );
    return {
      success: true,
      message: 'Document uploaded successfully.',
      data,
    };
  }

  @Get('/:id/documents')
  async getDocuments(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IApiResponse<AgentDocument[]>> {
    const data = await this.agentService.getAgentDocuments(id);
    return {
      success: true,
      message: 'Agent documents retrieved successfully.',
      data,
    };
  }

  @Delete('/:id/documents/:documentId')
  async deleteDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
  ): Promise<IApiResponse<UpdateResult>> {
    await this.agentService.deleteAgentDocument(documentId);
    return {
      success: true,
      message: 'Document deleted successfully.',
      data: null,
    };
  }

  @Get('/:id/reviews')
  async getReviews(
    @Param('id', ParseIntPipe) agentId: number,
  ): Promise<IApiResponse<AgentReview[]>> {
    const data = await this.agentService.getAgentReviews(agentId);
    return {
      success: true,
      message: 'Agent reviews retrieved successfully.',
      data,
    };
  }
}
