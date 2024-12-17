import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UpdateResult, DeleteResult, QueryRunner } from "typeorm";
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
  constructor() { }

  async createAgent(agent: TAgent): Promise<Agent> {
    const { abnNumber, user } = agent;

    // Start a query runner for the transaction
    const queryRunner: QueryRunner = dbRepo(Agent).manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Check for existing Agent by ABN
      const existingAgent = await queryRunner.manager.findOne(Agent, { where: { abnNumber } });
      if (existingAgent) {
        throw new UserAlreadyExistsError(`Agent with ABN number ${abnNumber} already exists.`);
      }

      // Check for existing User by phone number
      const existingUserByPhone = await queryRunner.manager.findOne(User, { where: { phoneNumber: user.phoneNumber } });
      if (existingUserByPhone) {
        throw new UserAlreadyExistsError(`User with phone number ${user.phoneNumber} already exists.`);
      }

      // Check for existing User by email
      const existingUserByEmail = await queryRunner.manager.findOne(User, { where: { email: user.email } });
      if (existingUserByEmail) {
        throw new UserAlreadyExistsError(`User with email ${user.email} already exists.`);
      }

      // Save User entity
      const newUser = queryRunner.manager.create(User, user);
      const savedUser = await queryRunner.manager.save(User, newUser);

      // Create Agent entity with the newly created User
      const newAgent = queryRunner.manager.create(Agent, {
        agentType: agent.agentType,
        abnNumber: agent.abnNumber,
        vehicleMake: agent.vehicleMake,
        vehicleModel: agent.vehicleModel,
        vehicleYear: agent.vehicleYear,
        profilePhoto: agent.profilePhoto,
        status: AgentStatusEnum.OFFLINE,
        approvalStatus: ApprovalStatusEnum.PENDING,
        userId: savedUser.id, // Link to the saved User
      });

      const savedAgent = await queryRunner.manager.save(Agent, newAgent);

      // Commit the transaction
      await queryRunner.commitTransaction();
      return savedAgent;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Failed to create agent: ${error}`);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async getAgentById(agentId: number): Promise<Agent> {
    const agent = await dbReadRepo(Agent).findOne({
      where: { id: agentId },
      relations: ["user"],
    });

    if (!agent) {
      throw new UserNotFoundError(`Agent not found for ID ${agentId}`);
    }

    return agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    return await dbReadRepo(Agent).find({ relations: ["user"] });
  }

  async updateAgentProfile(agentId: number, updateAgent: TAgentPartial, isAdmin: boolean = false): Promise<UpdateResult> {
    const agent = await dbReadRepo(Agent).findOne({ where: { id: agentId } });

    if (!agent) {
      throw new UserNotFoundError(`Agent with ID ${agentId} not found.`);
    }

    const filteredUpdateAgent = filterEmptyValues(updateAgent);

    logger.debug(`AgentService.updateAgentProfile: Updating agent ID ${agentId} with data: ${JSON.stringify(filteredUpdateAgent)}`);

    if (!isAdmin) {
      delete filteredUpdateAgent.approvalStatus;
    }

    return await dbRepo(Agent).update(agentId, filteredUpdateAgent);
  }

  async deleteAgent(agentId: number): Promise<DeleteResult> {
    logger.debug(`AgentService.deleteAgent: Deleting agent with ID ${agentId}`);
    return await dbRepo(Agent).softDelete(agentId);
  }

  async submitDocument(agentId: number, document: TAgentDocument): Promise<TAgentDocument> {
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
      agentId: agentId
    });

    const savedDocument = await dbRepo(AgentDocument).save(newDocument);

    return {
      name: savedDocument.name,
      description: savedDocument.description,
      url: savedDocument.url,
      agentId: savedDocument.agentId,
    };
  }

  async removeDocument(agentId: number, documentId: number): Promise<void> {
    const document = await dbReadRepo(AgentDocument).findOne({
      where: { id: documentId, agentId },
    });

    if (!document) {
      throw new UserNotFoundError(`Document with ID ${documentId} not found for agent ID ${agentId}.`);
    }

    await dbRepo(AgentDocument).delete(documentId);
  }

  async getAgentDocuments(agentId: number): Promise<TAgentDocument[]> {
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
  }

  async setAgentStatus(agentId: number, status: AgentStatusEnum): Promise<UpdateResult> {
    const agent = await this.getAgentById(agentId);

    if (agent.approvalStatus !== ApprovalStatusEnum.APPROVED) {
      throw new UserInvalidDocumentError("Cannot set status. Agent is not approved.");
    }

    logger.debug(`AgentService.setAgentStatus: Setting status for agent ID ${agentId} to ${status}`);

    return await dbRepo(Agent).update(agentId, { status });
  }

}
