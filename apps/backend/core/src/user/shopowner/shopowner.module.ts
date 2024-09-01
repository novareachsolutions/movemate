
import { Module } from '@nestjs/common';
import { ShopOwnerService } from './shopowner.service';

@Module({
  providers: [ShopOwnerService],
  exports: [ShopOwnerService],
})
export class ShopOwnerModule {}
