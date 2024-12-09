import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { logger } from '../../../logger';
import {
    OrderTypeEnum,
    OrderStatusEnum,
    PaymentStatusEnum,
    UserRoleEnum,
} from '../../../shared/enums';
import { Report } from '../../../entity/Report';
import { OrderReview } from '../../../entity/OrderReview';
import { dbReadRepo, dbRepo } from '../../database/database.service';
import {
    SendPackageCancellationReasonRequiredError,
    SendPackageNotFoundError,
    SendPackageAlreadyCancelledError,
    SendPackageAgentReportReasonRequiredError,
    SendPackageInvalidRatingError,
    SendPackageReviewCommentRequiredError,
    SendPackageAlreadyReviewedError,
    SendPackageOrderNotCompletedError,
    SendPackageAgentAcceptError,
    SendPackageAgentStartError,
    SendPackageAgentCompleteError,
    SendPackageAgentCancelError,
    SendPackageIssueReportError,
} from '../../../shared/errors/sendAPackage';
import { Between } from 'typeorm';
import { SendPackageOrder } from '../../../entity/SendPackageOrder';

@Injectable()
export class SendAPackageService {
    async create(data: any): Promise<SendPackageOrder> {
        logger.debug('SendAPackageService.createSendPackageOrder: Creating a new send package order');
        try {
            if (!data.pickupLocation || !data.dropLocation) {
                logger.error('SendAPackageService.createSendPackageOrder: Pickup and drop locations are required');
                throw new SendPackageCancellationReasonRequiredError('Pickup and drop locations are required');
            }

            const savedSendPackageOrder = await dbRepo(SendPackageOrder).save({
                ...data,
                type: OrderTypeEnum.DELIVERY,
                status: OrderStatusEnum.PENDING,
                paymentStatus: PaymentStatusEnum.NOT_PAID,
            });
            logger.debug(`SendAPackageService.createSendPackageOrder: Send package order created with ID ${savedSendPackageOrder.id}`);
            return savedSendPackageOrder;
        } catch (error) {
            logger.error(`SendAPackageService.createSendPackageOrder: Failed to create send package order. Error: ${error}`);
            throw new InternalServerErrorException('Failed to create send package order');
        }
    }

    async cancelOrder(orderId: number, reason: string): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.cancelOrder: Attempting to cancel order ID ${orderId}`);
        try {
            if (!reason) {
                throw new SendPackageCancellationReasonRequiredError('Cancellation reason is required');
            }

            const order = await dbReadRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            if (order.status === OrderStatusEnum.CANCELED) {
                throw new SendPackageAlreadyCancelledError(`Order ID ${orderId} is already canceled`);
            }

            order.status = OrderStatusEnum.CANCELED;
            order.cancellationReason = reason;
            order.canceledBy = UserRoleEnum.CUSTOMER;

            const updatedOrder = await dbRepo(SendPackageOrder).save(order);
            logger.debug(`SendAPackageService.cancelOrder: Order ID ${orderId} canceled successfully`);
            return updatedOrder;
        } catch (error) {
            logger.error(`SendAPackageService.cancelOrder: Failed to cancel order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageCancellationReasonRequiredError ||
                error instanceof SendPackageNotFoundError ||
                error instanceof SendPackageAlreadyCancelledError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to cancel order');
        }
    }

    async reportAgent(orderId: number, reason: string, details: string): Promise<Report> {
        logger.debug(`SendAPackageService.reportAgent: Reporting agent for order ID ${orderId}`);
        try {
            if (!reason) {
                throw new SendPackageAgentReportReasonRequiredError('Reason is required to report agent');
            }

            const order = await dbReadRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            const savedReport = await dbRepo(Report).save({
                reason,
                details,
                customerId: order.customerId,
                orderId: order.id,
            });
            logger.debug(`SendAPackageService.reportAgent: Report created with ID ${savedReport.id} for order ID ${orderId}`);
            return savedReport;
        } catch (error) {
            logger.error(`SendAPackageService.reportAgent: Failed to report agent for order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageAgentReportReasonRequiredError ||
                error instanceof SendPackageNotFoundError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to report agent');
        }
    }

    async leaveReview(orderId: number, rating: number, comment: string): Promise<OrderReview> {
        logger.debug(`SendAPackageService.leaveReview: Leaving review for order ID ${orderId}`);
        try {
            if (rating < 1 || rating > 5) {
                throw new SendPackageInvalidRatingError('Rating must be between 1 and 5');
            }
            if (!comment) {
                throw new SendPackageReviewCommentRequiredError('Comment is required for review');
            }

            const order = await dbReadRepo(SendPackageOrder).findOne({
                where: { id: orderId },
                relations: ['agent', 'customer'],
            });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            if (order.status !== OrderStatusEnum.COMPLETED) {
                throw new SendPackageOrderNotCompletedError(`Cannot review an incomplete order with ID ${orderId}`);
            }

            const existingReview = await dbRepo(OrderReview).findOne({ where: { sendPackageOrderId: orderId } });

            if (existingReview) {
                throw new SendPackageAlreadyReviewedError(`Review for order ID ${orderId} already exists`);
            }

            const savedReview = await dbRepo(OrderReview).save({
                rating,
                comment,
                customerId: order.customerId,
                orderId: order.id,
            });
            logger.debug(`SendAPackageService.leaveReview: Review created with ID ${savedReview.id} for order ID ${orderId}`);

            return savedReview;
        } catch (error) {
            logger.error(`SendAPackageService.leaveReview: Failed to leave review for order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageInvalidRatingError ||
                error instanceof SendPackageReviewCommentRequiredError ||
                error instanceof SendPackageNotFoundError ||
                error instanceof SendPackageOrderNotCompletedError ||
                error instanceof SendPackageAlreadyReviewedError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to leave review');
        }
    }

    async getOrderDetails(orderId: number): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.getOrderDetails: Fetching details for order ID ${orderId}`);
        try {
            const order = await dbReadRepo(SendPackageOrder).findOne({
                where: { id: orderId },
                relations: ['pickupLocation', 'dropLocation', 'customer', 'agent', 'report', 'review'],
            });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            logger.debug(`SendAPackageService.getOrderDetails: Successfully fetched details for order ID ${orderId}`);
            return order;
        } catch (error) {
            logger.error(`SendAPackageService.getOrderDetails: Failed to fetch details for order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageNotFoundError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch order details');
        }
    }

    // ====== Agent Service Methods ======

    async acceptOrder(orderId: number): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.acceptOrder: Agent attempting to accept order ID ${orderId}`);
        try {
            const order = await dbRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            if (order.status !== OrderStatusEnum.PENDING) {
                throw new SendPackageAgentAcceptError(`Order ID ${orderId} cannot be accepted in its current status`);
            }

            order.status = OrderStatusEnum.ACCEPTED;
            order.acceptedAt = new Date();

            const updatedOrder = await dbRepo(SendPackageOrder).save(order);
            logger.debug(`SendAPackageService.acceptOrder: Order ID ${orderId} accepted successfully`);
            return updatedOrder;
        } catch (error) {
            logger.error(`SendAPackageService.acceptOrder: Failed to accept order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageNotFoundError || error instanceof SendPackageAgentAcceptError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to accept order');
        }
    }

    async startOrder(orderId: number): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.startOrder: Agent attempting to start order ID ${orderId}`);
        try {
            const order = await dbRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            if (order.status !== OrderStatusEnum.ACCEPTED) {
                throw new SendPackageAgentStartError(`Order ID ${orderId} cannot be started in its current status`);
            }

            order.status = OrderStatusEnum.IN_PROGRESS;
            order.startedAt = new Date();

            const updatedOrder = await dbRepo(SendPackageOrder).save(order);
            logger.debug(`SendAPackageService.startOrder: Order ID ${orderId} started successfully`);
            return updatedOrder;
        } catch (error) {
            logger.error(`SendAPackageService.startOrder: Failed to start order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageNotFoundError || error instanceof SendPackageAgentStartError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to start order');
        }
    }

    async completeOrder(orderId: number): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.completeOrder: Agent attempting to complete order ID ${orderId}`);
        try {
            const order = await dbRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            if (order.status !== OrderStatusEnum.IN_PROGRESS) {
                throw new SendPackageAgentCompleteError(`Order ID ${orderId} cannot be completed in its current status`);
            }

            order.status = OrderStatusEnum.COMPLETED;
            order.completedAt = new Date();

            const updatedOrder = await dbRepo(SendPackageOrder).save(order);
            logger.debug(`SendAPackageService.completeOrder: Order ID ${orderId} completed successfully`);
            return updatedOrder;
        } catch (error) {
            logger.error(`SendAPackageService.completeOrder: Failed to complete order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageNotFoundError || error instanceof SendPackageAgentCompleteError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to complete order');
        }
    }

    async agentCancelOrder(orderId: number, reason: string): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.agentCancelOrder: Agent attempting to cancel order ID ${orderId}`);
        try {
            if (!reason) {
                throw new SendPackageAgentCancelError('Cancellation reason is required');
            }

            const order = await dbRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            if (![OrderStatusEnum.PENDING, OrderStatusEnum.ACCEPTED, OrderStatusEnum.IN_PROGRESS].includes(order.status)) {
                throw new SendPackageAgentCancelError(`Order ID ${orderId} cannot be canceled in its current status`);
            }

            order.status = OrderStatusEnum.CANCELED;
            order.cancellationReason = reason;
            order.canceledBy = UserRoleEnum.AGENT;

            const updatedOrder = await dbRepo(SendPackageOrder).save(order);
            logger.debug(`SendAPackageService.agentCancelOrder: Order ID ${orderId} canceled successfully by agent`);
            return updatedOrder;
        } catch (error) {
            logger.error(`SendAPackageService.agentCancelOrder: Failed to cancel order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageNotFoundError || error instanceof SendPackageAgentCancelError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to cancel order');
        }
    }

    async reportIssue(orderId: number, issue: string): Promise<Report> {
        logger.debug(`SendAPackageService.reportIssue: Agent reporting issue for order ID ${orderId}`);
        try {
            if (!issue) {
                throw new SendPackageIssueReportError('Issue description is required');
            }

            const order = await dbReadRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            const savedReport = await dbRepo(Report).save({
                reason: 'Agent Report',
                details: issue,
                customerId: order.customerId,
                orderId: order.id,
            });
            logger.debug(`SendAPackageService.reportIssue: Issue reported with ID ${savedReport.id} for order ID ${orderId}`);
            return savedReport;
        } catch (error) {
            logger.error(`SendAPackageService.reportIssue: Failed to report issue for order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageIssueReportError || error instanceof SendPackageNotFoundError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to report issue');
        }
    }

    // ====== Admin Service Methods ======

    async getAllOrders(query: any): Promise<SendPackageOrder[]> {
        logger.debug('SendAPackageService.getAllOrders: Retrieving all orders with filters');
        try {
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
                relations: ['pickupLocation', 'dropLocation', 'customer', 'agent', 'report', 'review'],
            });

            logger.debug(`SendAPackageService.getAllOrders: Retrieved ${orders.length} orders`);
            return orders;
        } catch (error) {
            logger.error(`SendAPackageService.getAllOrders: Failed to retrieve orders. Error: ${error}`);
            throw new InternalServerErrorException('Failed to retrieve orders');
        }
    }

    async getAdminOrderDetails(orderId: number): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.getAdminOrderDetails: Retrieving details for order ID ${orderId}`);
        try {
            const order = await dbReadRepo(SendPackageOrder).findOne({
                where: { id: orderId },
                relations: ['pickupLocation', 'dropLocation', 'customer', 'agent', 'report', 'review'],
            });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            logger.debug(`SendAPackageService.getAdminOrderDetails: Successfully retrieved details for order ID ${orderId}`);
            return order;
        } catch (error) {
            logger.error(`SendAPackageService.getAdminOrderDetails: Failed to retrieve order ID ${orderId}. Error: ${error}`);
            if (error instanceof SendPackageNotFoundError) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve order details');
        }
    }
}
