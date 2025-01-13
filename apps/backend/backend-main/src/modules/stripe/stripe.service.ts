import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

import { Agent } from "../../entity/Agent";
import { logger } from "../../logger";
import { MissingStripeApiKeyException } from "../../shared/errors/stripe";
import {
  TConnectAccountRequest,
  TCreateSubscriptionRequest,
  TCreateVirtualCardRequest,
} from "../../shared/types/payment.types";
import { dbReadRepo, dbRepo } from "../database/database.service";

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
   * This function creates a payment intent using the Stripe API with optional transfer
   * data.
   * @param params - The `createPaymentIntent` function is an asynchronous function that creates a
   * payment intent using the provided parameters. The parameters include:
   * @returns The `createPaymentIntent` function returns a Promise that resolves to a
   * `Stripe.PaymentIntent` object.
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    description?: string;
    transfer_data?: {
      destination: string;
      amount: number;
    };
  }): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(params.amount * 100),
        currency: params.currency,
        description: params.description,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (params.transfer_data) {
        paymentIntentParams.transfer_data = params.transfer_data;
      }

      const paymentIntent =
        await this.stripe.paymentIntents.create(paymentIntentParams);

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

  /**
   * The function `createConnectedAccount` creates a Stripe Connect account for an agent and returns
   * the account ID and a link for onboarding.
   * @param {TConnectAccountRequest} data - The `createConnectedAccount` function takes in a parameter
   * `data` of type `TConnectAccountRequest`. This parameter likely contains information needed to
   * create a connected account, such as `agentId`, `email`, and `businessType`. The function then uses
   * this data to create a Stripe Connect account
   * @returns The function `createConnectedAccount` returns a Promise that resolves to an object with
   * two properties:
   * 1. `accountId`: a string representing the ID of the created Stripe Connect account.
   * 2. `accountLink`: a string representing the URL for the account onboarding link associated with
   * the created account.
   */
  async createConnectedAccount(data: TConnectAccountRequest): Promise<{
    accountId: string;
    accountLink: string;
  }> {
    try {
      const agent = await dbReadRepo(Agent).findOne({
        where: { id: data.agentId },
      });

      if (!agent) {
        logger.error(
          `StripeService.createConnectedAccount: Agent ${data.agentId} not found`,
        );
        throw new NotFoundException("Agent not found");
      }

      // Create Stripe Connect account
      const account = await this.stripe.accounts.create({
        type: "express",
        country: "AU",
        email: data.email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: data.businessType || "individual",
      });

      // Update agent with Stripe account ID
      await dbRepo(Agent).update(agent.id, {
        stripeAccountId: account.id,
      });

      // Create account link for onboarding
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${this.configService.get("APP_URL")}/stripe/refresh-account-link`,
        return_url: `${this.configService.get("APP_URL")}/stripe/return-account-link`,
        type: "account_onboarding",
      });

      logger.info(
        `StripeService.createConnectedAccount: Created account ${account.id} for agent ${agent.id}`,
      );

      return {
        accountId: account.id,
        accountLink: accountLink.url,
      };
    } catch (error) {
      logger.error(
        `StripeService.createConnectedAccount: Failed to create connected account`,
        error,
      );
      throw error;
    }
  }

  /**
   * The function `createAccountLink` generates a Stripe account link for a given agent ID and returns
   * the link URL along with its expiration time. This way the agent can complete the onboarding process
   * with Stripe by clicking on the link.
   * @param {number} agentId - The `agentId` parameter is the unique identifier of the agent for whom
   * we want to create a Stripe account link. This ID is used to retrieve the agent's information from
   * the database and generate a unique account link for them to complete the onboarding process with
   * Stripe.
   * @returns The `createAccountLink` function returns a Promise that resolves to an object with two
   * properties: `url` and `expiresAt`. The `url` property contains the URL for the account link
   * created, and the `expiresAt` property contains the expiration time for the link in ISO string
   * format, which is set to 30 minutes from the current time.
   */
  async createAccountLink(agentId: number): Promise<{
    url: string;
    expiresAt: string;
  }> {
    try {
      const agent = await dbReadRepo(Agent).findOne({
        where: { id: agentId },
      });

      if (!agent?.stripeAccountId) {
        logger.error(
          `StripeService.createAccountLink: No Stripe account found for agent ${agentId}`,
        );
        throw new NotFoundException("No Stripe account found for agent");
      }

      const accountLink = await this.stripe.accountLinks.create({
        account: agent.stripeAccountId,
        refresh_url: `${this.configService.get("APP_URL")}/stripe/refresh-account-link`, // TODO: Replace with the actual Frontend URL
        return_url: `${this.configService.get("APP_URL")}/stripe/return-account-link`, // TODO: Replace with the actual Frontend URL
        type: "account_onboarding",
      });

      logger.info(
        `StripeService.createAccountLink: Created account link for agent ${agentId}`,
      );

      return {
        url: accountLink.url,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      };
    } catch (error) {
      logger.error(
        `StripeService.createAccountLink: Failed to create account link`,
        error,
      );
      throw error;
    }
  }

  /**
   * This function creates a virtual card using Stripe API with specified spending controls
   * and returns the card details and amount for the customer.
   * @param {TCreateVirtualCardRequest} data - The `createVirtualCard` function takes in a parameter
   * `data` of type `TCreateVirtualCardRequest`. This parameter likely contains information needed to
   * create a virtual card, such as the amount, currency, and any other necessary details for the card
   * creation process.
   * @returns The `createVirtualCard` function returns a Promise that resolves to an object with the
   * following properties:
   * - `cardDetails`: An object containing details of the virtual card created, including the last 4
   * digits (`last4`), expiry month (`expiryMonth`), and expiry year (`expiryYear`).
   * - `amount`: The amount associated with the virtual card, which is obtained from the `data
   */
  async createVirtualCard(data: TCreateVirtualCardRequest): Promise<{
    cardDetails: any;
    amount: number;
  }> {
    try {
      const card = await this.stripe.issuing.cards.create({
        type: "virtual",
        currency: "aud",
        spending_controls: {
          spending_limits: [
            {
              amount: Math.round(data.amount * 100),
              interval: "per_authorization",
            },
          ],
        },
      });

      logger.info(
        `StripeService.createVirtualCard: Created virtual card for order ${data.orderId}`,
      );

      return {
        cardDetails: {
          last4: card.last4,
          expiryMonth: card.exp_month,
          expiryYear: card.exp_year,
        },
        amount: data.amount,
      };
    } catch (error) {
      logger.error(
        `StripeService.createVirtualCard: Failed to create virtual card`,
        error,
      );
      throw error;
    }
  }

  /**
   * The function `createSubscription` creates a subscription for a given agent using the
   * Stripe API.
   * @param {TCreateSubscriptionRequest} data - The `createSubscription` function you provided is an
   * asynchronous function that creates a subscription for a given agent using the Stripe API. Here's a
   * breakdown of the function:
   * @returns The `createSubscription` function returns a Promise that resolves to an object with two
   * properties:
   * 1. `clientSecret`: a string representing the client secret of the latest payment intent associated
   * with the subscription.
   * 2. `subscriptionId`: a string representing the ID of the created subscription.
   */
  async createSubscription(data: TCreateSubscriptionRequest): Promise<{
    clientSecret: string;
    subscriptionId: string;
  }> {
    const intervalMap = {
      daily: "day",
      weekly: "week",
      monthly: "month",
      yearly: "year",
    };

    try {
      const agent = await dbReadRepo(Agent).findOne({
        where: { id: data.agentId },
      });

      if (!agent?.stripeAccountId) {
        logger.error(
          `StripeService.createSubscription: No Stripe account found for agent ${data.agentId}`,
        );
        throw new NotFoundException("No Stripe account found for agent");
      }

      // Create product if it doesn't exist
      const product = await this.stripe.products.create({
        name: `${data.plan} Subscription`,
      });

      // Create price
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(data.amount * 100),
        currency: "aud",
        recurring: {
          interval: intervalMap[data.plan.toLowerCase()],
        },
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: agent.stripeAccountId,
        items: [{ price: price.id }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });

      logger.info(
        `StripeService.createSubscription: Created subscription for agent ${agent.id}`,
      );

      return {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any).payment_intent
          .client_secret,
      };
    } catch (error) {
      logger.error(
        `StripeService.createSubscription: Failed to create subscription`,
        error,
      );
      throw error;
    }
  }

  /**
   * The function `createTransfer` creates a transfer using the Stripe API with specified
   * amount, destination, and optional instant payout option.
   * @param params - The `createTransfer` function takes in an object `params` with the following
   * properties:
   * @returns The `createTransfer` function returns a Promise that resolves with a `Stripe.Transfer`
   * object once the transfer creation process is completed.
   */
  async createTransfer(params: {
    amount: number;
    destination: string;
    isExpress: boolean;
  }): Promise<Stripe.Transfer> {
    try {
      const transferParams: Stripe.TransferCreateParams = {
        amount: Math.round(params.amount * 100),
        currency: "aud",
        destination: params.destination,
      };

      if (params.isExpress) {
        // Add instant payout options for express transfers
        transferParams.metadata = {
          instant: "true",
        };
      }

      const transfer = await this.stripe.transfers.create(transferParams);

      logger.info(
        `StripeService.createTransfer: Created transfer ${transfer.id} to ${params.destination}`,
      );
      return transfer;
    } catch (error) {
      logger.error(
        `StripeService.createTransfer: Failed to create transfer to ${params.destination}`,
        error,
      );
      throw error;
    }
  }

  /**
   * The `handleWebhook` function handles Stripe webhook events by verifying the
   * signature and returning the event.
   * @param {string} signature - The `signature` parameter in the `handleWebhook` function is typically
   * a string that represents the signature of the webhook payload. This signature is used for
   * verifying the authenticity and integrity of the webhook data to ensure that it was sent by the
   * expected source and has not been tampered with during transit.
   * @param {Buffer} rawBody - The `rawBody` parameter in the `handleWebhook` function represents the
   * raw request body of the incoming webhook event. This is the data that Stripe sends to your webhook
   * endpoint when an event occurs, and it typically contains information about the event that
   * triggered the webhook.
   * @returns The `handleWebhook` function is returning a Promise that resolves to a `Stripe.Event`
   * object.
   */
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
