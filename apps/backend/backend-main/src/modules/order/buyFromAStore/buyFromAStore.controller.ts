import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { ICustomRequest, IApiResponse } from '../../../shared/interface';
import {
  TBuyFromStoreOrder,
  TFinalizeOrder,
  TMarkAsDelivered,
} from './buyFromStore.types';
import { UserRoleEnum } from '../../../shared/enums';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { BuyFromStoreOrder } from '../../../entity/BuyFromStoreOrder';
import { Report } from '../../../entity/Report';
import { OrderReview } from '../../../entity/OrderReview';
import { BuyFromStoreService } from './buyFromAStore.service';

@Controller('buyfromstoreorders')
@UseGuards(AuthGuard)
export class BuyFromStoreController {
  constructor(private readonly buyFromStoreService: BuyFromStoreService) {}

  @Post()
  @Roles(UserRoleEnum.CUSTOMER)
  async createOrder(
    @Body() data: TBuyFromStoreOrder,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<BuyFromStoreOrder>> {
    const customerId = req.user.id;
    const createdOrder = await this.buyFromStoreService.createOrder(data, customerId);
    return {
      success: true,
      message: 'BuyFromStore order created successfully.',
      data: createdOrder,
    };
  }

  @Delete(':id')
  @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN)
  async cancelOrder(
    @Param('id') orderId: number,
    @Body('reason') reason: string,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<BuyFromStoreOrder>> {
    const userId = req.user.id;
    const canceledOrder = await this.buyFromStoreService.cancelOrder(orderId, reason, userId);
    return {
      success: true,
      message: 'BuyFromStore order canceled successfully.',
      data: canceledOrder,
    };
  }

  @Post(':id/reviews')
  @Roles(UserRoleEnum.CUSTOMER)
  async leaveReview(
    @Param('id') orderId: number,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<OrderReview>> {
    const userId = req.user.id;
    const review = await this.buyFromStoreService.leaveReview(orderId, rating, comment, userId);
    return {
      success: true,
      message: 'Review submitted successfully.',
      data: review,
    };
  }

  @Get(':id')
  @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.AGENT, UserRoleEnum.ADMIN)
  async getOrderDetails(
    @Param('id') orderId: number,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<BuyFromStoreOrder>> {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === UserRoleEnum.ADMIN) {
      const order = await this.buyFromStoreService.getOrderDetails(orderId, null);
      return {
        success: true,
        message: 'Order details retrieved successfully.',
        data: order,
      };
    }

    const order = await this.buyFromStoreService.getOrderDetails(orderId, userId);
    return {
      success: true,
      message: 'Order details retrieved successfully.',
      data: order,
    };
  }

  @Get()
  @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN)
  async getAllOrders(
    @Query() query: any,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<BuyFromStoreOrder[]>> {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === UserRoleEnum.ADMIN) {
      const orders = await this.buyFromStoreService.getAllOrders(null, query);
      return {
        success: true,
        message: 'All BuyFromStore orders retrieved successfully.',
        data: orders,
      };
    }

    const orders = await this.buyFromStoreService.getAllOrders(userId, query);
    return {
      success: true,
      message: 'BuyFromStore orders retrieved successfully.',
      data: orders,
    };
  }

  @Post('agent/:orderId/accept')
  @Roles(UserRoleEnum.AGENT)
  async acceptOrder(
    @Param('orderId') orderId: number,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<BuyFromStoreOrder>> {
    const agentId = req.user.agent.id;
    const updatedOrder = await this.buyFromStoreService.acceptOrder(orderId, agentId);
    return {
      success: true,
      message: 'BuyFromStore order accepted successfully.',
      data: updatedOrder,
    };
  }

  @Post('agent/:orderId/finalize')
  @Roles(UserRoleEnum.AGENT)
  async finalizeOrder(
    @Param('orderId') orderId: number,
    @Body() TFinalizeOrder: TFinalizeOrder,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<BuyFromStoreOrder>> {
    const agentId = req.user.agent.id;
    const finalizedOrder = await this.buyFromStoreService.finalizeOrder(orderId, agentId, TFinalizeOrder);
    return {
      success: true,
      message: 'BuyFromStore order finalized successfully.',
      data: finalizedOrder,
    };
  }

  @Post('agent/:orderId/deliver')
  @Roles(UserRoleEnum.AGENT)
  async markAsDelivered(
    @Param('orderId') orderId: number,
    @Body() TMarkAsDelivered: TMarkAsDelivered,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<BuyFromStoreOrder>> {
    const agentId = req.user.agent.id;
    const deliveredOrder = await this.buyFromStoreService.markAsDelivered(orderId, agentId, TMarkAsDelivered);
    return {
      success: true,
      message: 'BuyFromStore order marked as delivered successfully.',
      data: deliveredOrder,
    };
  }

  @Post('agent/:orderId/cancel')
  @Roles(UserRoleEnum.AGENT)
  async agentCancelOrder(
    @Param('orderId') orderId: number,
    @Body('reason') reason: string,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<BuyFromStoreOrder>> {
    const agentId = req.user.agent.id;
    const canceledOrder = await this.buyFromStoreService.agentCancelOrder(orderId, agentId, { reason });
    return {
      success: true,
      message: 'BuyFromStore order canceled successfully by agent.',
      data: canceledOrder,
    };
  }

  @Get('agent/orders')
  @Roles(UserRoleEnum.AGENT)
  async getAllAssignedOrders(
    @Query() query: any,
    @Req() req: ICustomRequest,
  ): Promise<IApiResponse<BuyFromStoreOrder[]>> {
    const agentId = req.user.agent.id;
    const orders = await this.buyFromStoreService.getAllAssignedOrders(agentId, query);
    return {
      success: true,
      message: 'Assigned BuyFromStore orders retrieved successfully.',
      data: orders,
    };
  }
}
