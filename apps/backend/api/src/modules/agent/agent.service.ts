import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Agent } from '../../entity/Agent';
import { AgentDocument } from '../../entity/AgentDocument';
import { Review } from '../../entity/Review';
import { RequiredDoc } from '../../entity/RequiredDoc';
import { DatabaseService } from 'src/config/database/database.service';
import { StandardResponse } from 'src/shared/interfaces/standardResponse';

@Injectable()
export class AgentService {

  async createAgent(
    createAgentDto: Agent,
    userId: number,
  ): Promise<StandardResponse<any>> {
    const existingAgent = await DatabaseService.getRepository('Agent').findOne({
      where: { user: { id: userId } },
    });
    if (existingAgent) {
      throw new BadRequestException(
        'Agent profile already exists for this user.',
      );
    }

    const agent = DatabaseService.getRepository('Agent').create({
      user: { id: userId },
      ...createAgentDto,
    });

    const data = await DatabaseService.getRepository('Agent').save(agent);
    return {
      success: true,
      message: 'Agent created successfully.',
      data,
    };
  }

  async getAgentProfile(userId: number): Promise<StandardResponse<any>> {
    const agent = await DatabaseService.getRepository<Agent>('Agent').findOne({
      where: { user: { id: userId } },
      relations: ['agentDocuments', 'agentOrders', 'reviews'],
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    return {
      success: true,
      message: 'Agent profile retrieved successfully.',
      data: agent,
    };
  }

  async updateAgentProfile(
    updateAgentDto: any,
    userId: number,
  ): Promise<StandardResponse<any>> {
    const agent = await DatabaseService.getRepository('Agent').findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    Object.assign(agent, updateAgentDto);

    const updatedAgent = await DatabaseService.getRepository('Agent').save(agent);
    return {
      success: true,
      message: 'Agent profile updated successfully.',
      data: updatedAgent,
    };
  }

  async deleteAgent(agentId: number): Promise<StandardResponse<any>> {
    const agent = await DatabaseService.getRepository<Agent>('Agent').findOne({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    await DatabaseService.getRepository('Agent').remove(agent);
    return {
      success: true,
      message: 'Agent deleted successfully.',
      data: null,
    };
  }

  async uploadDocument(
    uploadDto: any,
    userId: number,
  ): Promise<StandardResponse<any>> {
    const agent = await DatabaseService.getRepository<Agent>('Agent').findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    const requiredDoc = await DatabaseService.getRepository<RequiredDoc>('RequiredDoc').findOne({
      where: { name: uploadDto.requiredDocType },
    });

    if (!requiredDoc) {
      throw new NotFoundException(
        `Required document type ${uploadDto.requiredDocType} not found.`,
      );
    }

    const existingDocument = await DatabaseService.getRepository<AgentDocument>('AgentDocument').findOne({
      where: { agent: { id: agent.id }, requiredDoc: { id: requiredDoc.id } },
    });

    if (existingDocument) {
      throw new BadRequestException('Document of this type already uploaded.');
    }

    const agentDocument = DatabaseService.getRepository('AgentDocument').create({
      agent,
      requiredDoc,
      url: uploadDto.url,
    });

    const data = await DatabaseService.getRepository('AgentDocument').save(agentDocument);
    return {
      success: true,
      message: 'Document uploaded successfully.',
      data,
    };
  }

  async getAgentDocuments(
    userId: number,
  ): Promise<StandardResponse<AgentDocument[]>> {
    const agent = await DatabaseService.getRepository<Agent>('Agent').findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    const documents = await DatabaseService.getRepository<AgentDocument>('AgentDocument').find({
      where: { agent: { id: agent.id } },
      relations: ['requiredDoc'],
    });

    return {
      success: true,
      message: 'Agent documents retrieved successfully.',
      data: documents,
    };
  }

  async deleteAgentDocument(
    documentId: number,
    userId: number,
  ): Promise<StandardResponse<null>> {
    const agent = await DatabaseService.getRepository<Agent>('Agent').findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    const document = await DatabaseService.getRepository<AgentDocument>('AgentDocument').findOne({
      where: { id: documentId, agent: { id: agent.id } },
    });

    if (!document) {
      throw new NotFoundException(
        `Document with ID ${documentId} not found for this agent.`,
      );
    }

    await DatabaseService.getRepository('AgentDocument').remove(document);
    return {
      success: true,
      message: 'Document deleted successfully.',
      data: null,
    };
  }

  async getAgentReviews(userId: number): Promise<StandardResponse<any>> {
    const agent = await DatabaseService.getRepository<Agent>('Agent').findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    const reviews = await DatabaseService.getRepository('Review').find({
      where: { agent: { id: agent.id } },
      relations: ['customer', 'order'],
    });

    return {
      success: true,
      message: 'Agent reviews retrieved successfully.',
      data: reviews,
    };
  }

  async getAllAgents(): Promise<StandardResponse<any>> {
    const agents = await DatabaseService.getRepository('Agent').find({
      relations: ['user', 'agentDocuments', 'agentOrders', 'reviews'],
    });

    return {
      success: true,
      message: 'All agents retrieved successfully.',
      data: agents,
    };
  }

  async getAgentById(agentId: number): Promise<StandardResponse<any>> {
    const agent = await DatabaseService.getRepository('Agent').findOne({
      where: { id: agentId },
      relations: ['user', 'agentDocuments', 'agentOrders', 'reviews'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    return {
      success: true,
      message: 'Agent retrieved successfully.',
      data: agent,
    };
  }
}

