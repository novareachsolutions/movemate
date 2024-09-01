
import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';

@Module({
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
