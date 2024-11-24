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
    try {
      const data = await this.agentService.createAgent(agent);
      return {
        success: true,
        message: 'Agent created successfully.',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Agent creation failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  @Get('profile/:id')
  async getProfileById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IApiResponse<Agent>> {
    try {
      const data = await this.agentService.getAgentById(id);
      return {
        success: true,
        message: 'Agent profile retrieved successfully.',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Agent profile retrieval failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  @Get('profile')
  async getProfileByValue(
    @Body() agent: TGetAgentProfile,
  ): Promise<IApiResponse<Agent>> {
    try {
      const data = await this.agentService.getAgentProfile(agent);
      return {
        success: true,
        message: 'Agent profile retrieved successfully.',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Agent profile retrieval failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  @Get('list')
  async getAll(): Promise<IApiResponse<Agent[]>> {
    try {
      const data = await this.agentService.getAllAgents();
      return {
        success: true,
        message: 'All agents retrieved successfully.',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Agent retrieval failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  @Put('profile/:id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAgent: TAgentPartial,
  ): Promise<IApiResponse<UpdateResult>> {
    try {
      const data = await this.agentService.updateAgentProfile(id, updateAgent);
      return {
        success: true,
        message: 'Agent profile updated successfully.',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Agent profile update failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  @Delete('profile/:id')
  async delete(
    @Param('id', ParseIntPipe) agentId: number,
  ): Promise<IApiResponse<UpdateResult>> {
    try {
      const data = await this.agentService.deleteAgent(agentId);
      return {
        success: true,
        message: 'Agent deleted successfully.',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Agent deletion failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  @Post('profile/:id/document')
  async uploadDocument(
    @Param('id', ParseIntPipe) agentId: number,
    @Body() uploadDocument: TAgentDocument,
  ): Promise<IApiResponse<AgentDocument>> {
    try {
      const data = await this.agentService.uploadDocument(
        agentId,
        uploadDocument,
      );
      return {
        success: true,
        message: 'Document uploaded successfully.',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Document upload failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  @Get('/:id/documents')
  async getDocuments(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IApiResponse<AgentDocument[]>> {
    try {
      const data = await this.agentService.getAgentDocuments(id);
      return {
        success: true,
        message: 'Agent documents retrieved successfully.',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Agent documents retrieval failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  @Delete('/:id/documents/:documentId')
  async deleteDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
  ): Promise<IApiResponse<UpdateResult>> {
    try {
      await this.agentService.deleteAgentDocument(documentId);
      return {
        success: true,
        message: 'Document deleted successfully.',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Document deletion failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }

  @Get('/:id/reviews')
  async getReviews(
    @Param('id', ParseIntPipe) agentId: number,
  ): Promise<IApiResponse<AgentReview[]>> {
    try {
      const data = await this.agentService.getAgentReviews(agentId);
      return {
        success: true,
        message: 'Agent reviews retrieved successfully.',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Agent reviews retrieval failed.',
        data: null,
        error: {
          message: error.message,
          code: error.status || 500,
        },
      };
    }
  }
}
