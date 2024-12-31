import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

import { logger } from "../../logger";

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("STRIPE_API_KEY");
    if (!apiKey) {
      logger.error("StripeService: Stripe API key is not configured");
      throw new InternalServerErrorException("Stripe API key is not set");
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: "2024-11-20.acacia",
    });
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    description?: string;
  }): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency,
        description: params.description,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(
        `StripeService.createPaymentIntent: Created payment intent ${paymentIntent.id}`,
      );
      return paymentIntent;
    } catch (error) {
      logger.error(
        `StripeService.createPaymentIntent: Failed to create payment intent`,
        error,
      );
      throw error;
    }
  }

  async handleWebhook(
    signature: string,
    rawBody: Buffer,
  ): Promise<Stripe.Event> {
    try {
      const webhookSecret = this.configService.get("STRIPE_WEBHOOK_SECRET");
      const event = await this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );

      logger.info(
        `StripeService.handleWebhook: Processed webhook event ${event.type}`,
      );
      return event;
    } catch (error) {
      logger.error(
        `StripeService.handleWebhook: Webhook verification failed`,
        error,
      );
      throw error;
    }
  }
}
