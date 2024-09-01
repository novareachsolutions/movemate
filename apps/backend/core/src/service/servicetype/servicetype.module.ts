
import { Module } from '@nestjs/common';
import { ServiceTypeService } from './servicetype.service';

@Module({
  providers: [ServiceTypeService],
  exports: [ServiceTypeService],
})
export class ServiceTypeModule {}
