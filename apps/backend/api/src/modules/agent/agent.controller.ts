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
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '../../common/enums';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AgentService } from './agent.service';
import { CustomRequest } from 'src/shared/interfaces';

@Controller('agents')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async createAgent(@Body() createAgentDto, @Req() req: CustomRequest) {
    const userId = req.userId;
    return this.agentService.createAgent(createAgentDto, userId);
  }

  @Get('profile')
  async getAgentProfile(@Req() req: CustomRequest) {
    const userId = req.userId;
    return this.agentService.getAgentProfile(userId);
  }

  @Patch()
  async updateAgentProfile(@Body() updateAgentDto, @Req() req: CustomRequest) {
    const userId = req.userId;
    return this.agentService.updateAgentProfile(updateAgentDto, userId);
  }

  @Delete(':agentId')
  async deleteAgent(
    @Param('agentId', ParseIntPipe) agentId: number,
    @Body() body: { userRole: UserRole },
  ) {
    const { userRole } = body;
    if (userRole !== UserRole.ADMIN) {
      throw new BadRequestException('Only admins can perform this action.');
    }
    await this.agentService.deleteAgent(agentId);
    return { message: 'Agent deleted successfully.' };
  }

  @Post('documents')
  async uploadDocument(@Body() uploadDto, @Req() req: CustomRequest) {
    const userId = req.userId;
    return this.agentService.uploadDocument(uploadDto, userId);
  }

  @Get('documents')
  async getAgentDocuments(@Req() req: CustomRequest) {
    const userId = req.userId;
    return this.agentService.getAgentDocuments(userId);
  }

  @Delete('documents/:documentId')
  async deleteAgentDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
    @Req() req: CustomRequest,
  ) {
    const userId = req.userId;
    await this.agentService.deleteAgentDocument(documentId, userId);
    return { message: 'Document deleted successfully.' };
  }

  @Get('reviews')
  async getAgentReviews(@Req() req: CustomRequest) {
    const userId = req.userId;
    return this.agentService.getAgentReviews(userId);
  }

  @Get('/list')
  async getAllAgents() {
    return this.agentService.getAllAgents();
  }

  @Get(':agentId')
  async getAgentById(
    @Param('agentId', ParseIntPipe) agentId: number,
    @Body() body: { userRole: UserRole },
  ) {
    const { userRole } = body;
    if (userRole !== UserRole.ADMIN) {
      throw new BadRequestException('Only admins can access this route.');
    }
    return this.agentService.getAgentById(agentId);
  }
}
