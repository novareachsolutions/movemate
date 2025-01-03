import { Module } from "@nestjs/common";

import { PricingController } from "./pricing.controller";
import { PricingService } from "./pricing.service";

@Module({
  providers: [PricingService],
  controllers: [PricingController],
  exports: [PricingService],
})
export class PricingModule {}
