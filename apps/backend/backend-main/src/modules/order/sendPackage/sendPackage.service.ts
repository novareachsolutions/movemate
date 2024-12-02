import {
    Injectable,
    InternalServerErrorException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { logger } from '../../../logger';
import {
    OrderTypeEnum,
    OrderStatusEnum,
    PaymentStatusEnum,
    CancellationSourceEnum,
} from '../../../shared/enums';
import { SendPackageOrder } from '../../../entity/Order/SendAPackage';
import { dbReadRepo, dbRepo } from '../../database/database.service';
import { Order } from '../../../entity/Order';
import { Report } from '../../../entity/Report';
import { OrderReview } from '../../../entity/OrderReview';

@Injectable()
export class SendAPackageService {
    async create(data: any): Promise<SendPackageOrder> {
        logger.debug(
            'SendAPackageService.createSendPackageOrder: Creating a new send package order',
        );
        try {
            if (!data.pickupLocation || !data.dropLocation) {
                logger.error(
                    'SendAPackageService.createSendPackageOrder: Pickup and drop locations are required',
                );
                throw new BadRequestException(
                    'Pickup and drop locations are required',
                );
            }

            // TODO: Billing and Payment Integration
            // Example: Initiate payment processing

            const savedSendPackageOrder = await dbRepo(SendPackageOrder).save({
                ...data,
                type: OrderTypeEnum.DELIVERY,
                status: OrderStatusEnum.PENDING,
                paymentStatus: PaymentStatusEnum.NOT_PAID,
            });
            logger.debug(
                `SendAPackageService.createSendPackageOrder: Send package order created with ID ${savedSendPackageOrder}`,
            );

            return savedSendPackageOrder;
        } catch (error) {
            logger.error(
                `SendAPackageService.createSendPackageOrder: Failed to create send package order. Error: ${error}`,
            );
            throw new InternalServerErrorException(
                'Failed to create send package order',
            );
        }
    }

    async cancelOrder(orderId: number, reason: string): Promise<Order> {
        logger.debug(`OrderService.cancelOrder: Attempting to cancel order ID ${orderId}`);
        try {
            if (!reason) {
                throw new BadRequestException('Cancellation reason is required');
            }
            const order = await dbReadRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                logger.error(`OrderService.cancelOrder: Order ID ${orderId} not found`);
                throw new NotFoundException('Order not found');
            }

            if (order.status === OrderStatusEnum.CANCELED) {
                logger.warn(`OrderService.cancelOrder: Order ID ${orderId} is already canceled`);
                throw new BadRequestException('Order is already canceled');
            }

            order.status = OrderStatusEnum.CANCELED;
            order.cancellationReason = reason;
            order.canceledBy = CancellationSourceEnum.CUSTOMER;

            const updatedOrder = await dbRepo(SendPackageOrder).save(order);
            logger.debug(`OrderService.cancelOrder: Order ID ${orderId} canceled successfully`);

            // TODO: Handle refund or other business logic

            return updatedOrder;
        } catch (error) {
            logger.error(`OrderService.cancelOrder: Failed to cancel order ID ${orderId}. Error: ${error}`);
            throw new InternalServerErrorException('Failed to cancel order');
        }
    }

    async reportAgent(orderId: number, reason: string, details: string): Promise<Report> {
        logger.debug(`OrderService.reportAgent: Reporting agent for order ID ${orderId}`);
        try {
            if (!reason) {
                throw new BadRequestException('Reason is required to report agent');
            }
            const order = await dbReadRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                logger.error(`OrderService.reportAgent: Order ID ${orderId} not found`);
                throw new NotFoundException('Order not found');
            }

            const savedReport = await dbRepo(Report).save({
                reason,
                details,
                customerId: order.customerId,
                orderId: order.id,
            });
            logger.debug(`OrderService.reportAgent: Report created with ID ${savedReport.id} for order ID ${orderId}`);

            // TODO: Notify admin or take further actions

            return savedReport;
        } catch (error) {
            logger.error(`OrderService.reportAgent: Failed to report agent for order ID ${orderId}. Error: ${error}`);
            throw new InternalServerErrorException('Failed to report agent');
        }
    }

    async leaveReview(orderId: number, rating: number, comment: string): Promise<OrderReview> {
        logger.debug(`OrderService.leaveReview: Leaving review for order ID ${orderId}`);
        try {
            if (rating < 1 || rating > 5) {
                throw new BadRequestException('Rating must be between 1 and 5');
            }
            if (!comment) {
                throw new BadRequestException('Comment is required for review');
            }

            const order = await dbReadRepo(SendPackageOrder).findOne({
                where: { id: orderId },
                relations: ['agent', 'customer'],
            });

            if (!order) {
                logger.error(`OrderService.leaveReview: Order ID ${orderId} not found`);
                throw new NotFoundException('Order not found');
            }

            if (order.status !== OrderStatusEnum.COMPLETED) {
                logger.error(`OrderService.leaveReview: Cannot review order ID ${orderId} as it is not completed`);
                throw new BadRequestException('Cannot review an incomplete order');
            }

            const existingReview = await dbRepo(OrderReview).findOne({ where: { orderId } });

            if (existingReview) {
                logger.warn(`OrderService.leaveReview: Review for order ID ${orderId} already exists`);
                throw new BadRequestException('Review already submitted for this order');
            }


            const savedReview = await dbRepo(OrderReview).save({
                rating,
                comment,
                customerId: order.customerId,
                orderId: order.id,
            });
            logger.debug(`OrderService.leaveReview: Review created with ID ${savedReview.id} for order ID ${orderId}`);

            return savedReview;
        } catch (error) {
            logger.error(`OrderService.leaveReview: Failed to leave review for order ID ${orderId}. Error: ${error}`);
            throw new InternalServerErrorException('Failed to leave review');
        }
    }

    async getOrderDetails(orderId: number): Promise<Order> {
        logger.debug(`OrderService.getOrderDetails: Fetching details for order ID ${orderId}`);
        try {
            const order = await dbReadRepo(SendPackageOrder).findOne({
                where: { id: orderId },
                relations: ['pickupLocation', 'dropLocation', 'customer', 'agent', 'report', 'review'],
            });

            if (!order) {
                logger.error(`OrderService.getOrderDetails: Order ID ${orderId} not found`);
                throw new NotFoundException('Order not found');
            }

            logger.debug(`OrderService.getOrderDetails: Successfully fetched details for order ID ${orderId}`);
            return order;
        } catch (error) {
            logger.error(`OrderService.getOrderDetails: Failed to fetch details for order ID ${orderId}. Error: ${error}`);
            throw new InternalServerErrorException('Failed to fetch order details');
        }
    }

    async updatePaymentStatus(orderId: number, paymentStatus: PaymentStatusEnum): Promise<Order> {
        logger.debug(`OrderService.updatePaymentStatus: Updating payment status for order ID ${orderId} to ${paymentStatus}`);
        try {
            const order = await dbRepo(SendPackageOrder).findOne({ where: { id: orderId } });

            if (!order) {
                logger.error(`OrderService.updatePaymentStatus: Order ID ${orderId} not found`);
                throw new NotFoundException('Order not found');
            }

            order.paymentStatus = paymentStatus;

            const updatedOrder = await dbRepo(SendPackageOrder).save(order);
            logger.debug(`OrderService.updatePaymentStatus: Payment status for order ID ${orderId} updated to ${paymentStatus}`);

            return updatedOrder;
        } catch (error) {
            logger.error(`OrderService.updatePaymentStatus: Failed to update payment status for order ID ${orderId}. Error: ${error}`);
            throw new InternalServerErrorException('Failed to update payment status');
        }
    }

}
