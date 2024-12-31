import {
  Controller,
  Headers,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from "@nestjs/common";
import { Request } from "express";

import { PaymentService } from "./payment.service";
import { StripeService } from "./stripe.service";

@Controller("stripe")
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post("webhook")
  async handleWebhook(
    @Headers("stripe-signature") signature: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    try {
      const event = await this.stripeService.handleWebhook(
        signature,
        request.rawBody,
      );

      switch (event.type) {
        case "payment_intent.succeeded":
          await this.paymentService.handlePaymentSuccess(event);
          break;
        case "payment_intent.payment_failed":
          await this.paymentService.handlePaymentFailure(event);
          break;
      }

      return { received: true };
    } catch (err) {
      this.logger.error("Error processing webhook:", err);
      throw err;
    }
  }
}
