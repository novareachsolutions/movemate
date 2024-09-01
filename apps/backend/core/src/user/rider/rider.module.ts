
import { Module } from '@nestjs/common';
import { RiderService } from './rider.service';

@Module({
  providers: [RiderService],
  exports: [RiderService],
})
export class RiderModule {}
