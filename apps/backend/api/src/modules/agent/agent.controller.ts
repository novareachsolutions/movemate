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
import { ICustomRequest } from 'src/shared/interfaces/customResponse';
import { AgentService } from './agent.service';
import { UserRoleEnum } from 'src/common/enums/userRole';

@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post("/signup")
  async create(@Body() createAgentDto, @Req() req: ICustomRequest) {
    const userId = req.userId;
    return this.agentService.createAgent(createAgentDto, userId);
  }

  @Get('profile')
  async getProfile(@Req() req: ICustomRequest) {
    const userId = req.userId;
    return this.agentService.getAgentProfile(userId);
  }

  @Patch("/update")
  async updateProfile(@Body() updateAgentDto, @Req() req: ICustomRequest) {
    const userId = req.userId;
    return this.agentService.updateAgentProfile(updateAgentDto, userId);
  }

  @Delete(':agentId')
  async deleteAgent(
    @Param('agentId', ParseIntPipe) agentId: number,
    @Body() body: { userRole: UserRoleEnum },
  ) {
    const { userRole } = body;
    if (userRole !== UserRoleEnum.ADMIN) {
      throw new BadRequestException('Only admins can perform this action.');
    }
    await this.agentService.deleteAgent(agentId);
    return { message: 'Agent deleted successfully.' };
  }

  @Post('documents')
  async uploadDocument(@Body() uploadDto, @Req() req: ICustomRequest) {
    const userId = req.userId;
    return this.agentService.uploadDocument(uploadDto, userId);
  }

  @Get('documents')
  async getAgentDocuments(@Req() req: ICustomRequest) {
    const userId = req.userId;
    return this.agentService.getAgentDocuments(userId);
  }

  @Delete('documents/:documentId')
  async deleteAgentDocument(
    @Param('documentId', ParseIntPipe) documentId: number,
    @Req() req: ICustomRequest,
  ) {
    const userId = req.userId;
    await this.agentService.deleteAgentDocument(documentId, userId);
    return { message: 'Document deleted successfully.' };
  }

  @Get('reviews')
  async getAgentReviews(@Req() req: ICustomRequest) {
    const userId = req.userId;
    return this.agentService.getAgentReviews(userId);
  }

  @Get('/list')
  async getAllAgents() {
    return this.agentService.getAllAgents();
  }

}
