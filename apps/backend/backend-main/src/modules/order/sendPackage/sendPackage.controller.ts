import {
    Controller,
    Post,
    Body,
    Param,
    Get,
    ParseIntPipe,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { UserRoleEnum } from '../../../shared/enums';
import { SendAPackageService } from './sendPackage.service';
import { IApiResponse } from '../../../shared/interface';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Report } from '../../../entity/Report';
import { OrderReview } from '../../../entity/OrderReview';
import { SendPackageOrder } from '../../../entity/SendAPackage';

@Controller('order/send-package')
export class SendPackageController {
    constructor(private readonly sendPackageService: SendAPackageService) { }

    @Post('create')
    @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN)
    async createSendPackageOrder(
        @Body() data: any,
    ): Promise<IApiResponse<SendPackageOrder>> {
        const createdOrder = await this.sendPackageService.create(data);
        return {
            success: true,
            message: 'Send package order created successfully.',
            data: createdOrder,
        };
    }

    @Post(':orderId/cancel')
    @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN)
    async cancelOrder(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body('reason') reason: string,
    ): Promise<IApiResponse<SendPackageOrder>> {
        if (!reason) {
            throw new BadRequestException('Cancellation reason is required');
        }
        const data = await this.sendPackageService.cancelOrder(orderId, reason);
        return {
            success: true,
            message: 'Order canceled successfully.',
            data,
        };
    }

    @Post(':orderId/reportagent')
    @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN)
    async reportAgent(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body('reason') reason: string,
        @Body('details') details: string,
    ): Promise<IApiResponse<Report>> {
        if (!reason) {
            throw new BadRequestException('Reason is required to report agent');
        }
        const data = await this.sendPackageService.reportAgent(orderId, reason, details);
        return {
            success: true,
            message: 'Agent reported successfully.',
            data,
        };
    }

    @Post(':orderId/review')
    @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN)
    async leaveReview(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body('rating') rating: number,
        @Body('comment') comment: string,
    ): Promise<IApiResponse<OrderReview>> {
        if (rating < 1 || rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }
        if (!comment) {
            throw new BadRequestException('Comment is required for review');
        }
        const data = await this.sendPackageService.leaveReview(orderId, rating, comment);
        return {
            success: true,
            message: 'Review submitted successfully.',
            data,
        };
    }

    @Get(':orderId')
    @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.AGENT, UserRoleEnum.ADMIN)
    async getOrderDetails(
        @Param('orderId', ParseIntPipe) orderId: number,
    ): Promise<IApiResponse<SendPackageOrder>> {
        const data = await this.sendPackageService.getOrderDetails(orderId);
        return {
            success: true,
            message: 'Order details retrieved successfully.',
            data,
        };
    }

    // ====== Agent APIs ======

    @Post('agent/:orderId/accept')
    @Roles(UserRoleEnum.AGENT)
    async acceptOrder(
        @Param('orderId', ParseIntPipe) orderId: number,
    ): Promise<IApiResponse<SendPackageOrder>> {
        const data = await this.sendPackageService.acceptOrder(orderId);
        return {
            success: true,
            message: 'Order accepted successfully.',
            data,
        };
    }

    @Post('agent/:orderId/start')
    @Roles(UserRoleEnum.AGENT)
    async startOrder(
        @Param('orderId', ParseIntPipe) orderId: number,
    ): Promise<IApiResponse<SendPackageOrder>> {
        const data = await this.sendPackageService.startOrder(orderId);
        return {
            success: true,
            message: 'Order started successfully.',
            data,
        };
    }

    @Post('agent/:orderId/complete')
    @Roles(UserRoleEnum.AGENT)
    async completeOrder(
        @Param('orderId', ParseIntPipe) orderId: number,
    ): Promise<IApiResponse<SendPackageOrder>> {
        const data = await this.sendPackageService.completeOrder(orderId);
        return {
            success: true,
            message: 'Order completed successfully.',
            data,
        };
    }

    @Post('agent/:orderId/cancel')
    @Roles(UserRoleEnum.AGENT)
    async agentCancelOrder(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body('reason') reason: string,
    ): Promise<IApiResponse<SendPackageOrder>> {
        if (!reason) {
            throw new BadRequestException('Cancellation reason is required');
        }
        const data = await this.sendPackageService.agentCancelOrder(orderId, reason);
        return {
            success: true,
            message: 'Order canceled successfully by agent.',
            data,
        };
    }

    @Post('agent/:orderId/report')
    @Roles(UserRoleEnum.AGENT)
    async reportIssue(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body('issue') issue: string,
    ): Promise<IApiResponse<Report>> {
        if (!issue) {
            throw new BadRequestException('Issue description is required');
        }
        const data = await this.sendPackageService.reportIssue(orderId, issue);
        return {
            success: true,
            message: 'Issue reported successfully.',
            data,
        };
    }

    // ====== Admin APIs ======

    @Get('admin/orders')
    @Roles(UserRoleEnum.ADMIN)
    async getAllOrders(
        @Body() query: any, // Alternatively, use @Query() for query parameters
    ): Promise<IApiResponse<SendPackageOrder[]>> {
        const data = await this.sendPackageService.getAllOrders(query);
        return {
            success: true,
            message: 'All orders retrieved successfully.',
            data,
        };
    }

    @Get('admin/orders/:orderId')
    @Roles(UserRoleEnum.ADMIN)
    async getAdminOrderDetails(
        @Param('orderId', ParseIntPipe) orderId: number,
    ): Promise<IApiResponse<SendPackageOrder>> {
        const data = await this.sendPackageService.getAdminOrderDetails(orderId);
        return {
            success: true,
            message: 'Order details retrieved successfully.',
            data,
        };
    }
}
