
import { Module } from '@nestjs/common';
import { RestaurantOwnerService } from './restaurantowner.service';

@Module({
  providers: [RestaurantOwnerService],
  exports: [RestaurantOwnerService],
})
export class RestaurantOwnerModule {}
