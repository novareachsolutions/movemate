import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { StripeController } from "./stripe.controller";
import { StripeService } from "./stripe.service";

@Module({
  controllers: [StripeController],
  providers: [StripeService, JwtService],
})
export class StripeModule {}
