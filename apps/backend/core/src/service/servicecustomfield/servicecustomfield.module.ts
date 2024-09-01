
import { Module } from '@nestjs/common';
import { ServiceCustomFieldService } from './servicecustomfield.service';

@Module({
  providers: [ServiceCustomFieldService],
  exports: [ServiceCustomFieldService],
})
export class ServiceCustomFieldModule {}
