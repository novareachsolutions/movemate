// src/modules/agent/agent.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Agent } from '../../entity/Agent';
import { AgentDocument } from '../../entity/AgentDocument';
import { Order } from '../../entity/Order';
import { Review } from '../../entity/Review';
import { RequiredDoc } from '../../entity/RequiredDoc';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,

    @InjectRepository(AgentDocument)
    private readonly agentDocumentRepository: Repository<AgentDocument>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(RequiredDoc)
    private readonly requiredDocRepository: Repository<RequiredDoc>,

    private readonly configService: ConfigService,
  ) {}

  async createAgent(createAgentDto, userId: number) {
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

    return this.agentRepository.save(agent);
  }

  async getAgentProfile(userId: number): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['agentDocuments', 'agentOrders', 'reviews'],
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    return agent;
  }

  async updateAgentProfile(
    updateAgentDto: any,
    userId: number,
  ): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    Object.assign(agent, updateAgentDto);

    return this.agentRepository.save(agent);
  }

  async deleteAgent(agentId: number): Promise<void> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    await this.agentRepository.remove(agent);
  }

  async uploadDocument(uploadDto: any, userId: number): Promise<AgentDocument> {
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

    return this.agentDocumentRepository.save(agentDocument);
  }

  async getAgentDocuments(userId: number): Promise<AgentDocument[]> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    return this.agentDocumentRepository.find({
      where: { agent: { id: agent.id } },
      relations: ['requiredDoc'],
    });
  }

  async deleteAgentDocument(documentId: number, userId: number): Promise<void> {
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
  }

  async getAgentReviews(userId: number): Promise<Review[]> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    return this.reviewRepository.find({
      where: { agent: { id: agent.id } },
      relations: ['customer', 'order'],
    });
  }

  async getAllAgents(): Promise<Agent[]> {
    return this.agentRepository.find({
      relations: ['user', 'agentDocuments', 'agentOrders', 'reviews'],
    });
  }

  async getAgentById(agentId: number): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['user', 'agentDocuments', 'agentOrders', 'reviews'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    return agent;
  }

  async updateOrderStatus(
    status: string,
    orderId: number,
    userId: number,
  ): Promise<Order> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!agent) {
      throw new NotFoundException(
        `Agent profile not found for user ID ${userId}.`,
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId, agent: { id: agent.id } },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${orderId} not found for this agent.`,
      );
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
      );
    }

    order.status = status as any;

    return this.orderRepository.save(order);
  }
}
