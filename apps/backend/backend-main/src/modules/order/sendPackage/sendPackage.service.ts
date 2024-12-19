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
    SendPackageOrderNotCompletedError,
} from '../../../shared/errors/sendAPackage';
import { SendPackageOrder } from '../../../entity/SendPackageOrder';
import { TSendPackageOrder } from './sendPackage.types';
import { PickupLocation } from '../../../entity/PickupLocation';
import { DropLocation } from '../../../entity/DropLocation';

@Injectable()
export class SendAPackageService {
    async create(data: TSendPackageOrder): Promise<SendPackageOrder> {
        logger.debug("SendAPackageService.create: Creating a new send package order");
        const queryRunner = dbRepo(SendPackageOrder).manager.connection.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            let pickupLocation = await queryRunner.manager.findOne(PickupLocation, {
                where: {
                    latitude: data.pickupLocation.latitude,
                    longitude: data.pickupLocation.longitude,
                },
            });

            if (!pickupLocation) {
                pickupLocation = queryRunner.manager.create(PickupLocation, data.pickupLocation);
                pickupLocation = await queryRunner.manager.save(PickupLocation, pickupLocation);
                logger.debug(`SendAPackageService.create: Created new PickupLocation with ID ${pickupLocation.id}`);
            } else {
                logger.debug(`SendAPackageService.create: Reusing existing PickupLocation with ID ${pickupLocation.id}`);
            }

            let dropLocation = await queryRunner.manager.findOne(DropLocation, {
                where: {
                    latitude: data.dropLocation.latitude,
                    longitude: data.dropLocation.longitude,
                },
            });

            if (!dropLocation) {
                dropLocation = queryRunner.manager.create(DropLocation, data.dropLocation);
                dropLocation = await queryRunner.manager.save(DropLocation, dropLocation);
                logger.debug(`SendAPackageService.create: Created new DropLocation with ID ${dropLocation.id}`);
            } else {
                logger.debug(`SendAPackageService.create: Reusing existing DropLocation with ID ${dropLocation.id}`);
            }

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
                price: data.price,
                type: OrderTypeEnum.DELIVERY,
                status: OrderStatusEnum.PENDING,
                paymentStatus: PaymentStatusEnum.NOT_PAID,
            });

            const savedOrder = await queryRunner.manager.save(SendPackageOrder, sendPackageOrder);
            logger.debug(`SendAPackageService.create: Created SendPackageOrder with ID ${savedOrder.id}`);

            await queryRunner.commitTransaction();
            return savedOrder;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            logger.error(`SendAPackageService.create: Failed to create order - ${error}`);
            throw new InternalServerErrorException('Failed to create send package order');
        } finally {
            await queryRunner.release();
        }
    }

    async cancelOrder(orderId: number, reason: string): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.cancelOrder: Attempting to cancel order ID ${orderId}`);

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
    }

    async reportAgent(orderId: number, reason: string, details: string): Promise<Report> {
        logger.debug(`SendAPackageService.reportAgent: Reporting agent for order ID ${orderId}`);

        if (!reason) {
            throw new SendPackageAgentReportReasonRequiredError('Reason is required to report agent');
        }

        const order = await dbReadRepo(SendPackageOrder).findOne({ where: { id: orderId }, relations: ['customer'] });

        if (!order) {
            throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
        }

        const savedReport = await dbRepo(Report).save({
            reason,
            details,
            customer: order.customer,
            sendPackageOrderId: order.id,
        });
        logger.debug(`SendAPackageService.reportAgent: Report created with ID ${savedReport.id} for order ID ${orderId}`);
        return savedReport;
    }

    async leaveReview(orderId: number, rating: number, comment: string): Promise<OrderReview> {
        logger.debug(`SendAPackageService.leaveReview: Leaving review for order ID ${orderId}`);

        if (rating < 1 || rating > 5) {
            throw new SendPackageInvalidRatingError('Rating must be between 1 and 5');
        }
        if (!comment) {
            throw new SendPackageReviewCommentRequiredError('Comment is required for review');
        }

        const order = await dbReadRepo(SendPackageOrder).findOne({
            where: { id: orderId },
            relations: ['agent', 'customer', 'review'],
        });

        if (!order) {
            throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
        }

        if (order.status !== OrderStatusEnum.COMPLETED) {
            throw new SendPackageOrderNotCompletedError(`Cannot review an incomplete order with ID ${orderId}`);
        }

        const savedReview = await dbRepo(OrderReview).save({
            rating,
            comment,
            customer: order.customer,
            sendPackageOrderId: order.id,
        });
        logger.debug(`SendAPackageService.leaveReview: Review created with ID ${savedReview.id} for order ID ${orderId}`);

        return savedReview;
    }

    async getOrderDetails(orderId: number): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.getOrderDetails: Fetching details for order ID ${orderId}`);

        const order = await dbReadRepo(SendPackageOrder).findOne({
            where: { id: orderId },
            relations: ['pickupLocation', 'dropLocation', 'customer', 'agent', 'report', 'review'],
        });

        if (!order) {
            throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
        }

        logger.debug(`SendAPackageService.getOrderDetails: Successfully fetched details for order ID ${orderId}`);
        return order;
    }

    async updatePaymentStatus(orderId: number, paymentStatus: PaymentStatusEnum): Promise<SendPackageOrder> {
        logger.debug(`SendAPackageService.updatePaymentStatus: Updating payment status for order ID ${orderId} to ${paymentStatus}`);

        const order = await dbRepo(SendPackageOrder).findOne({ where: { id: orderId } });

        if (!order) {
            throw new SendPackageNotFoundError(`Order ID ${orderId} not found`);
        }

        order.paymentStatus = paymentStatus;

        const updatedOrder = await dbRepo(SendPackageOrder).save(order);
        logger.debug(`SendAPackageService.updatePaymentStatus: Payment status for order ID ${orderId} updated to ${paymentStatus}`);

        return updatedOrder;
    }
}
