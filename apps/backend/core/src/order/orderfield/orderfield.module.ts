
import { Module } from '@nestjs/common';
import { OrderFieldService } from './orderfield.service';

@Module({
  providers: [OrderFieldService],
  exports: [OrderFieldService],
})
export class OrderFieldModule {}
