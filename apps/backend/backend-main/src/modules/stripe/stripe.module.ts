import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

// import { CustomerPaymentService } from "./customerPayment.service";
import { IssuingService } from "./issuing.service";
import { RiderPaymentService } from "./riderPayment.service";
import { StripeController } from "./stripe.controller";
import { StripeService } from "./stripe.service";

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [
    StripeService,
    // CustomerPaymentService,
    RiderPaymentService,
    IssuingService,
  ],
  exports: [
    StripeService,
    // CustomerPaymentService,
    RiderPaymentService,
    IssuingService,
  ],
})
export class StripeModule {}
