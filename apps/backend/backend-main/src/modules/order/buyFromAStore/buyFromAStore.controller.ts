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
import { TBuyFromStoreOrder } from '../buyFromStore.types';
import { BuyFromStoreService } from './buyFromAStore.service';
  
  @Controller('buyfromstoreorders')
  @UseGuards(AuthGuard) 
  export class BuyFromStoreController {
    constructor(private readonly buyFromStoreService: BuyFromStoreService) {}
  
    /**
     * Create a new BuyFromStore order
     */
    @Post()
    async createOrder(@Body() data: TBuyFromStoreOrder, @Req() req: ICustomRequest) {
      const customerId = req.user.id;
      return this.buyFromStoreService.createOrder(data, customerId);
    }
  
    /**
     * Cancel an existing BuyFromStore order
     */
    @Delete(':id')
    async cancelOrder(
      @Param('id') orderId: number,
      @Body('reason') reason: string,
      @Req() req: Request,
    ) {
      const customerId = req.user.id;
      return this.buyFromStoreService.cancelOrder(orderId, reason, customerId);
    }
  
    /**
     * Leave a review for a completed BuyFromStore order
     */
    @Post(':id/reviews')
    async leaveReview(
      @Param('id') orderId: number,
      @Body('rating') rating: number,
      @Body('comment') comment: string,
      @Req() req: Request,
    ) {
      const customerId = req.user.id;
      return this.buyFromStoreService.leaveReview(orderId, rating, comment, customerId);
    }
  
    /**
     * Create a report for a BuyFromStore order
     */
    @Post(':id/reports')
    async createReport(
      @Param('id') orderId: number,
      @Body('reason') reason: string,
      @Body('details') details: string,
      @Req() req: Request,
    ) {
      const customerId = req.user.id;
      return this.buyFromStoreService.createReport(orderId, reason, details, customerId);
    }
  
    /**
     * Get details of a specific BuyFromStore order
     */
    @Get(':id')
    async getOrderDetails(@Param('id') orderId: number, @Req() req: Request) {
      const customerId = req.user.id;
      return this.buyFromStoreService.getOrderDetails(orderId, customerId);
    }
  
    /**
     * Get all BuyFromStore orders for the authenticated customer
     */
    @Get()
    async getAllOrders(@Query() query: any, @Req() req: Request) {
      const customerId = req.user.id;
      return this.buyFromStoreService.getAllOrders(customerId, query);
    }
  }
  