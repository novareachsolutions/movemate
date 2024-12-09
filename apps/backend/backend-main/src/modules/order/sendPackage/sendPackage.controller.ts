import {
    Controller,
    Post,
    Body,
    Param,
    Get,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import { UserRoleEnum } from '../../../shared/enums';
import { SendAPackageService } from './sendPackage.service';
import { IApiResponse } from '../../../shared/interface';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Report } from '../../../entity/Report';
import { OrderReview } from '../../../entity/OrderReview';
import { SendPackageOrder } from '../../../entity/SendPackageOrder';
import { TSendPackageOrder } from './sendPackage.types';
import { AuthGuard } from '../../../shared/guards/auth.guard';


@Controller('order/send-package')
export class SendPackageController {
    constructor(private readonly sendPackageService: SendAPackageService) { }

    @Post('create')
    @UseGuards(AuthGuard)
    @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN)
    async createSendPackageOrder(
        @Body() data: TSendPackageOrder,
        @Req() req: any,
    ): Promise<IApiResponse<SendPackageOrder>> {
        const customerId = req.user.id;
        const createdOrder = await this.sendPackageService.create({
            ...data,
            customerId, // Dynamically set customerId from the request user
        });
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

}
