import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';

import { Agent } from '../../entity/Agent';
import { AgentDocument } from '../../entity/AgentDocument';
import { AgentReview } from '../../entity/AgentReview';
import { RequiredDocument } from '../../entity/RequiredDocument';
import { logger } from '../../logger';
import { UserRoleEnum } from '../../shared/enums';
import { filterEmptyValues } from '../../utils/filter';
import { dbReadRepo, dbRepo } from '../database/database.service';
import {
  TAgent,
  TAgentDocument,
  TAgentPartial,
  TGetAgentProfile,
} from './agent.types';

@Injectable()
export class AgentService {
  async createAgent(agent: TAgent): Promise<Agent> {
    const existingAgent = await dbReadRepo(Agent).findOne({
      where: {
        abnNumber: agent.abnNumber,
      },
    });
    if (existingAgent) {
      logger.error(
        `AgentService.createAgent: Agent with ABN number ${agent.abnNumber} already exists.`,
      );
      throw new BadRequestException(
        `Agent with this ABN number already exists. Provided ABN number: ${agent.abnNumber}`,
      );
    }

    const response = await dbRepo(Agent).save({
      ...agent,
      user: { id: agent.userId },
    });

    return response;
  }

  async getAgentById(agentId: number): Promise<Agent> {
    const agent = await dbReadRepo(Agent).findOne({
      where: { id: agentId },
      relations: ['user'],
    });
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    return agent;
  }

  async getAgentProfile(input: TGetAgentProfile): Promise<Agent> {
    const filteredInput = filterEmptyValues(input);
    const agent = await dbReadRepo(Agent).findOne({
      where: filteredInput,
      relations: ['user'],
    });

    if (!agent) {
      throw new NotFoundException(
        `No agent found with the provided details. Details: ${JSON.stringify(
          input,
        )}`,
      );
    }

    return agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    return await dbReadRepo(Agent).find();
  }

  async updateAgentProfile(
    id: number,
    updateAgent: TAgentPartial,
  ): Promise<UpdateResult> {
    const agent = await dbReadRepo(Agent).findOne({
      where: { id },
    });
    if (!agent) {
      throw new NotFoundException(`Agent profile not found for ID ${id}.`);
    }

    const filteredUpdateAgent = filterEmptyValues(updateAgent);
    logger.debug(
      `Updating agent with ID ${id} with data: ${JSON.stringify(filteredUpdateAgent)}`,
    );
    return await dbRepo(Agent).update(id, filteredUpdateAgent);
  }

  async deleteAgent(agentId: number): Promise<UpdateResult> {
    logger.debug(`Deleting agent with ID ${agentId}`);
    return await dbRepo(Agent).softDelete(agentId);
  }

  async uploadDocument(
    agentId: number,
    uploadDocumnent: TAgentDocument,
  ): Promise<AgentDocument> {
    const requiredDocument = await dbReadRepo(RequiredDocument).findOne({
      where: { role: UserRoleEnum.AGENT },
    });

    if (!requiredDocument.documents.includes(uploadDocumnent.name)) {
      throw new BadRequestException(
        `Document ${uploadDocumnent.name} is not required for agents.`,
      );
    }

    const existingDocument = await dbReadRepo(AgentDocument).findOne({
      where: { agent: { id: agentId }, name: uploadDocumnent.name },
    });

    if (existingDocument) {
      throw new BadRequestException(
        `Document ${uploadDocumnent.name} already exists for this agent.`,
      );
    }

    const response = await dbRepo(AgentDocument).save({
      ...uploadDocumnent,
      agent: { id: agentId },
    });

    return response;
  }

  async getAgentDocuments(id: number): Promise<AgentDocument[]> {
    logger.debug(`Getting documents for agent with ID ${id}`);
    return await dbReadRepo(AgentDocument).find({
      where: { id },
    });
  }

  async deleteAgentDocument(documentId: number): Promise<UpdateResult> {
    logger.debug(`Deleting document with ID ${documentId}`);
    return await dbRepo(AgentDocument).softDelete(documentId);
  }

  async getAgentReviews(agentId: number): Promise<AgentReview[]> {
    return await dbReadRepo(AgentReview).find({
      where: { agentId },
      relations: ['agent'],
    });
  }
}
