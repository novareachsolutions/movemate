import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Between, In } from "typeorm";

import { DropLocation } from "../../../entity/DropLocation";
import { OrderReview } from "../../../entity/OrderReview";
import { PickupLocation } from "../../../entity/PickupLocation";
import { Report } from "../../../entity/Report";
import { SendPackageOrder } from "../../../entity/SendPackageOrder";
import { logger } from "../../../logger";
import {
  OrderStatusEnum,
  OrderTypeEnum,
  PaymentStatusEnum,
  UserRoleEnum,
} from "../../../shared/enums";
import {
  SendPackageAgentAcceptError,
  SendPackageAgentCancelError,
  SendPackageAgentCompleteError,
  SendPackageAgentMismatchError,
  SendPackageAgentReportReasonRequiredError,
  SendPackageAgentStartError,
  SendPackageAlreadyCancelledError,
  SendPackageCancellationReasonRequiredError,
  SendPackageInvalidRatingError,
  SendPackageIssueReportError,
  SendPackageNotFoundError,
  SendPackageOrderNotCompletedError,
  SendPackageReviewCommentRequiredError,
} from "../../../shared/errors/sendAPackage";
import { UserHasRunningOrderError } from "../../../shared/errors/user";
import { CustomerNotificationGateway } from "../../../shared/gateways/customer.notification.gateway";
import { parseTimeToMinutes } from "../../../utils/timeFns";
import { dbReadRepo, dbRepo } from "../../database/database.service";
import { PricingService } from "../../pricing/pricing.service";
import { TSendPackageOrder } from "./sendPackage.types";

@Injectable()
export class SendAPackageService {
  constructor(
    private readonly pricingService: PricingService,
    private readonly customerNotificationGateway: CustomerNotificationGateway,
  ) {}
  async create(data: TSendPackageOrder): Promise<SendPackageOrder> {
    logger.debug(
      "SendAPackageService.create: Creating a new send package order",
    );
    const queryRunner =
      dbRepo(SendPackageOrder).manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Check if the user already has a running order
      const existingRunningOrder = await queryRunner.manager.findOne(
        SendPackageOrder,
        {
          where: {
            customerId: data.customerId,
            status: In([
              OrderStatusEnum.PENDING,
              OrderStatusEnum.IN_PROGRESS,
              OrderStatusEnum.ACCEPTED,
            ]),
          },
        },
      );

      if (existingRunningOrder) {
        logger.error(
          `SendAPackageService.create: User with ID ${data.customerId} already has a running order with ID ${existingRunningOrder.id}`,
        );
        throw new UserHasRunningOrderError(`You already have a running order.`);
      }

      // Check or create PickupLocation
      let pickupLocation = await queryRunner.manager.findOne(PickupLocation, {
        where: {
          latitude: data.pickupLocation.latitude,
          longitude: data.pickupLocation.longitude,
        },
      });

      if (!pickupLocation) {
        pickupLocation = queryRunner.manager.create(
          PickupLocation,
          data.pickupLocation,
        );
        pickupLocation = await queryRunner.manager.save(
          PickupLocation,
          pickupLocation,
        );
        logger.debug(
          `SendAPackageService.create: Created new PickupLocation with ID ${pickupLocation.id}`,
        );
      } else {
        logger.debug(
          `SendAPackageService.create: Reusing existing PickupLocation with ID ${pickupLocation.id}`,
        );
      }

      let dropLocation = await queryRunner.manager.findOne(DropLocation, {
        where: {
          latitude: data.dropLocation.latitude,
          longitude: data.dropLocation.longitude,
        },
      });

      if (!dropLocation) {
        dropLocation = queryRunner.manager.create(
          DropLocation,
          data.dropLocation,
        );
        dropLocation = await queryRunner.manager.save(
          DropLocation,
          dropLocation,
        );
        logger.debug(
          `SendAPackageService.create: Created new DropLocation with ID ${dropLocation.id}`,
        );
      } else {
        logger.debug(
          `SendAPackageService.create: Reusing existing DropLocation with ID ${dropLocation.id}`,
        );
      }

      const estimatedTimeInMinutes = parseTimeToMinutes(data.estimatedTime);

      const price = this.pricingService.calculateFare({
        distance: data.estimatedDistance,
        estimatedTime: estimatedTimeInMinutes,
        packageWeight: 3, // Static value for now
      });

      const sendPackageOrder = queryRunner.manager.create(SendPackageOrder, {
        senderName: data.senderName,
        senderPhoneNumber: data.senderPhoneNumber,
        receiverName: data.receiverName,
        receiverPhoneNumber: data.receiverPhoneNumber,
        packageType: data.packageType,
        deliveryInstructions: data.deliveryInstructions,
        pickupLocation: pickupLocation,
        dropLocation: dropLocation,
        estimatedDistance: data.estimatedDistance,
        estimatedTime: data.estimatedTime,
        customerId: data.customerId,
        price,
        type: OrderTypeEnum.DELIVERY,
        status: OrderStatusEnum.PENDING,
        paymentStatus: PaymentStatusEnum.NOT_PAID,
      });

      const savedOrder = await queryRunner.manager.save(
        SendPackageOrder,
        sendPackageOrder,
      );
      logger.debug(
        `SendAPackageService.create: Created SendPackageOrder with ID ${savedOrder.id}`,
      );

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(
        `SendAPackageService.create: Failed to create order - ${error}`,
        {
          stack: (error as Error).stack,
          ...error,
        },
      );

      if (error instanceof UserHasRunningOrderError) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Failed to create send package order",
      );
    } finally {
      await queryRunner.release();
    }
  }

  async cancelOrder(
    orderId: number,
    reason: string,
  ): Promise<SendPackageOrder> {
    logger.debug(
      `SendAPackageService.cancelOrder: Attempting to cancel order ID ${orderId}`,
    );

    if (!reason) {
      throw new SendPackageCancellationReasonRequiredError(
        "Cancellation reason is required",
      );
    }

    const order = await dbReadRepo(SendPackageOrder).findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
    }

    if (order.status === OrderStatusEnum.CANCELED) {
      throw new SendPackageAlreadyCancelledError(
        `Order ID ${orderId} is already canceled`,
      );
    }

    order.status = OrderStatusEnum.CANCELED;
    order.cancellationReason = reason;
    order.canceledBy = UserRoleEnum.CUSTOMER;

    const updatedOrder = await dbRepo(SendPackageOrder).save(order);
    logger.debug(
      `SendAPackageService.cancelOrder: Order ID ${orderId} canceled successfully`,
    );
    return updatedOrder;
  }

  async reportAgent(
    orderId: number,
    reason: string,
    details: string,
  ): Promise<Report> {
    logger.debug(
      `SendAPackageService.reportAgent: Reporting agent for order ID ${orderId}`,
    );

    if (!reason) {
      throw new SendPackageAgentReportReasonRequiredError(
        "Reason is required to report agent",
      );
    }

    const order = await dbReadRepo(SendPackageOrder).findOne({
      where: { id: orderId },
      relations: ["customer"],
    });

    if (!order) {
      throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
    }

    const savedReport = await dbRepo(Report).save({
      reason,
      details,
      customer: order.customer,
      sendPackageOrderId: order.id,
    });
    logger.debug(
      `SendAPackageService.reportAgent: Report created with ID ${savedReport.id} for order ID ${orderId}`,
    );
    return savedReport;
  }

  async leaveReview(
    orderId: number,
    rating: number,
    comment: string,
  ): Promise<OrderReview> {
    logger.debug(
      `SendAPackageService.leaveReview: Leaving review for order ID ${orderId}`,
    );

    if (rating < 1 || rating > 5) {
      throw new SendPackageInvalidRatingError("Rating must be between 1 and 5");
    }
    if (!comment) {
      throw new SendPackageReviewCommentRequiredError(
        "Comment is required for review",
      );
    }

    const order = await dbReadRepo(SendPackageOrder).findOne({
      where: { id: orderId },
      relations: ["agent", "customer", "review"],
    });

    if (!order) {
      throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
    }

    if (order.status !== OrderStatusEnum.COMPLETED) {
      throw new SendPackageOrderNotCompletedError(
        `Cannot review an incomplete order with ID ${orderId}`,
      );
    }

    const savedReview = await dbRepo(OrderReview).save({
      rating,
      comment,
      customer: order.customer,
      sendPackageOrderId: order.id,
    });
    logger.debug(
      `SendAPackageService.leaveReview: Review created with ID ${savedReview.id} for order ID ${orderId}`,
    );

    return savedReview;
  }

  async getOrderDetails(orderId: number): Promise<SendPackageOrder> {
    logger.debug(
      `SendAPackageService.getOrderDetails: Fetching details for order ID ${orderId}`,
    );

    const order = await dbReadRepo(SendPackageOrder).findOne({
      where: { id: orderId },
      relations: [
        "pickupLocation",
        "dropLocation",
        "customer",
        "agent",
        "report",
        "review",
      ],
    });

    if (!order) {
      throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
    }

    logger.debug(
      `SendAPackageService.getOrderDetails: Successfully fetched details for order ID ${orderId}`,
    );
    return order;
  }

  // ====== Agent Service Methods ======

  async acceptOrder(
    orderId: number,
    agentId: number,
  ): Promise<SendPackageOrder> {
    logger.debug(
      `SendPackageService.acceptOrder: Agent attempting to accept order ID ${orderId}`,
    );

    const order = await dbRepo(SendPackageOrder).findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
    }

    if (order.status !== OrderStatusEnum.PENDING) {
      throw new SendPackageAgentAcceptError(
        `This Order cannot be accepted in its current status`,
      );
    }

    if (order.agentId) {
      throw new SendPackageAgentAcceptError(
        `This Order cannot be accepted as it is already assigned`,
      );
    }

    order.agentId = agentId;
    order.status = OrderStatusEnum.ACCEPTED;
    order.acceptedAt = new Date();

    const updatedOrder = await dbRepo(SendPackageOrder).save(order);
    logger.debug(
      `SendPackageService.acceptOrder: Order ID ${orderId} accepted successfully`,
    );

    // Notify customer about acceptance
    await this.notifyCustomerOrderAccepted(updatedOrder);

    return updatedOrder;
  }

  async startOrder(
    orderId: number,
    agentId: number,
  ): Promise<SendPackageOrder> {
    logger.debug(
      `SendAPackageService.startOrder: Agent attempting to start order ID ${orderId}`,
    );

    const order = await dbRepo(SendPackageOrder).findOne({
      where: { id: orderId },
    });

    if (order.agentId !== agentId) {
      throw new SendPackageAgentMismatchError(
        `Agent ID ${agentId} is not assigned to order ID ${orderId}`,
      );
    }

    if (!order) {
      throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
    }

    if (order.status !== OrderStatusEnum.ACCEPTED) {
      throw new SendPackageAgentStartError(
        `Order ID ${orderId} cannot be started in its current status`,
      );
    }

    order.status = OrderStatusEnum.IN_PROGRESS;
    order.startedAt = new Date();

    const updatedOrder = await dbRepo(SendPackageOrder).save(order);
    logger.debug(
      `SendAPackageService.startOrder: Order ID ${orderId} started successfully`,
    );
    return updatedOrder;
  }

  async completeOrder(orderId: number): Promise<SendPackageOrder> {
    logger.debug(
      `SendAPackageService.completeOrder: Agent attempting to complete order ID ${orderId}`,
    );

    const order = await dbRepo(SendPackageOrder).findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
    }

    if (order.status !== OrderStatusEnum.IN_PROGRESS) {
      throw new SendPackageAgentCompleteError(
        `Order ID ${orderId} cannot be completed in its current status`,
      );
    }

    order.status = OrderStatusEnum.COMPLETED;
    order.completedAt = new Date();

    const updatedOrder = await dbRepo(SendPackageOrder).save(order);
    logger.debug(
      `SendAPackageService.completeOrder: Order ID ${orderId} completed successfully`,
    );
    return updatedOrder;
  }

  async agentCancelOrder(
    orderId: number,
    reason: string,
  ): Promise<SendPackageOrder> {
    logger.debug(
      `SendAPackageService.agentCancelOrder: Agent attempting to cancel order ID ${orderId}`,
    );

    if (!reason) {
      throw new SendPackageAgentCancelError("Cancellation reason is required");
    }

    const order = await dbRepo(SendPackageOrder).findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
    }

    if (
      ![
        OrderStatusEnum.PENDING,
        OrderStatusEnum.ACCEPTED,
        OrderStatusEnum.IN_PROGRESS,
      ].includes(order.status)
    ) {
      throw new SendPackageAgentCancelError(
        `Order ID ${orderId} cannot be canceled in its current status`,
      );
    }

    order.status = OrderStatusEnum.CANCELED;
    order.cancellationReason = reason;
    order.canceledBy = UserRoleEnum.AGENT;

    const updatedOrder = await dbRepo(SendPackageOrder).save(order);
    logger.debug(
      `SendAPackageService.agentCancelOrder: Order ID ${orderId} canceled successfully by agent`,
    );
    return updatedOrder;
  }

  async reportIssue(orderId: number, issue: string): Promise<Report> {
    logger.debug(
      `SendAPackageService.reportIssue: Agent reporting issue for order ID ${orderId}`,
    );

    if (!issue) {
      throw new SendPackageIssueReportError("Issue description is required");
    }

    const order = await dbReadRepo(SendPackageOrder).findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
    }

    const savedReport = await dbRepo(Report).save({
      reason: "Agent Report",
      details: issue,
      customerId: order.customerId,
      orderId: order.id,
    });
    logger.debug(
      `SendAPackageService.reportIssue: Issue reported with ID ${savedReport.id} for order ID ${orderId}`,
    );
    return savedReport;
  }

  // ====== Admin Service Methods ======

  async getAllOrders(query: any): Promise<SendPackageOrder[]> {
    logger.debug(
      "SendAPackageService.getAllOrders: Retrieving all orders with filters",
    );

    const { status, customerId, agentId, dateRange } = query;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (customerId) {
      where.customerId = customerId;
    }
    if (agentId) {
      where.agentId = agentId;
    }
    if (dateRange) {
      const { start, end } = dateRange;
      where.createdAt = Between(new Date(start), new Date(end));
    }

    const orders = await dbReadRepo(SendPackageOrder).find({
      where,
      relations: [
        "pickupLocation",
        "dropLocation",
        "customer",
        "agent",
        "report",
        "review",
      ],
    });

    logger.debug(
      `SendAPackageService.getAllOrders: Retrieved ${orders.length} orders`,
    );
    return orders;
  }

  // private methods
  private notifyCustomerOrderAccepted(order: SendPackageOrder): void {
    const notificationData = {
      orderId: order.id,
      agentId: order.agentId,
      message: `Your order has been accepted by Agent ID ${order.agentId}.`,
      timestamp: new Date(),
    };
    this.customerNotificationGateway.sendMessageToClient(
      order.customerId.toString(),
      "agentAcceptedRequest",
      notificationData,
    );
    logger.debug(
      `SendPackageService.notifyCustomerOrderAccepted: Notified customer ID ${order.customerId} about order acceptance.`,
    );
  }
}
