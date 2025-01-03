import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import Stripe from "stripe";

import { AuthGuard } from "../../shared/guards/auth.guard";
import { RoleGuard } from "../../shared/guards/roles.guard";
import { IApiResponse } from "../../shared/interface";
import { StripeService } from "./stripe.service";

@Controller("stripe")
@UseGuards(AuthGuard, RoleGuard)
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * Creates a Stripe Customer for a given user.
   * @param userId The ID of the user to create the customer for.
   * @returns The created Stripe Customer.
   */
  @Post("customer")
  async createCustomer(
    @Body("userId") userId: number,
  ): Promise<IApiResponse<Stripe.Customer>> {
    const customer = await this.stripeService.createCustomer(userId);
    return {
      success: true,
      data: customer,
      message: "Customer created successfully",
    };
  }

  /**
   * Creates a Stripe Payment Intent for a given user.
   * @param userId The ID of the user to create the payment intent for.
   * @param amount The amount to charge, in the currency's smallest unit (e.g. 100 cents to charge $1.00).
   * @param currency The 3-character currency code (ISO 4217) for the payment intent.
   * @param description A human-readable description of the payment intent.
   * @returns The created Stripe Payment Intent.
   */
  @Post("payment-intent")
  async createPaymentIntent(
    @Body("userId") userId: number,
    @Body("amount") amount: number,
    @Body("currency") currency: string,
    @Body("description") description: string,
  ): Promise<IApiResponse<Stripe.PaymentIntent>> {
    const paymentIntent = await this.stripeService.createPaymentIntent(
      userId,
      amount,
      currency,
      description,
    );
    return {
      success: true,
      data: paymentIntent,
      message: "Payment intent created successfully",
    };
  }
}
