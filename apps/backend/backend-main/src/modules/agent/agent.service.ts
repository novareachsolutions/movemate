import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { UpdateResult, DeleteResult } from "typeorm";

import { Agent } from "../../entity/Agent";
import { AgentDocument } from "../../entity/AgentDocument";
import { RequiredDocument } from "../../entity/RequiredDocument";
import { ApprovalStatusEnum, AgentStatusEnum, AgentTypeEnum } from "../../shared/enums";
import {
  UserAlreadyExistsError,
  UserDocumentAlreadyExistsError,
  UserInvalidDocumentError,
  UserNotFoundError,
} from "../../shared/errors/user";
import { filterEmptyValues } from "../../utils/filter";
import { dbReadRepo, dbRepo } from "../database/database.service";
import {
  TAgent,
  TAgentDocument,
  TAgentPartial,
} from "./agent.types";
import { logger } from "../../logger";
import { User } from "../../entity/User";

@Injectable()
export class AgentService {
  /**
   * Create a new Agent (Signup)
   * @param agent - Agent data
   * @returns The created Agent entity
   */
  async createAgent(agent: TAgent): Promise<Agent> {
    const { abnNumber } = agent;

    try {
      // Check if an Agent with the same ABN number already exists
      const existingAgent = await dbReadRepo(Agent).findOne({
        where: { abnNumber },
      });

      if (existingAgent) {
        logger.error(
          `AgentService.createAgent: Agent with ABN number ${abnNumber} already exists.`,
        );
        throw new UserAlreadyExistsError(
          `Agent with ABN number ${abnNumber} already exists.`,
        );
      }

      // Create a new Agent instance with nested User data
      const newAgent =  dbRepo(Agent).create({
        agentType: agent.agentType,
        abnNumber: agent.abnNumber,
        vehicleMake: agent.vehicleMake,
        vehicleModel: agent.vehicleModel,
        vehicleYear: agent.vehicleYear,
        profilePhoto: agent.profilePhoto,
        status: AgentStatusEnum.OFFLINE, 
        approvalStatus: ApprovalStatusEnum.PENDING, 
        user:  dbRepo(User).create(agent.user), 
      });

      const savedAgent =  await dbRepo(Agent).save(newAgent);

      return savedAgent;
    } catch (error) {
      logger.error(
        `AgentService.createAgent: Failed to create agent. Error: ${error.message}`,
      );

      // Handle specific errors if needed
      if (error instanceof UserAlreadyExistsError) {
        throw error;
      }

      throw new HttpException(
        'Failed to create agent.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
   * Retrieve Agent by User ID
   * @param userId - ID of the User
   * @returns Agent entity
   */
  async getAgentByUserId(userId: number): Promise<Agent> {
    try {
      const agent = await dbReadRepo(Agent).findOne({
        where: { userId },
        relations: ["user"],
      });

      if (!agent) {
        throw new UserNotFoundError(`Agent not found for User ID ${userId}`);
      }

      return agent;
    } catch (error) {
      logger.error(
        `AgentService.getAgentByUserId: Failed to fetch agent for User ID ${userId}. Error: ${error.message}`,
      );
      if (error instanceof UserNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException("Failed to fetch agent.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieve Agent ID by User ID
   * @param userId - ID of the User
   * @returns Agent ID
   */
  async getAgentIdByUserId(userId: number): Promise<number> {
    const agent = await this.getAgentByUserId(userId);
    return agent.id;
  }

  /**
   * Retrieve Agent by Agent ID (Admin Operations)
   * @param agentId - ID of the Agent
   * @returns Agent entity
   */
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
      logger.error(
        `AgentService.getAgentById: Failed to fetch agent with ID ${agentId}. Error: ${error.message}`,
      );
      if (error instanceof UserNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException("Failed to fetch agent.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieve all Agents (Admin Operation)
   * @returns Array of Agents
   */
  async getAllAgents(): Promise<Agent[]> {
    try {
      return await dbReadRepo(Agent).find({ relations: ["user"] });
    } catch (error) {
      logger.error(
        `AgentService.getAllAgents: Failed to fetch all agents. Error: ${error.message}`,
      );
      throw new HttpException("Failed to fetch all agents.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update Agent Profile
   * @param agentId - ID of the Agent
   * @param updateAgent - Partial Agent data for update
   * @param isAdmin - Flag indicating if the updater is Admin
   * @returns UpdateResult
   */
  async updateAgentProfile(
    agentId: number,
    updateAgent: TAgentPartial,
    isAdmin: boolean = false,
  ): Promise<UpdateResult> {
    try {
      const agent = await dbReadRepo(Agent).findOne({ where: { id: agentId } });

      if (!agent) {
        throw new UserNotFoundError(`Agent with ID ${agentId} not found.`);
      }

      const filteredUpdateAgent = filterEmptyValues(updateAgent);

      logger.info(
        `AgentService.updateAgentProfile: Updating agent ID ${agentId} with data: ${JSON.stringify(
          filteredUpdateAgent,
        )}`,
      );

      // Prevent agents from updating approvalStatus or status
      if (!isAdmin) {
        delete filteredUpdateAgent.approvalStatus;
        delete filteredUpdateAgent.status;
      }

      return await dbRepo(Agent).update(agentId, filteredUpdateAgent);
    } catch (error) {
      logger.error(
        `AgentService.updateAgentProfile: Failed to update agent ID ${agentId}. Error: ${error.message}`,
      );
      if (error instanceof UserNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException("Failed to update agent profile.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Soft Delete Agent
   * @param agentId - ID of the Agent
   * @returns DeleteResult
   */
  async deleteAgent(agentId: number): Promise<DeleteResult> {
    try {
      logger.info(`AgentService.deleteAgent: Deleting agent with ID ${agentId}`);
      return await dbRepo(Agent).softDelete(agentId);
    } catch (error) {
      logger.error(
        `AgentService.deleteAgent: Failed to delete agent ID ${agentId}. Error: ${error.message}`,
      );
      throw new HttpException("Failed to delete agent.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Submit a Document for Agent
   * @param agentId - ID of the Agent
   * @param document - Document data
   * @returns Saved TAgentDocument
   */
  async submitDocument(
    agentId: number,
    document: TAgentDocument,
  ): Promise<TAgentDocument> {
    try {
      const agent = await this.getAgentById(agentId);
      const { agentType } = agent;

      // Fetch required documents for the agent's type
      const requiredDoc = await dbReadRepo(RequiredDocument).findOne({
        where: { agentType },
      });

      if (!requiredDoc) {
        throw new UserInvalidDocumentError(
          `No required documents defined for agent type ${agentType}.`,
        );
      }

      if (!requiredDoc.documents.includes(document.name)) {
        throw new UserInvalidDocumentError(
          `${document.name} is not a valid document for agent type ${agentType}.`,
        );
      }

      // Check if document already exists
      const existingDoc = await dbReadRepo(AgentDocument).findOne({
        where: { agentId, name: document.name },
      });

      if (existingDoc) {
        throw new UserDocumentAlreadyExistsError(
          `Document ${document.name} already exists for agent.`,
        );
      }

      // Create and save the document
      const newDocument = dbRepo(AgentDocument).create({
        name: document.name,
        description: document.description,
        url: document.url,
        agent: { id: agentId },
      });

      const savedDocument = await dbRepo(AgentDocument).save(newDocument);

      // After submitting, check if all required documents are submitted
      await this.checkAndUpdateApprovalStatus(agentId);

      // Return the saved document as TAgentDocument
      return {
        name: savedDocument.name,
        description: savedDocument.description,
        url: savedDocument.url,
        agentId: savedDocument.agentId,
      };
    } catch (error) {
      logger.error(
        `AgentService.submitDocument: Failed to submit document for agent ID ${agentId}. Error: ${error.message}`,
      );
      if (error instanceof UserInvalidDocumentError || error instanceof UserDocumentAlreadyExistsError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("Failed to submit document.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Remove a Document from Agent
   * @param agentId - ID of the Agent
   * @param documentId - ID of the Document to remove
   */
  async removeDocument(agentId: number, documentId: number): Promise<void> {
    try {
      const agent = await this.getAgentById(agentId);

      const document = await dbReadRepo(AgentDocument).findOne({
        where: { id: documentId, agentId },
      });

      if (!document) {
        throw new UserNotFoundError(
          `Document with ID ${documentId} not found for agent ID ${agentId}.`,
        );
      }

      await dbRepo(AgentDocument).delete(documentId);

      // After removing, check and update approval status
      await this.checkAndUpdateApprovalStatus(agentId);
    } catch (error) {
      logger.error(
        `AgentService.removeDocument: Failed to remove document ID ${documentId} for agent ID ${agentId}. Error: ${error.message}`,
      );
      if (error instanceof UserNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException("Failed to remove document.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieve Agent's Documents
   * @param agentId - ID of the Agent
   * @returns Array of TAgentDocument
   */
  async getAgentDocuments(agentId: number): Promise<TAgentDocument[]> {
    try {
      logger.debug(`AgentService.getAgentDocuments: Fetching documents for agent ID ${agentId}`);
      const documents = await dbReadRepo(AgentDocument).find({
        where: { agentId },
      });

      // Map AgentDocument entities to TAgentDocument types
      return documents.map(doc => ({
        name: doc.name,
        description: doc.description,
        url: doc.url,
        agentId: doc.agentId,
      }));
    } catch (error) {
      logger.error(
        `AgentService.getAgentDocuments: Failed to fetch documents for agent ID ${agentId}. Error: ${error.message}`,
      );
      throw new HttpException("Failed to fetch agent documents.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Approve an Agent
   * @param agentId - ID of the Agent
   * @returns Updated Agent
   */
  async approveAgent(agentId: number): Promise<Agent> {
    try {
      const canApprove = await this.canApproveAgent(agentId);
      if (!canApprove) {
        throw new UserInvalidDocumentError(
          "Agent cannot be approved. Missing required documents.",
        );
      }

      await dbRepo(Agent).update(agentId, { approvalStatus: ApprovalStatusEnum.APPROVED });

      logger.info(`AgentService.approveAgent: Agent ID ${agentId} approved.`);

      return await this.getAgentById(agentId);
    } catch (error) {
      logger.error(
        `AgentService.approveAgent: Failed to approve agent ID ${agentId}. Error: ${error.message}`,
      );
      if (error instanceof UserInvalidDocumentError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("Failed to approve agent.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Reject an Agent
   * @param agentId - ID of the Agent
   * @returns Updated Agent
   */
  async rejectAgent(agentId: number): Promise<Agent> {
    try {
      await dbRepo(Agent).update(agentId, { approvalStatus: ApprovalStatusEnum.REJECTED });

      logger.info(`AgentService.rejectAgent: Agent ID ${agentId} rejected.`);

      return await this.getAgentById(agentId);
    } catch (error) {
      logger.error(
        `AgentService.rejectAgent: Failed to reject agent ID ${agentId}. Error: ${error.message}`,
      );
      throw new HttpException("Failed to reject agent.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Set Agent's Online/Offline Status
   * @param agentId - ID of the Agent
   * @param status - New status (ONLINE/OFFLINE)
   * @returns UpdateResult
   */
  async setAgentStatus(agentId: number, status: AgentStatusEnum): Promise<UpdateResult> {
    try {
      const agent = await this.getAgentById(agentId);

      if (agent.approvalStatus !== ApprovalStatusEnum.APPROVED) {
        throw new UserInvalidDocumentError(
          "Cannot set status. Agent is not approved.",
        );
      }

      logger.info(
        `AgentService.setAgentStatus: Setting status for agent ID ${agentId} to ${status}`,
      );

      return await dbRepo(Agent).update(agentId, { status });
    } catch (error) {
      logger.error(
        `AgentService.setAgentStatus: Failed to set status for agent ID ${agentId}. Error: ${error.message}`,
      );
      if (error instanceof UserInvalidDocumentError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("Failed to set agent status.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Check if an agent has submitted all required documents and update approval status accordingly
   * @param agentId - ID of the Agent
   */
  private async checkAndUpdateApprovalStatus(agentId: number): Promise<void> {
    try {
      const canApprove = await this.canApproveAgent(agentId);
      if (canApprove) {
        await dbRepo(Agent).update(agentId, { approvalStatus: ApprovalStatusEnum.APPROVED });
        logger.info(`AgentService.checkAndUpdateApprovalStatus: Agent ID ${agentId} approved.`);
      } else {
        await dbRepo(Agent).update(agentId, { approvalStatus: ApprovalStatusEnum.PENDING });
        logger.info(`AgentService.checkAndUpdateApprovalStatus: Agent ID ${agentId} pending approval.`);
      }
    } catch (error) {
      logger.error(
        `AgentService.checkAndUpdateApprovalStatus: Failed to update approval status for agent ID ${agentId}. Error: ${error.message}`,
      );
      throw new HttpException("Failed to update approval status.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Determine if an agent can be approved based on submitted documents
   * @param agentId - ID of the Agent
   * @returns Boolean indicating approval eligibility
   */
  async canApproveAgent(agentId: number): Promise<boolean> {
    try {
      const agent = await this.getAgentById(agentId);
      const { agentType } = agent;

      const requiredDoc = await dbReadRepo(RequiredDocument).findOne({
        where: { agentType },
      });

      if (!requiredDoc) {
        logger.warn(
          `AgentService.canApproveAgent: No required documents defined for agent type ${agentType}.`,
        );
        return false;
      }

      const submittedDocs = await dbReadRepo(AgentDocument).find({
        where: { agentId },
      });

      const allDocumentsSubmitted = requiredDoc.documents.every((docName) =>
        submittedDocs.some(
          (submittedDoc) => submittedDoc.name === docName && submittedDoc.url,
        ),
      );

      return allDocumentsSubmitted;
    } catch (error) {
      logger.error(
        `AgentService.canApproveAgent: Failed to determine approval eligibility for agent ID ${agentId}. Error: ${error.message}`,
      );
      throw new HttpException("Failed to determine approval eligibility.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
