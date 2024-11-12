import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Agent } from '../../entity/Agent';
import { AgentDocument } from '../../entity/AgentDocument';
import { Order } from '../../entity/Order';
import { Review } from '../../entity/Review';
import { RequiredDoc } from '../../entity/RequiredDoc';
import { DatabaseService } from 'src/config/database/database.service';
import { StandardResponse } from 'src/shared/interfaces/standardResponse';

@Injectable()
export class AgentService {
  private agentRepository: Repository<Agent>;
  private agentDocumentRepository: Repository<AgentDocument>;
  private orderRepository: Repository<Order>;
  private reviewRepository: Repository<Review>;
  private requiredDocRepository: Repository<RequiredDoc>;

  constructor() {
    this.agentRepository = DatabaseService.getRepository<Agent>('Agent');
    this.agentDocumentRepository =
      DatabaseService.getRepository<AgentDocument>('AgentDocument');
    this.orderRepository = DatabaseService.getRepository<Order>('Order');
    this.reviewRepository = DatabaseService.getRepository<Review>('Review');
    this.requiredDocRepository =
      DatabaseService.getRepository<RequiredDoc>('RequiredDoc');
  }

  async createAgent(
    createAgentDto: Agent,
    userId: number,
  ): Promise<StandardResponse<Agent>> {
    const existingAgent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existingAgent) {
      throw new BadRequestException(
        'Agent profile already exists for this user.',
      );
    }

    const agent = this.agentRepository.create({
      user: { id: userId },
      ...createAgentDto,
    });

    const data = await this.agentRepository.save(agent);
    return {
      success: true,
      message: 'Agent created successfully.',
      data,
    };
  }

  async getAgentProfile(userId: number): Promise<StandardResponse<Agent>> {
    const agent = await this.agentRepository.findOne({
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
  ): Promise<StandardResponse<Agent>> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    Object.assign(agent, updateAgentDto);

    const updatedAgent = await this.agentRepository.save(agent);
    return {
      success: true,
      message: 'Agent profile updated successfully.',
      data: updatedAgent,
    };
  }

  async deleteAgent(agentId: number): Promise<StandardResponse<null>> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    await this.agentRepository.remove(agent);
    return {
      success: true,
      message: 'Agent deleted successfully.',
      data: null,
    };
  }

  async uploadDocument(
    uploadDto: any,
    userId: number,
  ): Promise<StandardResponse<AgentDocument>> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    const requiredDoc = await this.requiredDocRepository.findOne({
      where: { name: uploadDto.requiredDocType },
    });

    if (!requiredDoc) {
      throw new NotFoundException(
        `Required document type ${uploadDto.requiredDocType} not found.`,
      );
    }

    const existingDocument = await this.agentDocumentRepository.findOne({
      where: { agent: { id: agent.id }, requiredDoc: { id: requiredDoc.id } },
    });

    if (existingDocument) {
      throw new BadRequestException('Document of this type already uploaded.');
    }

    const agentDocument = this.agentDocumentRepository.create({
      agent,
      requiredDoc,
      url: uploadDto.url,
    });

    const data = await this.agentDocumentRepository.save(agentDocument);
    return {
      success: true,
      message: 'Document uploaded successfully.',
      data,
    };
  }

  async getAgentDocuments(
    userId: number,
  ): Promise<StandardResponse<AgentDocument[]>> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    const documents = await this.agentDocumentRepository.find({
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
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    const document = await this.agentDocumentRepository.findOne({
      where: { id: documentId, agent: { id: agent.id } },
    });

    if (!document) {
      throw new NotFoundException(
        `Document with ID ${documentId} not found for this agent.`,
      );
    }

    await this.agentDocumentRepository.remove(document);
    return {
      success: true,
      message: 'Document deleted successfully.',
      data: null,
    };
  }

  async getAgentReviews(userId: number): Promise<StandardResponse<Review[]>> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    const reviews = await this.reviewRepository.find({
      where: { agent: { id: agent.id } },
      relations: ['customer', 'order'],
    });

    return {
      success: true,
      message: 'Agent reviews retrieved successfully.',
      data: reviews,
    };
  }


  // Admin fns
  async getAllAgents(): Promise<StandardResponse<Agent[]>> {
    const agents = await this.agentRepository.find({
      relations: ['user', 'agentDocuments', 'agentOrders', 'reviews'],
    });

    return {
      success: true,
      message: 'All agents retrieved successfully.',
      data: agents,
    };
  }

  async getAgentById(agentId: number): Promise<StandardResponse<Agent>> {
    const agent = await this.agentRepository.findOne({
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
