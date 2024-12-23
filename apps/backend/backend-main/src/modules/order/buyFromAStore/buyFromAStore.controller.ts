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
import { Request } from 'express';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { ICustomRequest } from '../../../shared/interface';
import { TBuyFromStoreOrder } from './buyFromStore.types';
import { BuyFromStoreService } from './buyFromAStore.service';
import { UserRoleEnum } from '../../../shared/enums';
import { Roles } from '../../../shared/decorators/roles.decorator';

@Controller('buyfromstoreorders')
@UseGuards(AuthGuard)
export class BuyFromStoreController {
  constructor(private readonly buyFromStoreService: BuyFromStoreService) { }


  @Post()
  @Roles(UserRoleEnum.CUSTOMER)
  async createOrder(@Body() data: TBuyFromStoreOrder, @Req() req: ICustomRequest) {
    const customerId = req.user.id;
    return this.buyFromStoreService.createOrder(data, customerId);
  }

  @Delete(':id')
  @Roles(UserRoleEnum.CUSTOMER)
  async cancelOrder(
    @Param('id') orderId: number,
    @Body('reason') reason: string,
    @Req() req: ICustomRequest,
  ) {
    const customerId = req.user.id;
    return this.buyFromStoreService.cancelOrder(orderId, reason, customerId);
  }

  @Post(':id/reviews')
  @Roles(UserRoleEnum.CUSTOMER)
  async leaveReview(
    @Param('id') orderId: number,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
    @Req() req: ICustomRequest,
  ) {
    const customerId = req.user.id;
    return this.buyFromStoreService.leaveReview(orderId, rating, comment, customerId);
  }

  @Get(':id')
  @Roles(UserRoleEnum.CUSTOMER)
  async getOrderDetails(@Param('id') orderId: number, @Req() req: ICustomRequest) {
    const customerId = req.user.id;
    return this.buyFromStoreService.getOrderDetails(orderId, customerId);
  }

  @Get()
  @Roles(UserRoleEnum.CUSTOMER)
  async getAllOrders(@Query() query: any, @Req() req: ICustomRequest) {
    const customerId = req.user.id;
    return this.buyFromStoreService.getAllOrders(customerId, query);
  }
}
