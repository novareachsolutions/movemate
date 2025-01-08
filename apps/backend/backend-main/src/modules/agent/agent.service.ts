import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DeleteResult, QueryRunner, UpdateResult } from "typeorm";

import { Agent } from "../../entity/Agent";
import { AgentDocument } from "../../entity/AgentDocument";
import { RequiredDocument } from "../../entity/RequiredDocument";
import { SendPackageOrder } from "../../entity/SendPackageOrder";
import { User } from "../../entity/User";
import { logger } from "../../logger";
import {
  AgentStatusEnum,
  AgentTypeEnum,
  ApprovalStatusEnum,
} from "../../shared/enums";
import { SendPackageAgentAcceptError } from "../../shared/errors/sendAPackage";
import {
  UserAccessDeniedError,
  UserAlreadyExistsError,
  UserDocumentAlreadyExistsError,
  UserExpiryDateRequiredError,
  UserInvalidDocumentError,
  UserNotFoundError,
} from "../../shared/errors/user";
import { AgentNotificationGateway } from "../../shared/gateways/agent.notification.gateway";
import { filterEmptyValues } from "../../utils/filter";
import { TokenService } from "../auth/utils/generateTokens";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { MediaService } from "../media/media.service";
import { RedisService } from "../redis/redis.service";
import { TAgent, TAgentDocument, TAgentPartial } from "./agent.types";
import { radii } from "./agents.constants";

@Injectable()
export class AgentService {
  constructor(
    private readonly redisService: RedisService,
    private readonly agentNotificationGateway: AgentNotificationGateway,
    private readonly tokenService: TokenService,
    private readonly mediaService: MediaService,
  ) {}

  async createAgent(
    agent: TAgent,
  ): Promise<{ agent: Agent; accessToken: string; refreshToken: string }> {
    const { abnNumber, user } = agent;
    const queryRunner: QueryRunner =
      dbRepo(Agent).manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      logger.debug(
        `AgentService.createAgent: Checking if agent with ABN ${abnNumber} exists.`,
      );
      const existingAgent = await queryRunner.manager.findOne(Agent, {
        where: { abnNumber },
      });
      if (existingAgent) {
        logger.error(
          `AgentService.createAgent: Agent with ABN ${abnNumber} already exists.`,
        );
        throw new UserAlreadyExistsError(
          `Agent with ABN number ${abnNumber} already exists.`,
        );
      }

      logger.debug(
        `AgentService.createAgent: Checking if user with phone ${user.phoneNumber} or email ${user.email} exists.`,
      );
      const existingUserByPhone = await queryRunner.manager.findOne(User, {
        where: { phoneNumber: user.phoneNumber },
      });
      const existingUserByEmail = await queryRunner.manager.findOne(User, {
        where: { email: user.email },
      });

      if (existingUserByPhone || existingUserByEmail) {
        logger.error(
          `AgentService.createAgent: User with phone ${user.phoneNumber} or email ${user.email} already exists.`,
        );
        throw new UserAlreadyExistsError(
          `User with phone number or email already exists.`,
        );
      }

      logger.debug(
        `AgentService.createAgent: Creating user and agent records.`,
      );
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

      // Generate tokens
      const accessToken = this.tokenService.generateAccessToken(
        savedUser.id,
        savedUser.phoneNumber,
        savedUser.role,
      );
      const refreshToken = this.tokenService.generateRefreshToken(savedUser.id);

      logger.debug(
        `AgentService.createAgent: Agent with ID ${savedAgent.id} created successfully.`,
      );
      await queryRunner.commitTransaction();

      return { agent: savedAgent, accessToken, refreshToken };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`AgentService.createAgent: Error occurred - ${error}`);
      throw new InternalServerErrorException(
        `Failed to create agent: ${error}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAgentById(agentId: number): Promise<Agent> {
    logger.debug(
      `AgentService.getAgentById: Fetching agent with ID ${agentId}.`,
    );
    const agent = await dbReadRepo(Agent).findOne({
      where: { id: agentId },
      relations: ["user"],
    });

    if (!agent) {
      logger.error(
        `AgentService.getAgentById: Agent with ID ${agentId} not found.`,
      );
      throw new UserNotFoundError(`Agent not found for ID ${agentId}`);
    }

    return agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    logger.debug(`AgentService.getAllAgents: Fetching all agents.`);
    return await dbReadRepo(Agent).find({ relations: ["user"] });
  }

  async updateAgentProfile(
    agentId: number,
    updateAgent: TAgentPartial,
    isAdmin: boolean = false,
  ): Promise<UpdateResult> {
    logger.debug(
      `AgentService.updateAgentProfile: Updating agent ID ${agentId}.`,
    );
    const agent = await dbReadRepo(Agent).findOne({ where: { id: agentId } });

    if (!agent) {
      logger.error(
        `AgentService.updateAgentProfile: Agent with ID ${agentId} not found.`,
      );
      throw new UserNotFoundError(`Agent with ID ${agentId} not found.`);
    }

    if (!isAdmin && agent.approvalStatus !== ApprovalStatusEnum.APPROVED) {
      logger.error(
        `AgentService.setAgentStatus: Cannot update. Agent ID ${agentId} not approved.`,
      );
      throw new UserAccessDeniedError("Cannot update. Agent is not approved.");
    }

    const filteredUpdateAgent = filterEmptyValues(updateAgent);
    if (!isAdmin) {
      delete filteredUpdateAgent.approvalStatus;
    }

    logger.debug(
      `AgentService.updateAgentProfile: Update data - ${JSON.stringify(filteredUpdateAgent)}.`,
    );
    return await dbRepo(Agent).update(agentId, filteredUpdateAgent);
  }

  async deleteAgent(agentId: number): Promise<DeleteResult> {
    logger.debug(
      `AgentService.deleteAgent: Deleting agent with ID ${agentId}.`,
    );
    return await dbRepo(Agent).softDelete(agentId);
  }

  async submitDocument(
    agentId: number,
    document: TAgentDocument,
  ): Promise<TAgentDocument> {
    logger.debug(
      `AgentService.submitDocument: Submitting document for agent ID ${agentId}.`,
    );
    const agent = await this.getAgentById(agentId);
    const requiredDocs = await dbReadRepo(RequiredDocument).find({
      where: { agentType: agent.agentType },
    });
    const requiredDoc = requiredDocs.find((doc) => doc.name === document.name);

    if (!requiredDoc) {
      logger.error(
        `AgentService.submitDocument: Invalid document ${document.name}.`,
      );
      throw new UserInvalidDocumentError(
        `${document.name} is not a valid document.`,
      );
    }

    if (requiredDoc.isExpiry && !document.expiry) {
      logger.error(
        `AgentService.submitDocument: Expiry date is required for document ${document.name}.`,
      );
      throw new UserExpiryDateRequiredError("Expiry date is required");
    }

    const existingDoc = await dbReadRepo(AgentDocument).findOne({
      where: { agentId, name: document.name },
    });

    if (existingDoc) {
      logger.error(
        `AgentService.submitDocument: Document ${document.name} already exists.`,
      );
      throw new UserDocumentAlreadyExistsError(
        `Document ${document.name} already exists.`,
      );
    }

    try {
      const newDocument = dbRepo(AgentDocument).create({
        name: document.name,
        description: document.description,
        url: document.url,
        agentId: agentId,
        expiry: document.expiry || null,
      });

      const savedDocument = await dbRepo(AgentDocument).save(newDocument);
      logger.debug(
        `AgentService.submitDocument: Document ${document.name} saved for agent ID ${agentId}.`,
      );

      return {
        name: savedDocument.name,
        description: savedDocument.description,
        url: savedDocument.url,
      };
    } catch (error) {
      // Delete the uploaded file on error
      const key = this.extractKeyFromUrl(document.url);
      if (key) {
        await this.mediaService.deleteFile(key);
      }
      throw new InternalServerErrorException("An error Occured", error);
    }
  }

  async removeDocument(agentId: number, documentId: number): Promise<void> {
    logger.debug(
      `AgentService.removeDocument: Removing document ID ${documentId} for agent ID ${agentId}.`,
    );
    const document = await dbReadRepo(AgentDocument).findOne({
      where: { id: documentId, agentId },
    });

    if (!document) {
      logger.error(
        `AgentService.removeDocument: Document ID ${documentId} not found.`,
      );
      throw new UserNotFoundError(`Document with ID ${documentId} not found.`);
    }

    await dbRepo(AgentDocument).delete(documentId);
    logger.debug(
      `AgentService.removeDocument: Document ID ${documentId} removed for agent ID ${agentId}.`,
    );
  }

  async getAgentDocuments(agentId: number): Promise<TAgentDocument[]> {
    logger.debug(
      `AgentService.getAgentDocuments: Fetching documents for agent ID ${agentId}.`,
    );
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
    logger.debug(
      `AgentService.setAgentStatus: Setting status for agent ID ${agentId} to ${status}.`,
    );
    const agent = await this.getAgentById(agentId);

    if (agent.approvalStatus !== ApprovalStatusEnum.APPROVED) {
      logger.error(
        `AgentService.setAgentStatus: Cannot set status. Agent ID ${agentId} not approved.`,
      );
      throw new UserAccessDeniedError(
        "Cannot set status. Agent is not approved.",
      );
    }

    logger.debug(
      `AgentService.setAgentStatus: Updating status in database for agent ID ${agentId}.`,
    );
    return await dbRepo(Agent).update(agentId, { status });
  }

  async updateAgentLocation(
    agentId: number,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    logger.debug(`Updating location for agent ID ${agentId}`);
    const agent = await this.getAgentById(agentId);

    if (agent.approvalStatus !== ApprovalStatusEnum.APPROVED) {
      logger.error(
        `AgentService.setAgentStatus: Cannot update location. Agent ID ${agentId} not approved.`,
      );
      throw new UserAccessDeniedError(
        "Cannot update location. Agent is not approved.",
      );
    }

    const member = `agent:${agentId}`;
    await this.redisService
      .getGeneralClient()
      .geoadd("agents:locations", longitude, latitude, member);
    await this.redisService.set(
      `agent:${agentId}:status`,
      AgentStatusEnum.ONLINE,
      "EX",
      3600,
    );
  }

  async getNearbyAgents(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<{ agentId: number; distance: number }[]> {
    logger.debug(
      `AgentService.getNearbyAgents: Fetching agents within ${radiusKm} km of (${latitude}, ${longitude}).`,
    );
    const radiusMeters = radiusKm * 1000;
    const results = (await this.redisService
      .getGeneralClient()
      .georadius(
        "agents:locations",
        longitude,
        latitude,
        radiusMeters,
        "m",
        "WITHDIST",
        "ASC",
      )) as [string, string][];
    logger.debug(
      `AgentService.getNearbyAgents: Found ${results.length} agents within ${radiusKm} km.`,
    );
    return results.map((result) => ({
      agentId: parseInt(result[0].split(":")[1], 10),
      distance: parseFloat(result[1]),
    }));
  }

  async assignRider(
    pickupLatitude: number,
    pickupLongitude: number,
    orderId: string,
  ): Promise<number | null> {
    logger.debug(
      `AgentService.assignRider: Assigning rider for order ID ${orderId} at location (${pickupLatitude}, ${pickupLongitude}).`,
    );

    const orderIdNum = parseInt(orderId, 10);
    if (isNaN(orderIdNum)) {
      logger.error(`AgentService.assignRider: Invalid orderId ${orderId}.`);
      throw new InternalServerErrorException("Invalid order ID provided.");
    }

    const order = await dbReadRepo(SendPackageOrder).findOne({
      where: { id: orderIdNum },
      relations: ["pickupLocation", "dropLocation"],
    });

    if (!order) {
      logger.error(`AgentService.assignRider: Order ID ${orderId} not found.`);
      throw new UserNotFoundError(`Order with ID ${orderId} not found.`);
    }

    if (order.agentId) {
      throw new SendPackageAgentAcceptError(
        `This Order cannot be assigned as it is already accepted`,
      );
    }

    const pickupAddress = order.pickupLocation?.addressLine1 || "N/A";
    const dropAddress = order.dropLocation?.addressLine1 || "N/A";
    const estimatedDistance = order.estimatedDistance || 0;
    const estimatedTime = order.estimatedTime || "00:00:00";

    const notifiedAgents = new Set<number>();

    for (const { km, limit } of radii) {
      const currentOrder = await dbReadRepo(SendPackageOrder).findOne({
        where: { id: orderIdNum },
      });

      if (currentOrder.agentId) {
        logger.debug(
          `AgentService.assignRider: Order ID ${orderId} has been accepted by Agent ID ${currentOrder.agentId}. Stopping assignment process.`,
        );
        return;
      }

      logger.debug(
        `AgentService.assignRider: Searching within ${km} km with a limit of ${limit} agents.`,
      );
      const nearbyAgents = await this.getNearbyAgents(
        pickupLatitude,
        pickupLongitude,
        km,
      );

      logger.debug(
        `AgentService.assignRider: Nearby agents: ${JSON.stringify(nearbyAgents)}`,
      );

      const availableAgents = await Promise.all(
        nearbyAgents.map(async (agent) => {
          if (notifiedAgents.has(agent.agentId)) {
            logger.debug(
              `AgentService.assignRider: Agent ID ${agent.agentId} already notified.`,
            );
            return null;
          }
          const status = await this.redisService.get(
            `agent:${agent.agentId}:status`,
          );
          if (status === AgentStatusEnum.ONLINE) {
            logger.debug(
              `AgentService.assignRider: Agent ID ${agent.agentId} is ONLINE.`,
            );
            return agent;
          } else {
            logger.debug(
              `AgentService.assignRider: Agent ID ${agent.agentId} is not ONLINE.`,
            );
            return null;
          }
        }),
      ).then((results) => results.filter((agent) => agent !== null));

      logger.debug(
        `AgentService.assignRider: Available agents within ${km} km: ${JSON.stringify(
          availableAgents,
        )}`,
      );

      const selectedAgents = availableAgents.slice(0, limit);
      logger.debug(
        `AgentService.assignRider: Selecting ${selectedAgents.length} agents to notify.`,
      );

      if (selectedAgents.length > 0) {
        selectedAgents.forEach((agent) => notifiedAgents.add(agent.agentId));

        selectedAgents.forEach((agent) => {
          logger.debug(
            `AgentService.assignRider: Notifying agent ID ${agent.agentId} about order ID ${orderId}.`,
          );
          this.agentNotificationGateway.sendMessageToAgent(
            agent.agentId,
            "newRequest",
            {
              orderId,
              pickupAddress,
              dropAddress,
              estimatedDistance,
              estimatedTime,
            },
          );
        });
      } else {
        logger.debug(
          `AgentService.assignRider: No agents available to notify within ${km} km.`,
        );
      }

      logger.debug(
        `AgentService.assignRider: Initiating wait for acceptance for order ID ${orderId} after processing ${km} km radius.`,
      );
      const assignedAgentId = await this.waitForAcceptance(orderId, 40000); // Wait for 40 seconds
      logger.debug(
        `AgentService.assignRider: waitForAcceptance completed for order ID ${orderId}.`,
      );

      if (assignedAgentId) {
        logger.debug(
          `AgentService.assignRider: Order ID ${orderId} accepted by agent ID ${assignedAgentId}.`,
        );
        return assignedAgentId;
      } else {
        logger.debug(
          `AgentService.assignRider: No agent accepted order ID ${orderId} within the timeout of ${km} km.`,
        );
      }
    }

    logger.debug(
      `AgentService.assignRider: No agents accepted order ID ${orderId} after all radii.`,
    );
    return null;
  }

  async acceptOrder(orderId: string, agentId: number): Promise<void> {
    logger.debug(
      `AgentService.acceptOrder: Agent ID ${agentId} is accepting order ID ${orderId}.`,
    );
    await this.setAgentStatus(agentId, AgentStatusEnum.BUSY);

    const acceptanceData = { orderId, agentId };
    logger.debug(
      `AgentService.acceptOrder: Publishing acceptance data to Redis for order ID ${orderId}.`,
    );
    await this.redisService
      .getGeneralClient()
      .publish(`acceptance:${orderId}`, JSON.stringify(acceptanceData));

    // Optionally notify other agents that the order has been taken
    // logger.debug(
    //   `AgentService.acceptOrder: Notifying other agents that order ID ${orderId} is taken by agent ID ${agentId}.`,
    // );
    // this.agentNotificationGateway.sendMessageToRoom(
    //   "agents",
    //   "ORDER_TAKEN",
    //   { orderId, agentId },
    // );
  }

  async createRequiredDocument(createRequiredDocumentDto: {
    name: string;
    description?: string;
    agentType: AgentTypeEnum;
    isRequired: boolean;
    isExpiry: boolean;
  }): Promise<RequiredDocument> {
    const { name, description, agentType, isRequired, isExpiry } =
      createRequiredDocumentDto;

    logger.debug(
      `AgentService.createRequiredDocument: Checking if document with name ${name} already exists for agent type ${agentType}.`,
    );

    const existingDocument = await dbReadRepo(RequiredDocument).findOne({
      where: { name, agentType },
    });

    if (existingDocument) {
      logger.error(
        `AgentService.createRequiredDocument: Document with name ${name} already exists for agent type ${agentType}.`,
      );
      throw new UserAlreadyExistsError(
        `Document with name ${name} already exists for agent type ${agentType}.`,
      );
    }

    logger.debug(
      `AgentService.createRequiredDocument: Creating new required document.`,
    );

    const newDocument = dbRepo(RequiredDocument).create({
      name,
      description,
      agentType,
      isRequired,
      isExpiry,
    });

    const savedDocument = await dbRepo(RequiredDocument).save(newDocument);

    logger.debug(
      `AgentService.createRequiredDocument: Required document with ID ${savedDocument.id} created successfully.`,
    );
    return savedDocument;
  }

  async updateDocumentApprovalStatus(
    agentId: number,
    documentId: number,
    approvalStatus: ApprovalStatusEnum,
  ): Promise<void> {
    if (!["APPROVED", "REJECTED"].includes(approvalStatus)) {
      throw new UserInvalidDocumentError("Invalid approval status provided.");
    }

    // Fetch the document
    const document = await dbReadRepo(AgentDocument).findOne({
      where: { id: documentId, agentId },
    });

    if (!document) {
      throw new UserNotFoundError(
        `Document with ID ${documentId} not found for agent ID ${agentId}.`,
      );
    }

    // Update the document's approval status
    document.approvalStatus = approvalStatus;

    // Save the updated document to the database
    await dbRepo(AgentDocument).save(document);
  }

  private extractKeyFromUrl(fileUrl: string): string {
    const urlParts = fileUrl.split("/");
    return urlParts[urlParts.length - 1]; // Extract the S3 object key
  }

  private waitForAcceptance(
    orderId: string,
    timeoutMs: number,
  ): Promise<number | null> {
    return new Promise((resolve) => {
      const subscriber = this.redisService.getSubscriberClient();
      const channel = `acceptance:${orderId}`;

      const onMessage = (msgChannel: string, message: string): void => {
        if (msgChannel !== channel) {
          return;
        }

        try {
          const data = JSON.parse(message);
          if (data.orderId === orderId && typeof data.agentId === "number") {
            logger.debug(
              `waitForAcceptance: Received acceptance from agent ID ${data.agentId} for order ID ${orderId}.`,
            );
            clearTimeout(timeoutHandle); // Clear the timeout since acceptance is received
            subscriber.removeListener("message", onMessage);
            void subscriber.unsubscribe(channel).catch((err) => {
              logger.error(
                `waitForAcceptance: Failed to unsubscribe from ${channel}: ${err}`,
              );
            });
            resolve(data.agentId);
          }
        } catch (err) {
          logger.error(
            `waitForAcceptance: Error parsing message on ${channel}: ${err}`,
          );
        }
      };

      subscriber.on("message", onMessage);

      // Handle the Promise returned by subscribe
      subscriber
        .subscribe(channel)
        .then(() => {
          logger.debug(`waitForAcceptance: Subscribed to ${channel}.`);
        })
        .catch((err) => {
          logger.error(
            `waitForAcceptance: Failed to subscribe to ${channel}: ${err}`,
          );
          subscriber.removeListener("message", onMessage);
          resolve(null);
        });

      logger.debug(
        `waitForAcceptance: Waiting for acceptance for order ID ${orderId} with timeout of ${timeoutMs} ms.`,
      );

      const timeoutHandle = setTimeout(() => {
        logger.debug(
          `waitForAcceptance: Timeout reached for order ID ${orderId}.`,
        );
        subscriber.removeListener("message", onMessage);
        void subscriber.unsubscribe(channel).catch((err) => {
          logger.error(
            `waitForAcceptance: Failed to unsubscribe from ${channel} after timeout: ${err}`,
          );
        });
        resolve(null);
      }, timeoutMs);
    });
  }
}
