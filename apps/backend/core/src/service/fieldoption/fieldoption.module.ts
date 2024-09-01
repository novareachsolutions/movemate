
import { Module } from '@nestjs/common';
import { FieldOptionService } from './fieldoption.service';

@Module({
  providers: [FieldOptionService],
  exports: [FieldOptionService],
})
export class FieldOptionModule {}
