import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { logger } from '../../../logger';
import {
  OrderStatusEnum,
  PaymentStatusEnum,
  UserRoleEnum,
  ItemStatusEnum,
} from '../../../shared/enums';
import { Report } from '../../../entity/Report';
import { BuyFromStoreOrder } from '../../../entity/BuyFromStoreOrder';
import { Item } from '../../../entity/Item';
import { dbReadRepo, dbRepo } from '../../database/database.service';
import {
  BuyFromStoreCancellationReasonRequiredError,
  BuyFromStoreNotFoundError,
  BuyFromStoreAlreadyCancelledError,
  BuyFromStoreInvalidRatingError,
  BuyFromStoreReviewCommentRequiredError,
  BuyFromStoreOrderNotCompletedError,
  BuyFromStoreInvalidActionError,
  BuyFromStoreDeliveryError,
} from '../../../shared/errors/buyFromStore';
import { Store } from '../../../entity/Store';
import { DropLocation } from '../../../entity/DropLocation';
import { OrderReview } from '../../../entity/OrderReview';
import { Between } from 'typeorm';
import {
  TBuyFromStoreOrder,
  TFinalizeOrder,
  TMarkAsDelivered,
  TCancelOrder,
  TReportIssue,
} from './buyFromStore.types';

@Injectable()
export class BuyFromStoreService {
  async createOrder(
    data: TBuyFromStoreOrder,
    customerId: number,
  ): Promise<BuyFromStoreOrder> {
    logger.debug('BuyFromStoreService.createOrder: Creating a new BuyFromStore order');
    const queryRunner = dbRepo(BuyFromStoreOrder)
      .manager
      .connection
      .createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let store = await queryRunner.manager.findOne(Store, {
        where: { storeName: data.store.storeName },
      });

      if (!store) {
        store = queryRunner.manager.create(Store, data.store);
        store = await queryRunner.manager.save(Store, store);
        logger.debug(`BuyFromStoreService.createOrder: Created new Store with ID ${store.id}`);
      } else {
        logger.debug(`BuyFromStoreService.createOrder: Reusing existing Store with ID ${store.id}`);
      }

      let dropLocation = await queryRunner.manager.findOne(DropLocation, {
        where: { ...data.dropLocation },
      });

      if (!dropLocation) {
        dropLocation = queryRunner.manager.create(DropLocation, data.dropLocation);
        dropLocation = await queryRunner.manager.save(DropLocation, dropLocation);
        logger.debug(`BuyFromStoreService.createOrder: Created new DropLocation with ID ${dropLocation.id}`);
      } else {
        logger.debug(`BuyFromStoreService.createOrder: Reusing existing DropLocation with ID ${dropLocation.id}`);
      }

      const buyFromStoreOrder = queryRunner.manager.create(BuyFromStoreOrder, {
        store: store,
        dropLocation: dropLocation,
        deliveryInstructions: data.deliveryInstructions,
        estimatedDistance: data.estimatedDistance,
        estimatedTime: data.estimatedTime,
        customerId: customerId,
        status: OrderStatusEnum.PENDING,
        deliveryPaymentStatus: PaymentStatusEnum.NOT_PAID,
        itemsPaymentStatus: PaymentStatusEnum.NOT_PAID,
        paymentStatus: PaymentStatusEnum.NOT_PAID,
      });

      const savedOrder = await queryRunner.manager.save(BuyFromStoreOrder, buyFromStoreOrder);
      logger.debug(`BuyFromStoreService.createOrder: Created BuyFromStoreOrder with ID ${savedOrder.id}`);

      if (data.items && data.items.length > 0) {
        for (const itemData of data.items) {
          const item = queryRunner.manager.create(Item, {
            order: savedOrder,
            name: itemData.name,
            quantity: itemData.quantity,
            price: itemData.price,
            imageUrl: itemData.imageUrl,
            currentStatus: ItemStatusEnum.PENDING_VERIFICATION,
          });
          await queryRunner.manager.save(Item, item);
          logger.debug(`BuyFromStoreService.createOrder: Added Item with ID ${item.id} to Order ID ${savedOrder.id}`);
        }
      } else {
        throw new BadRequestException('At least one item must be added to the order');
      }

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`BuyFromStoreService.createOrder: Failed to create order - ${error}`, {
        stack: (error as Error).stack,
        ...error,
      });
      throw new InternalServerErrorException('Failed to create BuyFromStore order');
    } finally {
      await queryRunner.release();
    }
  }

  async cancelOrder(
    orderId: number,
    reason: string,
    userId: number,
  ): Promise<BuyFromStoreOrder> {
    logger.debug(`BuyFromStoreService.cancelOrder: Attempting to cancel order ID ${orderId}`);

    if (!reason) {
      throw new BuyFromStoreCancellationReasonRequiredError('Cancellation reason is required');
    }

    const order = await dbReadRepo(BuyFromStoreOrder).findOne({
      where: { id: orderId, customerId: userId },
    });

    if (!order) {
      throw new BuyFromStoreNotFoundError(`Order ID ${orderId} not found`);
    }

    if (order.status === OrderStatusEnum.CANCELED) {
      throw new BuyFromStoreAlreadyCancelledError(`Order ID ${orderId} is already canceled`);
    }

    order.status = OrderStatusEnum.CANCELED;
    order.cancellationReason = reason;
    order.canceledBy = UserRoleEnum.CUSTOMER;

    const updatedOrder = await dbRepo(BuyFromStoreOrder).save(order);
    logger.debug(`BuyFromStoreService.cancelOrder: Order ID ${orderId} canceled successfully`);
    return updatedOrder;
  }

  async leaveReview(
    orderId: number,
    rating: number,
    comment: string,
    userId: number,
  ): Promise<OrderReview> {
    logger.debug(`BuyFromStoreService.leaveReview: Leaving review for order ID ${orderId}`);

    if (rating < 1 || rating > 5) {
      throw new BuyFromStoreInvalidRatingError('Rating must be between 1 and 5');
    }
    if (!comment) {
      throw new BuyFromStoreReviewCommentRequiredError('Comment is required for review');
    }

    const order = await dbReadRepo(BuyFromStoreOrder).findOne({
      where: { id: orderId, customerId: userId },
      relations: ['agent', 'customer', 'report'],
    });

    if (!order) {
      throw new BuyFromStoreNotFoundError(`Order ID ${orderId} not found`);
    }

    if (order.status !== OrderStatusEnum.COMPLETED) {
      throw new BuyFromStoreOrderNotCompletedError(`Cannot review an incomplete order with ID ${orderId}`);
    }

    const review = dbRepo(OrderReview).create({
      rating,
      comment,
      customer: order.customer,
      buyFromStoreOrder: order,
    });

    const savedReview = await dbRepo(OrderReview).save(review);
    logger.debug(`BuyFromStoreService.leaveReview: Review created with ID ${savedReview.id} for order ID ${orderId}`);

    return savedReview;
  }

  async getOrderDetails(
    orderId: number,
    userId: number | null,
  ): Promise<BuyFromStoreOrder> {
    logger.debug(`BuyFromStoreService.getOrderDetails: Fetching details for order ID ${orderId}`);

    const whereClause: any = { id: orderId };
    if (userId) {
      whereClause.customerId = userId;
    }

    const order = await dbReadRepo(BuyFromStoreOrder).findOne({
      where: whereClause,
      relations: ['store', 'dropLocation', 'customer', 'agent', 'report', 'items'],
    });

    if (!order) {
      throw new BuyFromStoreNotFoundError(`Order ID ${orderId} not found`);
    }

    logger.debug(`BuyFromStoreService.getOrderDetails: Successfully fetched details for order ID ${orderId}`);
    return order;
  }

  async getAllOrders(
    userId: number | null,
    query: any,
  ): Promise<BuyFromStoreOrder[]> {
    logger.debug('BuyFromStoreService.getAllOrders: Retrieving all BuyFromStore orders');

    const { status, dateRange } = query;
    const where: any = {};

    if (userId) {
      where.customerId = userId;
    }

    if (status) {
      where.status = status;
    }
    if (dateRange) {
      const { start, end } = dateRange;
      where.createdAt = Between(new Date(start), new Date(end));
    }

    const orders = await dbReadRepo(BuyFromStoreOrder).find({
      where,
      relations: ['store', 'dropLocation', 'agent', 'report', 'items'],
      order: { createdAt: 'DESC' },
    });

    logger.debug(`BuyFromStoreService.getAllOrders: Retrieved ${orders.length} BuyFromStore orders`);
    return orders;
  }

  async acceptOrder(orderId: number, agentId: number): Promise<BuyFromStoreOrder> {
    logger.debug(`BuyFromStoreService.acceptOrder: Agent ID ${agentId} attempting to accept order ID ${orderId}`);

    const order = await dbReadRepo(BuyFromStoreOrder).findOne({
      where: { id: orderId },
      relations: ['agent', 'customer', 'store', 'dropLocation', 'items'],
    });

    if (!order) {
      throw new BuyFromStoreNotFoundError(`Order ID ${orderId} not found`);
    }

    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BuyFromStoreInvalidActionError(`Order ID ${orderId} cannot be accepted in its current status`);
    }

    order.agentId = agentId;
    order.status = OrderStatusEnum.AGENT_ASSIGNED;
    order.acceptedAt = new Date();

    const updatedOrder = await dbRepo(BuyFromStoreOrder).save(order);
    logger.debug(`BuyFromStoreService.acceptOrder: Order ID ${orderId} accepted by agent ID ${agentId}`);

    return updatedOrder;
  }

  async finalizeOrder(
    orderId: number,
    agentId: number,
    TFinalizeOrder: TFinalizeOrder,
  ): Promise<BuyFromStoreOrder> {
    logger.debug(`BuyFromStoreService.finalizeOrder: Agent ID ${agentId} finalizing order ID ${orderId}`);

    const order = await dbReadRepo(BuyFromStoreOrder).findOne({
      where: { id: orderId, agentId },
      relations: ['items', 'customer'],
    });

    if (!order) {
      throw new BuyFromStoreNotFoundError(`Order ID ${orderId} not found or not assigned to agent ID ${agentId}`);
    }

    if (
      order.status !== OrderStatusEnum.AGENT_ASSIGNED &&
      order.status !== OrderStatusEnum.AGENT_REACHED_STORE
    ) {
      throw new BuyFromStoreInvalidActionError(`Order ID ${orderId} cannot be finalized in its current status`);
    }

    order.status = OrderStatusEnum.ITEMS_PAYMENT_RECEIVED;
    order.deliveryPaymentStatus = PaymentStatusEnum.PAID;
    order.paymentStatus = PaymentStatusEnum.PAID;
    order.completionPhoto = TFinalizeOrder.finalBillUrl;

    const updatedOrder = await dbRepo(BuyFromStoreOrder).save(order);
    logger.debug(`BuyFromStoreService.finalizeOrder: Order ID ${orderId} finalized by agent ID ${agentId}`);

    return updatedOrder;
  }

  async markAsDelivered(
    orderId: number,
    agentId: number,
    TMarkAsDelivered: TMarkAsDelivered,
  ): Promise<BuyFromStoreOrder> {
    logger.debug(`BuyFromStoreService.markAsDelivered: Agent ID ${agentId} marking order ID ${orderId} as delivered`);

    const order = await dbReadRepo(BuyFromStoreOrder).findOne({
      where: { id: orderId, agentId },
      relations: ['customer', 'items'],
    });

    if (!order) {
      throw new BuyFromStoreNotFoundError(`Order ID ${orderId} not found or not assigned to agent ID ${agentId}`);
    }

    if (order.status !== OrderStatusEnum.OUT_FOR_DELIVERY) {
      throw new BuyFromStoreInvalidActionError(`Order ID ${orderId} cannot be marked as delivered in its current status`);
    }

    if (TMarkAsDelivered.completionPhotoUrl) {
      order.completionPhoto = TMarkAsDelivered.completionPhotoUrl;
    } else {
      throw new BuyFromStoreDeliveryError('Completion photo URL is required to mark the order as delivered');
    }

    order.status = OrderStatusEnum.DELIVERED;
    order.completedAt = new Date();

    const updatedOrder = await dbRepo(BuyFromStoreOrder).save(order);
    logger.debug(`BuyFromStoreService.markAsDelivered: Order ID ${orderId} marked as delivered by agent ID ${agentId}`);

    return updatedOrder;
  }

  async agentCancelOrder(
    orderId: number,
    agentId: number,
    TCancelOrder: TCancelOrder,
  ): Promise<BuyFromStoreOrder> {
    logger.debug(`BuyFromStoreService.agentCancelOrder: Agent ID ${agentId} attempting to cancel order ID ${orderId}`);

    if (!TCancelOrder.reason) {
      throw new BuyFromStoreCancellationReasonRequiredError('Cancellation reason is required');
    }

    const order = await dbReadRepo(BuyFromStoreOrder).findOne({
      where: { id: orderId, agentId },
      relations: ['customer'],
    });

    if (!order) {
      throw new BuyFromStoreNotFoundError(`Order ID ${orderId} not found or not assigned to agent ID ${agentId}`);
    }

    if ([OrderStatusEnum.COMPLETED, OrderStatusEnum.CANCELED].includes(order.status)) {
      throw new BuyFromStoreAlreadyCancelledError(`Order ID ${orderId} cannot be canceled in its current status`);
    }

    order.status = OrderStatusEnum.CANCELED;
    order.cancellationReason = TCancelOrder.reason;
    order.canceledBy = UserRoleEnum.AGENT;

    const updatedOrder = await dbRepo(BuyFromStoreOrder).save(order);
    logger.debug(`BuyFromStoreService.agentCancelOrder: Order ID ${orderId} canceled by agent ID ${agentId}`);

    return updatedOrder;
  }


  async getAllAssignedOrders(
    agentId: number,
    query: any,
  ): Promise<BuyFromStoreOrder[]> {
    logger.debug(`BuyFromStoreService.getAllAssignedOrders: Fetching orders for agent ID ${agentId} with filters`);

    const { status, dateRange } = query;
    const where: any = { agentId };

    if (status) {
      where.status = status;
    }
    if (dateRange) {
      const { start, end } = dateRange;
      where.createdAt = Between(new Date(start), new Date(end));
    }

    const orders = await dbReadRepo(BuyFromStoreOrder).find({
      where,
      relations: ['store', 'dropLocation', 'customer', 'items', 'report'],
      order: { createdAt: 'DESC' },
    });

    logger.debug(`BuyFromStoreService.getAllAssignedOrders: Retrieved ${orders.length} orders for agent ID ${agentId}`);
    return orders;
  }
}
