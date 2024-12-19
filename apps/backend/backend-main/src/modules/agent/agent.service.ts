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

@Injectable()
export class AgentService {
  constructor() { }

  async createAgent(agent: TAgent): Promise<Agent> {
    const { abnNumber, user } = agent;
    const queryRunner: QueryRunner = dbRepo(Agent).manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      logger.debug(`AgentService.createAgent: Checking if agent with ABN ${abnNumber} exists.`);
      const existingAgent = await queryRunner.manager.findOne(Agent, { where: { abnNumber } });
      if (existingAgent) {
        logger.error(`AgentService.createAgent: Agent with ABN ${abnNumber} already exists.`);
        throw new UserAlreadyExistsError(`Agent with ABN number ${abnNumber} already exists.`);
      }

      logger.debug(`AgentService.createAgent: Checking if user with phone ${user.phoneNumber} or email ${user.email} exists.`);
      const existingUserByPhone = await queryRunner.manager.findOne(User, { where: { phoneNumber: user.phoneNumber } });
      const existingUserByEmail = await queryRunner.manager.findOne(User, { where: { email: user.email } });

      if (existingUserByPhone || existingUserByEmail) {
        logger.error(`AgentService.createAgent: User with phone ${user.phoneNumber} or email ${user.email} already exists.`);
        throw new UserAlreadyExistsError(`User with phone number or email already exists.`);
      }

      logger.debug(`AgentService.createAgent: Creating user and agent records.`);
      const newUser = queryRunner.manager.create(User, user);
      const savedUser = await queryRunner.manager.save(User, newUser);

      const newAgent = queryRunner.manager.create(Agent, {
        agentType: agent.agentType,
        abnNumber: agent.abnNumber,
        vehicleMake: agent.vehicleMake,
        vehicleModel: agent.vehicleModel,
        vehicleYear: agent.vehicleYear,
        profilePhoto: agent.profilePhoto,
        status: AgentStatusEnum.OFFLINE,
        approvalStatus: ApprovalStatusEnum.PENDING,
        userId: savedUser.id,
      });

      const savedAgent = await queryRunner.manager.save(Agent, newAgent);
      logger.debug(`AgentService.createAgent: Agent with ID ${savedAgent.id} created successfully.`);
      await queryRunner.commitTransaction();

      return savedAgent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`AgentService.createAgent: Error occurred - ${error.message}`);
      throw new InternalServerErrorException(`Failed to create agent: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getAgentById(agentId: number): Promise<Agent> {
    logger.debug(`AgentService.getAgentById: Fetching agent with ID ${agentId}.`);
    const agent = await dbReadRepo(Agent).findOne({
      where: { id: agentId },
      relations: ["user"],
    });

    if (!agent) {
      logger.error(`AgentService.getAgentById: Agent with ID ${agentId} not found.`);
      throw new UserNotFoundError(`Agent not found for ID ${agentId}`);
    }

    return agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    logger.debug(`AgentService.getAllAgents: Fetching all agents.`);
    return await dbReadRepo(Agent).find({ relations: ["user"] });
  }

  async updateAgentProfile(agentId: number, updateAgent: TAgentPartial, isAdmin: boolean = false): Promise<UpdateResult> {
    logger.debug(`AgentService.updateAgentProfile: Updating agent ID ${agentId}.`);
    const agent = await dbReadRepo(Agent).findOne({ where: { id: agentId } });

    if (!agent) {
      logger.error(`AgentService.updateAgentProfile: Agent with ID ${agentId} not found.`);
      throw new UserNotFoundError(`Agent with ID ${agentId} not found.`);
    }

    const filteredUpdateAgent = filterEmptyValues(updateAgent);
    if (!isAdmin) {
      delete filteredUpdateAgent.approvalStatus;
    }

    logger.debug(`AgentService.updateAgentProfile: Update data - ${JSON.stringify(filteredUpdateAgent)}.`);
    return await dbRepo(Agent).update(agentId, filteredUpdateAgent);
  }

  async deleteAgent(agentId: number): Promise<DeleteResult> {
    logger.debug(`AgentService.deleteAgent: Deleting agent with ID ${agentId}.`);
    return await dbRepo(Agent).softDelete(agentId);
  }

  async submitDocument(agentId: number, document: TAgentDocument): Promise<TAgentDocument> {
    logger.debug(`AgentService.submitDocument: Submitting document for agent ID ${agentId}.`);
    const agent = await this.getAgentById(agentId);
    const requiredDocs = await dbReadRepo(RequiredDocument).find({ where: { agentType: agent.agentType } });
    const requiredDocNames = requiredDocs.map(doc => doc.name);

    if (!requiredDocNames.includes(document.name)) {
      logger.error(`AgentService.submitDocument: Invalid document ${document.name}.`);
      throw new UserInvalidDocumentError(`${document.name} is not a valid document.`);
    }

    const existingDoc = await dbReadRepo(AgentDocument).findOne({
      where: { agentId, name: document.name },
    });

    if (existingDoc) {
      logger.error(`AgentService.submitDocument: Document ${document.name} already exists.`);
      throw new UserDocumentAlreadyExistsError(`Document ${document.name} already exists.`);
    }

    const newDocument = dbRepo(AgentDocument).create({
      name: document.name,
      description: document.description,
      url: document.url,
      agentId: agentId,
    });

    const savedDocument = await dbRepo(AgentDocument).save(newDocument);
    logger.debug(`AgentService.submitDocument: Document ${document.name} saved for agent ID ${agentId}.`);

    return {
      name: savedDocument.name,
      description: savedDocument.description,
      url: savedDocument.url,
      agentId: savedDocument.agentId,
    };
  }

  async removeDocument(agentId: number, documentId: number): Promise<void> {
    logger.debug(`AgentService.removeDocument: Removing document ID ${documentId} for agent ID ${agentId}.`);
    const document = await dbReadRepo(AgentDocument).findOne({
      where: { id: documentId, agentId },
    });

    if (!document) {
      logger.error(`AgentService.removeDocument: Document ID ${documentId} not found.`);
      throw new UserNotFoundError(`Document with ID ${documentId} not found.`);
    }

    await dbRepo(AgentDocument).delete(documentId);
  }

  async getAgentDocuments(agentId: number): Promise<TAgentDocument[]> {
    logger.debug(`AgentService.getAgentDocuments: Fetching documents for agent ID ${agentId}.`);
    const documents = await dbReadRepo(AgentDocument).find({ where: { agentId } });

    return documents.map(doc => ({
      name: doc.name,
      description: doc.description,
      url: doc.url,
      agentId: doc.agentId,
    }));
  }

  async setAgentStatus(agentId: number, status: AgentStatusEnum): Promise<UpdateResult> {
    logger.debug(`AgentService.setAgentStatus: Setting status for agent ID ${agentId} to ${status}.`);
    const agent = await this.getAgentById(agentId);

    if (agent.approvalStatus !== ApprovalStatusEnum.APPROVED) {
      logger.error(`AgentService.setAgentStatus: Cannot set status. Agent ID ${agentId} not approved.`);
      throw new UserInvalidDocumentError("Cannot set status. Agent is not approved.");
    }

    return await dbRepo(Agent).update(agentId, { status });
  }
}
