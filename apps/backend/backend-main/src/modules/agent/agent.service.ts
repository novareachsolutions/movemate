// src/modules/agent/agent.service.ts

import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DeleteResult, QueryRunner, UpdateResult } from "typeorm";
import { Agent } from "../../entity/Agent";
import { AgentDocument } from "../../entity/AgentDocument";
import { RequiredDocument } from "../../entity/RequiredDocument";
import { User } from "../../entity/User";
import { logger } from "../../logger";
import { AgentStatusEnum, ApprovalStatusEnum, } from "../../shared/enums";
import {
  UserAlreadyExistsError,
  UserDocumentAlreadyExistsError,
  UserInvalidDocumentError,
  UserNotFoundError,
} from "../../shared/errors/user";
import { filterEmptyValues } from "../../utils/filter";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { TAgent, TAgentDocument, TAgentPartial } from "./agent.types";
import { RedisService } from "../redis/redis.service";
import { AgentNotificationGateway } from "../../shared/gateways/agent.notification.gateway";
import { radii } from "./agents.constants";

@Injectable()
export class AgentService {
  constructor(
    private readonly redisService: RedisService,
    private readonly notificationGateway: AgentNotificationGateway,
  ) { }

  async createAgent(agent: TAgent): Promise<Agent> {
    const { abnNumber, user } = agent;
    const queryRunner: QueryRunner =
      dbRepo(Agent).manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const existingAgent = await queryRunner.manager.findOne(Agent, {
        where: { abnNumber },
      });
      if (existingAgent) {
        throw new UserAlreadyExistsError(
          `Agent with ABN number ${abnNumber} already exists.`,
        );
      }

      const existingUserByPhone = await queryRunner.manager.findOne(User, {
        where: { phoneNumber: user.phoneNumber },
      });
      const existingUserByEmail = await queryRunner.manager.findOne(User, {
        where: { email: user.email },
      });

      if (existingUserByPhone || existingUserByEmail) {
        throw new UserAlreadyExistsError(
          `User with phone number or email already exists.`,
        );
      }

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
      await queryRunner.commitTransaction();

      return savedAgent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(
        `AgentService.createAgent: Error occurred - ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to create agent: ${error.message}`,
      );
    } finally {
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

  async updateAgentProfile(
    agentId: number,
    updateAgent: TAgentPartial,
    isAdmin: boolean = false,
  ): Promise<UpdateResult> {
    const agent = await dbReadRepo(Agent).findOne({ where: { id: agentId } });

    if (!agent) {
      throw new UserNotFoundError(`Agent with ID ${agentId} not found.`);
    }

    const filteredUpdateAgent = filterEmptyValues(updateAgent);
    if (!isAdmin) {
      delete filteredUpdateAgent.approvalStatus;
    }

    return await dbRepo(Agent).update(agentId, filteredUpdateAgent);
  }

  async deleteAgent(agentId: number): Promise<DeleteResult> {
    return await dbRepo(Agent).softDelete(agentId);
  }

  async submitDocument(
    agentId: number,
    document: TAgentDocument,
  ): Promise<TAgentDocument> {
    const agent = await this.getAgentById(agentId);
    const requiredDocs = await dbReadRepo(RequiredDocument).find({
      where: { agentType: agent.agentType },
    });
    const requiredDocNames = requiredDocs.map((doc) => doc.name);

    if (!requiredDocNames.includes(document.name)) {
      throw new UserInvalidDocumentError(
        `${document.name} is not a valid document.`,
      );
    }

    const existingDoc = await dbReadRepo(AgentDocument).findOne({
      where: { agentId, name: document.name },
    });

    if (existingDoc) {
      throw new UserDocumentAlreadyExistsError(
        `Document ${document.name} already exists.`,
      );
    }

    const newDocument = dbRepo(AgentDocument).create({
      name: document.name,
      description: document.description,
      url: document.url,
      agentId: agentId,
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
      throw new UserNotFoundError(`Document with ID ${documentId} not found.`);
    }

    await dbRepo(AgentDocument).delete(documentId);
  }

  async getAgentDocuments(agentId: number): Promise<TAgentDocument[]> {
    const documents = await dbReadRepo(AgentDocument).find({
      where: { agentId },
    });

    return documents.map((doc) => ({
      name: doc.name,
      description: doc.description,
      url: doc.url,
      agentId: doc.agentId,
    }));
  }

  async setAgentStatus(
    agentId: number,
    status: AgentStatusEnum,
  ): Promise<UpdateResult> {
    const agent = await this.getAgentById(agentId);

    if (agent.approvalStatus !== ApprovalStatusEnum.APPROVED) {
      throw new UserInvalidDocumentError(
        "Cannot set status. Agent is not approved.",
      );
    }

    await this.redisService.set(`agent:${agentId}:status`, status, 'EX', 3600);

    return await dbRepo(Agent).update(agentId, { status });
  }

  async updateAgentLocation(agentId: number, latitude: number, longitude: number): Promise<void> {
    const agent = await this.getAgentById(agentId);
    if (agent.status !== AgentStatusEnum.ONLINE) {
      throw new InternalServerErrorException(
        "Cannot update location. Agent is not ONLINE.",
      );
    }

    const member = `agent:${agentId}`;
    await this.redisService.getClient().geoadd('agents:locations', longitude, latitude, member);
    await this.redisService.set(`agent:${agentId}:status`, AgentStatusEnum.ONLINE, 'EX', 3600);
  }

  async getNearbyAgents(latitude: number, longitude: number, radiusKm: number): Promise<{ agentId: number; distance: number }[]> {
    const radiusMeters = radiusKm * 1000;
    const results = await this.redisService.getClient().georadius(
      'agents:locations',
      longitude,
      latitude,
      radiusMeters,
      'm',
      'WITHDIST',
      'ASC',
    ) as [string, string][];
    return results.map(result => ({
      agentId: parseInt(result[0].split(':')[1], 10),
      distance: parseFloat(result[1]),
    }));
  }

  async assignRider(pickupLatitude: number, pickupLongitude: number, orderId: string): Promise<number | null> {
    const notifiedAgents = new Set<number>();

    for (const { km, limit } of radii) {
      const nearbyAgents = await this.getNearbyAgents(pickupLatitude, pickupLongitude, km);
      const availableAgents = await Promise.all(
        nearbyAgents.map(async agent => {
          if (notifiedAgents.has(agent.agentId)) return null;
          const status = await this.redisService.get(`agent:${agent.agentId}:status`);
          return status === AgentStatusEnum.ONLINE ? agent : null;
        })
      ).then(results => results.filter(agent => agent !== null));

      const selectedAgents = availableAgents.slice(0, limit);
      if (selectedAgents.length === 0) continue;

      selectedAgents.forEach(agent => notifiedAgents.add(agent.agentId));

      selectedAgents.forEach(agent => {
        this.notificationGateway.sendMessageToAgent(agent.agentId, 'newRequest', {
          orderId,
          pickupLocation: { latitude: pickupLatitude, longitude: pickupLongitude },
        });
      });

      const assignedAgentId = await this.waitForAcceptance(orderId, 40000);
      if (assignedAgentId) {
        return assignedAgentId;
      }
    }

    return null;
  }

  private async waitForAcceptance(orderId: string, timeoutMs: number): Promise<number | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.redisService.getClient().off(`acceptance:${orderId}`, listener);
        resolve(null);
      }, timeoutMs);

      const listener = (channel: string, message: string) => {
        const data = JSON.parse(message);
        if (data.orderId === orderId) {
          clearTimeout(timeout);
          this.redisService.getClient().unsubscribe(`acceptance:${orderId}`);
          resolve(data.agentId);
        }
      };

      this.redisService.getClient().subscribe(`acceptance:${orderId}`, (err, count) => {
        if (err) {
          logger.error(`Failed to subscribe to acceptance channel: ${err.message}`);
          clearTimeout(timeout);
          resolve(null);
        }
      });

      this.redisService.getClient().on('message', listener);
    });
  }

  async acceptOrder(orderId: string, agentId: number): Promise<void> {
    await this.setAgentStatus(agentId, AgentStatusEnum.BUSY);

    const acceptanceData = { orderId, agentId };
    await this.redisService.getClient().publish(`acceptance:${orderId}`, JSON.stringify(acceptanceData));

    // this is to notify the other agents that the order is taken, not necessary for now
    // this.notificationGateway.sendMessageToRoom("agents", "ORDER_TAKEN", { orderId, agentId });
  }
}
