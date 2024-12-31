import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

import { Agent } from "../../entity/Agent";
import { logger } from "../../logger";
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
      throw new InternalServerErrorException("Stripe API key is not set");
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: "2024-12-18.acacia",
    });
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    description?: string;
  }): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100),
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
        country: data.country,
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
        refresh_url: `${this.configService.get("APP_URL")}/stripe/refresh-account-link`,
        return_url: `${this.configService.get("APP_URL")}/stripe/return-account-link`,
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
