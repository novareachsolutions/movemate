
import { Module } from '@nestjs/common';
import { PricingRuleService } from './pricingrule.service';

@Module({
  providers: [PricingRuleService],
  exports: [PricingRuleService],
})
export class PricingRuleModule {}
