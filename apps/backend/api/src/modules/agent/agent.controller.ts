import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Get,
  Req,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import {
  TAgent,
  TAgentDocument,
  TAgentPartial,
  TGetAgentProfile,
} from './agent.types';
import { ApiResponse, ICustomRequest } from 'src/shared/interface';
import { Agent } from 'src/entity/Agent';
import { UpdateResult } from 'typeorm';
import { AgentDocument } from 'src/entity/AgentDocument';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('signup')
  async create(@Body() agent: TAgent): Promise<ApiResponse<Agent>> {
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
  ): Promise<ApiResponse<Agent>> {
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
  ): Promise<ApiResponse<Agent>> {
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
  async getAll(): Promise<ApiResponse<Agent[]>> {
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
  ): Promise<ApiResponse<UpdateResult>> {
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
  ): Promise<ApiResponse<UpdateResult>> {
    try {
      const data = await this.agentService.deleteAgent(agentId);
      return {
        success: true,
        message: 'Agent deleted successfully.',
        data: null,
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
  ): Promise<ApiResponse<AgentDocument>> {
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
  ): Promise<ApiResponse<AgentDocument[]>> {
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
      };
    }
  }

  @Delete('/:id/documents/:documentId')
  async deleteDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
  ): Promise<ApiResponse<UpdateResult>> {
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
  async getReviews(@Param('id', ParseIntPipe) agentId: number) {
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
