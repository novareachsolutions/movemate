import {
  Body,
  Controller,
  Headers,
  InternalServerErrorException,
  Post,
} from "@nestjs/common";
import Stripe from "stripe";

import { logger } from "../../logger";
import { CustomerPaymentService } from "./customerPayment.service";
import { RiderPaymentService } from "./riderPayment.service";
import { StripeService } from "./stripe.service";

@Controller("stripe")
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly customerPaymentService: CustomerPaymentService,
    private readonly riderPaymentService: RiderPaymentService,
  ) {}

  // CUSTOMER FLOWS
  @Post("send-package")
  async processSendPackage(
    @Body("userId") userId: number,
    @Body("orderId") orderId: number,
    @Body("amount") amount: number,
  ): Promise<{ success: boolean; paymentIntent: any }> {
    const paymentIntent =
      await this.customerPaymentService.processSendPackagePayment(
        userId,
        orderId,
        amount,
      );
    return { success: true, paymentIntent };
  }

  @Post("store-invoice-payment")
  async processStoreInvoicePayment(
    @Body("userId") userId: number,
    @Body("orderId") orderId: number,
    @Body("amount") amount: number,
  ): Promise<{ success: boolean; paymentIntent: Stripe.PaymentIntent }> {
    const paymentIntent =
      await this.customerPaymentService.processStoreInvoicePayment(
        userId,
        orderId,
        amount,
      );
    return { success: true, paymentIntent };
  }

  @Post("car-towing")
  async processCarTowingPayment(
    @Body("userId") userId: number,
    @Body("orderId") orderId: number,
    @Body("amount") amount: number,
  ): Promise<{ success: boolean; paymentIntent: Stripe.PaymentIntent }> {
    const paymentIntent =
      await this.customerPaymentService.processCarTowingPayment(
        userId,
        orderId,
        amount,
      );
    return { success: true, paymentIntent };
  }

  // RIDER FLOWS
  @Post("rider-subscription")
  async subscribeRider(
    @Body("agentId") agentId: number,
    @Body("amount") amount: number,
  ): Promise<{ success: boolean; message: string }> {
    const message = await this.riderPaymentService.subscribeRider(
      agentId,
      amount,
    );
    return { success: true, message };
  }

  @Post("rider-trip-payment")
  async payRiderPerTrip(
    @Body("agentId") agentId: number,
    @Body("amount") amount: number,
  ): Promise<{ success: boolean }> {
    await this.riderPaymentService.processTripPayment(agentId, amount);
    return { success: true };
  }

  @Post("rider-withdraw")
  async riderWithdraw(
    @Body("agentId") agentId: number,
    @Body("immediate") immediate: boolean,
  ): Promise<{ success: boolean }> {
    await this.riderPaymentService.withdrawRiderFunds(agentId, immediate);
    return { success: true };
  }

  // STRIPE WEBHOOK
  @Post("webhook")
  async handleWebhook(
    @Body() eventBody: any,
    @Headers("stripe-signature") signature: string,
  ): Promise<{ received: boolean }> {
    let event: Stripe.Event;
    try {
      event = await this.stripeService.constructEvent(eventBody, signature);
    } catch (err) {
      logger.error(
        `StripeController.handleWebhook: Invalid signature - ${err.message}`,
      );
      throw new InternalServerErrorException(
        "Invalid Stripe webhook signature",
      );
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        await this.customerPaymentService.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case "payment_intent.payment_failed":
        await this.customerPaymentService.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      // Additional event types as needed
      default:
        logger.debug(
          `StripeController.handleWebhook: Received unhandled event type ${event.type}`,
        );
    }

    return { received: true };
  }
}
