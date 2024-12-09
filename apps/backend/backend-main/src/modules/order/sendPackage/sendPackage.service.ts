import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

} from '../../../shared/errors/sendAPackage';
import { SendPackageOrder } from '../../../entity/SendPackageOrder';
import { TSendPackageOrder } from './sendPackage.types';

@Injectable()
export class SendAPackageService {
    async create(data: TSendPackageOrder): Promise<SendPackageOrder> {
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
            throw new InternalServerErrorException('Failed to fetch order details');
        }
    }

    async updatePaymentStatus(orderId: number, paymentStatus: PaymentStatusEnum): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.updatePaymentStatus: Updating payment status for order ID ${orderId} to ${paymentStatus}`);
        try {
            const order = await dbRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
            }

            order.paymentStatus = paymentStatus;

            const updatedOrder = await dbRepo(SendPackageOrder).save(order);
            logger.debug(`SendAPackageService.updatePaymentStatus: Payment status for order ID ${orderId} updated to ${paymentStatus}`);

            return updatedOrder;
        } catch (error) {
            logger.error(`SendAPackageService.updatePaymentStatus: Failed to update payment status for order ID ${orderId}. Error: ${error}`);
            throw new InternalServerErrorException('Failed to update payment status');
        }
    }
}
