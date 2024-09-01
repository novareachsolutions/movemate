
import { Module } from '@nestjs/common';
import { OrderItemService } from './orderitem.service';

@Module({
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
