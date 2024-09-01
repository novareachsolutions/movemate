
import { Module } from '@nestjs/common';
import { ServiceTypeVersionService } from './servicetypeversion.service';

@Module({
  providers: [ServiceTypeVersionService],
  exports: [ServiceTypeVersionService],
})
export class ServiceTypeVersionModule {}
