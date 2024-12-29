import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

import { User } from "../../entity/User";
import { logger } from "../../logger";
import {
  MissingStripeApiKeyException,
  StripeCustomerCreationException,
  StripePaymentIntentCreationException,
} from "../../shared/errors/stripe";
import { dbReadRepo } from "../database/database.service";

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("STRIPE_API_KEY");
    if (!apiKey) {
      logger.error("StripeService: Stripe API key is not configured");
      throw new MissingStripeApiKeyException();
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: "2024-12-18.acacia",
    });
  }

  /**
   * Creates a Stripe customer for the given user ID.
   * valiates whether user existsm or not, and then creates a Stripe customer.
   * @param userId The ID of the user to create a customer for.
   * @returns The created Stripe customer.
   */
  async createCustomer(userId: number): Promise<Stripe.Customer> {
    logger.debug(
      `StripeService.createCustomer: Creating customer for user ${userId}`,
    );

    const user = await dbReadRepo(User).findOne({ where: { id: userId } });
    if (!user) {
      throw new StripeCustomerCreationException("User not found");
    }

    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id.toString() },
      });
      return customer;
    } catch (error) {
      logger.error(
        `StripeService.createCustomer: Error creating customer for user ${userId}`,
        error,
      );
      throw new StripeCustomerCreationException(error.message);
    }
  }

  /**
   * Creates a Stripe payment intent for the given user ID, amount, currency, and description.
   * Validates whether user exists or not, and then creates a Stripe payment intent.
   * @param userId The ID of the user to create a payment intent for.
   * @param amount The amount of the payment in cents.
   * @param currency The three-letter currency code for the payment.
   * @param description The description of the payment.
   * @returns The created Stripe payment intent.
   */
  async createPaymentIntent(
    userId: number,
    amount: number,
    currency: string = "usd",
    description: string,
  ): Promise<Stripe.PaymentIntent> {
    logger.debug(
      `StripeService.createPaymentIntent: Creating payment intent for user ID ${userId}`,
    );

    const user = await dbReadRepo(User).findOneOrFail({
      where: { id: userId },
    });

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        description,
        metadata: {
          userId: user.id.toString(),
        },
      });
      logger.info(
        `StripeService.createPaymentIntent: Payment intent created with ID ${paymentIntent.id}`,
      );
      return paymentIntent;
    } catch (error) {
      logger.error(
        `StripeService.createPaymentIntent: Failed to create payment intent. Error: ${error}`,
      );
      throw new StripePaymentIntentCreationException(
        `Failed to create payment intent: ${error.message}`,
      );
    }
  }
}
