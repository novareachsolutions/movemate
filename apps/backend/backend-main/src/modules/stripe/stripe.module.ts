import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { PaymentService } from "./payment.service";
import { StripeController } from "./stripe.controller";
import { StripeService } from "./stripe.service";
import { WalletService } from "./wallet.service";

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [StripeService, PaymentService, WalletService, JwtService],
  exports: [StripeService],
})
export class StripeModule {}
