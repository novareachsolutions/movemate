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

  getClient(): Stripe {
    return this.stripe;
  }

  async constructEvent(payload: any, signature: string): Promise<Stripe.Event> {
    const endpointSecret = this.configService.get<string>(
      "STRIPE_WEBHOOK_SECRET",
    );
    try {
      return await this.stripe.webhooks.constructEvent(
        JSON.stringify(payload),
        signature,
        endpointSecret,
      );
    } catch (error) {
      logger.error(
        `StripeService.constructEvent: Error verifying webhook - ${error.message}`,
      );
      throw new InternalServerErrorException(
        "Invalid Stripe webhook signature",
      );
    }
  }
}
