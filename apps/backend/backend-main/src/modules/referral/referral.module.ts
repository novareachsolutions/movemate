import { Module } from "@nestjs/common";

import { ReferralService } from "./referral.service";

@Module({
  imports: [],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
