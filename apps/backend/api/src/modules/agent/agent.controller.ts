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
import { AgentService } from './agent.service';
import { UserRoleEnum } from 'src/common/enums/userRole';
import { ICustomRequest } from 'src/shared/interfaces/customRequest';

@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) { }

  @Post('/signup')
  async create(@Body() createAgentDto, @Req() req: ICustomRequest) {
    const data = await this.agentService.createAgent(createAgentDto, req.userId);
    return {
      success: true,
      message: 'Agent created successfully.',
      data,
    };
  }

  @Get('profile')
  async getProfile(@Req() req: ICustomRequest) {
    const data = await this.agentService.getAgentProfile(req.userId);
    return {
      success: true,
      message: 'Agent profile retrieved successfully.',
      data,
    };
  }

  @Patch('/update')
  async updateProfile(@Body() updateAgentDto, @Req() req: ICustomRequest) {
    const data = await this.agentService.updateAgentProfile(
      updateAgentDto,
      req.userId,
    );
    return {
      success: true,
      message: 'Agent profile updated successfully.',
      data,
    };
  }

  @Delete(':agentId')
  async delete(
    @Param('agentId', ParseIntPipe) agentId: number,
    @Body() body: { userRole: UserRoleEnum },
  ) {
    const { userRole } = body;
    if (userRole !== UserRoleEnum.ADMIN) {
      throw new BadRequestException('Only admins can perform this action.');
    }
    await this.agentService.deleteAgent(agentId);
    return {
      success: true,
      message: 'Agent deleted successfully.',
      data: null,
    };
  }

  @Post('documents')
  async uploadDocument(@Body() uploadDto, @Req() req: ICustomRequest) {
    const userId = req.userId;
    const data = await this.agentService.uploadDocument(uploadDto, userId);
    return {
      success: true,
      message: 'Document uploaded successfully.',
      data,
    };
  }

  @Get('documents')
  async getDocuments(@Req() req: ICustomRequest) {
    const data = await this.agentService.getAgentDocuments(req.userId);
    return {
      success: true,
      message: 'Agent documents retrieved successfully.',
      data,
    };
  }

  @Delete('documents/:documentId')
  async deleteDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
    @Req() req: ICustomRequest,
  ) {
    await this.agentService.deleteAgentDocument(documentId, req.userId);
    return {
      success: true,
      message: 'Document deleted successfully.',
      data: null,
    };
  }

  @Get('reviews')
  async getReviews(@Req() req: ICustomRequest) {
    const data = await this.agentService.getAgentReviews(req.userId);
    return {
      success: true,
      message: 'Agent reviews retrieved successfully.',
      data,
    };
  }

  @Get('/list')
  async getAll() {
    const data = await this.agentService.getAllAgents();
    return {
      success: true,
      message: 'All agents retrieved successfully.',
      data,
    };
  }
}
