import { Injectable, InternalServerErrorException, HttpException, HttpStatus } from "@nestjs/common";
import { UpdateResult, DeleteResult, Connection, QueryFailedError } from "typeorm";
import { InjectConnection } from "@nestjs/typeorm";

import { Agent } from "../../entity/Agent";
import { User } from "../../entity/User";
import { AgentDocument } from "../../entity/AgentDocument";
import { RequiredDocument } from "../../entity/RequiredDocument";
import { TAgent, TAgentDocument, TAgentPartial } from "./agent.types";
import { ApprovalStatusEnum, AgentStatusEnum } from "../../shared/enums";
import {
  UserAlreadyExistsError,
  UserDocumentAlreadyExistsError,
  UserInvalidDocumentError,
  UserNotFoundError
} from "../../shared/errors/user";
import { filterEmptyValues } from "../../utils/filter";
import { logger } from "../../logger";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { UnauthorizedError } from "../../shared/errors/authErrors";

@Injectable()
export class AgentService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) { }

  async createAgent(agent: TAgent): Promise<Agent> {
    const { abnNumber, user } = agent;

    try {
      const existingAgent = await dbReadRepo(Agent).findOne({
        where: { abnNumber },
      });

      if (existingAgent) {
        logger.error(`AgentService.createAgent: Agent with ABN number ${abnNumber} already exists.`);
        throw new UnauthorizedError(`Agent with ABN number ${abnNumber} already exists.`);
      }

      const existingUserByPhone = await dbReadRepo(User).findOne({
        where: { phoneNumber: user.phoneNumber },
      });

      if (existingUserByPhone) {
        logger.error(`AgentService.createAgent: User with phone number ${user.phoneNumber} already exists.`);
        throw new UnauthorizedError(`User with phone number ${user.phoneNumber} already exists.`);
      }

      const existingUserByEmail = await dbReadRepo(User).findOne({
        where: { email: user.email },
      });

      if (existingUserByEmail) {
        logger.error(`AgentService.createAgent: User with email ${user.email} already exists.`);
        throw new UnauthorizedError(`User with email ${user.email} already exists.`);
      }

      return await this.connection.transaction(async manager => {
        const newUser = dbRepo(User).create(user);
        const savedUser = await manager.save(newUser);

        const newAgent = dbRepo(Agent).create({
          agentType: agent.agentType,
          abnNumber: agent.abnNumber,
          vehicleMake: agent.vehicleMake,
          vehicleModel: agent.vehicleModel,
          vehicleYear: agent.vehicleYear,
          profilePhoto: agent.profilePhoto,
          status: AgentStatusEnum.OFFLINE,
          approvalStatus: ApprovalStatusEnum.PENDING,
          user: savedUser,
        });

        const savedAgent = await manager.save(newAgent);
        return savedAgent;
      });
    } catch (error) {
      logger.error(`AgentService.createAgent: Failed to create agent. Error: ${error}`);
      throw new InternalServerErrorException(error);
    }
  }

  async getAgentById(agentId: number): Promise<Agent> {
    try {
      const agent = await dbReadRepo(Agent).findOne({
        where: { id: agentId },
        relations: ["user"],
      });

      if (!agent) {
        throw new UserNotFoundError(`Agent not found for ID ${agentId}`);
      }

      return agent;
    } catch (error) {
      logger.error(`AgentService.getAgentById: Failed to fetch agent with ID ${agentId}. Error: ${error}`);
      throw new InternalServerErrorException(error);
    }
  }

  async getAllAgents(): Promise<Agent[]> {
    try {
      return await dbReadRepo(Agent).find({ relations: ["user"] });
    } catch (error) {
      logger.error(`AgentService.getAllAgents: Failed to fetch all agents. Error: ${error}`);
      throw new InternalServerErrorException("Failed to fetch all agents.");
    }
  }

  async updateAgentProfile(agentId: number, updateAgent: TAgentPartial, isAdmin: boolean = false): Promise<UpdateResult> {
    try {
      const agent = await dbReadRepo(Agent).findOne({ where: { id: agentId } });

      if (!agent) {
        throw new UserNotFoundError(`Agent with ID ${agentId} not found.`);
      }

      const filteredUpdateAgent = filterEmptyValues(updateAgent);

      logger.info(`AgentService.updateAgentProfile: Updating agent ID ${agentId} with data: ${JSON.stringify(filteredUpdateAgent)}`);

      if (!isAdmin) {
        delete filteredUpdateAgent.approvalStatus;
        delete filteredUpdateAgent.status;
      }

      return await dbRepo(Agent).update(agentId, filteredUpdateAgent);
    } catch (error) {
      logger.error(`AgentService.updateAgentProfile: Failed to update agent ID ${agentId}. Error: ${error}`);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteAgent(agentId: number): Promise<DeleteResult> {
    try {
      logger.info(`AgentService.deleteAgent: Deleting agent with ID ${agentId}`);
      return await dbRepo(Agent).softDelete(agentId);
    } catch (error) {
      logger.error(`AgentService.deleteAgent: Failed to delete agent ID ${agentId}. Error: ${error}`);
      throw new InternalServerErrorException("Failed to delete agent.");
    }
  }

  async submitDocument(agentId: number, document: TAgentDocument): Promise<TAgentDocument> {
    try {
      const agent = await this.getAgentById(agentId);
      const { agentType } = agent;

      const requiredDocs = await dbReadRepo(RequiredDocument).find({
        where: { agentType },
      });

      const requiredDocNames = requiredDocs.map(doc => doc.name);

      if (!requiredDocNames.includes(document.name)) {
        throw new UserInvalidDocumentError(`${document.name} is not a valid document for agent type ${agentType}.`);
      }

      const existingDoc = await dbReadRepo(AgentDocument).findOne({
        where: { agentId, name: document.name },
      });

      if (existingDoc) {
        throw new UserDocumentAlreadyExistsError(`Document ${document.name} already exists for agent.`);
      }

      const newDocument = dbRepo(AgentDocument).create({
        name: document.name,
        description: document.description,
        url: document.url,
        agentId:agentId
      });

      const savedDocument = await dbRepo(AgentDocument).save(newDocument);

      return {
        name: savedDocument.name,
        description: savedDocument.description,
        url: savedDocument.url,
        agentId: savedDocument.agentId,
      };
    } catch (error) {
      logger.error(`AgentService.submitDocument: Failed to submit document for agent ID ${agentId}. Error: ${error}`);
      throw new InternalServerErrorException(error);
    }
  }

  async removeDocument(agentId: number, documentId: number): Promise<void> {
    try {
      const document = await dbReadRepo(AgentDocument).findOne({
        where: { id: documentId, agentId },
      });

      if (!document) {
        throw new UserNotFoundError(`Document with ID ${documentId} not found for agent ID ${agentId}.`);
      }

      await dbRepo(AgentDocument).delete(documentId);
    } catch (error) {
      logger.error(`AgentService.removeDocument: Failed to remove document ID ${documentId} for agent ID ${agentId}. Error: ${error}`);
      throw new InternalServerErrorException(error);
    }
  }

  async getAgentDocuments(agentId: number): Promise<TAgentDocument[]> {
    try {
      logger.debug(`AgentService.getAgentDocuments: Fetching documents for agent ID ${agentId}`);
      const documents = await dbReadRepo(AgentDocument).find({
        where: { agentId },
      });

      return documents.map(doc => ({
        name: doc.name,
        description: doc.description,
        url: doc.url,
        agentId: doc.agentId,
      }));
    } catch (error) {
      logger.error(`AgentService.getAgentDocuments: Failed to fetch documents for agent ID ${agentId}. Error: ${error}`);
      throw new InternalServerErrorException("Failed to fetch agent documents.");
    }
  }

  async setAgentStatus(agentId: number, status: AgentStatusEnum): Promise<UpdateResult> {
    try {
      const agent = await this.getAgentById(agentId);

      if (agent.approvalStatus !== ApprovalStatusEnum.APPROVED) {
        throw new UserInvalidDocumentError("Cannot set status. Agent is not approved.");
      }

      logger.info(`AgentService.setAgentStatus: Setting status for agent ID ${agentId} to ${status}`);

      return await dbRepo(Agent).update(agentId, { status });
    } catch (error) {
      logger.error(`AgentService.setAgentStatus: Failed to set status for agent ID ${agentId}. Error: ${error}`);
      throw new InternalServerErrorException(error);
    }
  }

  async approveAgent(agentId: number): Promise<Agent> {
    try {
      const agent = await this.getAgentById(agentId);

      if (agent.approvalStatus === ApprovalStatusEnum.APPROVED) {
        throw new InternalServerErrorException("Agent is already approved.");
      }

      await dbRepo(Agent).update(agentId, { approvalStatus: ApprovalStatusEnum.APPROVED });

      logger.info(`AgentService.approveAgent: Agent ID ${agentId} approved.`);

      return await this.getAgentById(agentId);
    } catch (error) {
      logger.error(`AgentService.approveAgent: Failed to approve agent ID ${agentId}. Error: ${error}`);
      throw new InternalServerErrorException(error);
    }
  }

  async rejectAgent(agentId: number): Promise<Agent> {
    try {
      const agent = await this.getAgentById(agentId);

      if (agent.approvalStatus === ApprovalStatusEnum.REJECTED) {
        throw new InternalServerErrorException("Agent is already rejected.");
      }

      await dbRepo(Agent).update(agentId, { approvalStatus: ApprovalStatusEnum.REJECTED });

      logger.info(`AgentService.rejectAgent: Agent ID ${agentId} rejected.`);

      return await this.getAgentById(agentId);
    } catch (error) {
      logger.error(`AgentService.rejectAgent: Failed to reject agent ID ${agentId}. Error: ${error}`);
      throw new InternalServerErrorException(error);
    }
  }
}
