
import { Module } from '@nestjs/common';
import { ServiceTypeFieldService } from './servicetypefield.service';

@Module({
  providers: [ServiceTypeFieldService],
  exports: [ServiceTypeFieldService],
})
export class ServiceTypeFieldModule {}
