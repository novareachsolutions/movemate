import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { CustomerModule } from './user/customer/customer.module';
import { AdminModule } from './user/admin/admin.module';
import { RiderModule } from './user/rider/rider.module';
import { RestaurantOwnerModule } from './user/restaurantowner/restaurantowner.module';
import { ShopOwnerModule } from './user/shopowner/shopowner.module';
import { OrderItemModule } from './order/orderitem/orderitem.module';
import { OrderFieldModule } from './order/orderfield/orderfield.module';

@Module({
  imports: [
    UserModule,
    OrderModule,
    CustomerModule,
    AdminModule,
    RiderModule,
    RestaurantOwnerModule,
    ShopOwnerModule,
    OrderItemModule,
    OrderFieldModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
