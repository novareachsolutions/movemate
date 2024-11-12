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
import { StandardResponse } from 'src/shared/interfaces/standardResponse';
import { createResponse } from 'src/common/helpers/response.helpers';

@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('/signup')
  async create(
    @Body() createAgentDto,
    @Req() req: ICustomRequest,
  ): Promise<StandardResponse<any>> {
    const userId = req.userId;
    const data = await this.agentService.createAgent(createAgentDto, userId);
    return createResponse(true, 'Agent created successfully.', data);
  }

  @Get('profile')
  async getProfile(@Req() req: ICustomRequest): Promise<StandardResponse<any>> {
    const userId = req.userId;
    const data = await this.agentService.getAgentProfile(userId);
    return createResponse(true, 'Agent profile retrieved successfully.', data);
  }

  @Patch('/update')
  async updateProfile(
    @Body() updateAgentDto,
    @Req() req: ICustomRequest,
  ): Promise<StandardResponse<any>> {
    const userId = req.userId;
    const data = await this.agentService.updateAgentProfile(
      updateAgentDto,
      userId,
    );
    return createResponse(true, 'Agent profile updated successfully.', data);
  }

  @Delete(':agentId')
  async deleteAgent(
    @Param('agentId', ParseIntPipe) agentId: number,
    @Body() body: { userRole: UserRoleEnum },
  ): Promise<StandardResponse<null>> {
    const { userRole } = body;
    if (userRole !== UserRoleEnum.ADMIN) {
      throw new BadRequestException('Only admins can perform this action.');
    }
    await this.agentService.deleteAgent(agentId);
    return createResponse(true, 'Agent deleted successfully.', null);
  }

  @Post('documents')
  async uploadDocument(
    @Body() uploadDto,
    @Req() req: ICustomRequest,
  ): Promise<StandardResponse<any>> {
    const userId = req.userId;
    const data = await this.agentService.uploadDocument(uploadDto, userId);
    return createResponse(true, 'Document uploaded successfully.', data);
  }

  @Get('documents')
  async getAgentDocuments(
    @Req() req: ICustomRequest,
  ): Promise<StandardResponse<any>> {
    const userId = req.userId;
    const data = await this.agentService.getAgentDocuments(userId);
    return createResponse(
      true,
      'Agent documents retrieved successfully.',
      data,
    );
  }

  @Delete('documents/:documentId')
  async deleteAgentDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
    @Req() req: ICustomRequest,
  ): Promise<StandardResponse<null>> {
    const userId = req.userId;
    await this.agentService.deleteAgentDocument(documentId, userId);
    return createResponse(true, 'Document deleted successfully.', null);
  }

  @Get('reviews')
  async getAgentReviews(
    @Req() req: ICustomRequest,
  ): Promise<StandardResponse<any>> {
    const userId = req.userId;
    const data = await this.agentService.getAgentReviews(userId);
    return createResponse(true, 'Agent reviews retrieved successfully.', data);
  }

  @Get('/list')
  async getAllAgents(): Promise<StandardResponse<any>> {
    const data = await this.agentService.getAllAgents();
    return createResponse(true, 'All agents retrieved successfully.', data);
  }
}
