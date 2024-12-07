import { Injectable, InternalServerErrorException } from "@nestjs/common";
import Stripe from "stripe";

import { Order } from "../../entity/Order";
import { User } from "../../entity/User";
import { logger } from "../../logger";
import { OrderStatusEnum } from "../../shared/enums";
import { dbRepo } from "../database/database.service";
import { StripeService } from "./stripe.service";

@Injectable()
export class CustomerPaymentService {
  constructor(private readonly stripeService: StripeService) {}

  async ensureCustomer(userId: number): Promise<User> {
    const user = await dbRepo(User).findOneOrFail({ where: { id: userId } });
    if (!user.stripeCustomerId) {
      // Create a Stripe Customer
      const customer = await this.stripeService.getClient().customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phoneNumber,
        metadata: { userId: user.id.toString() },
      });
      user.stripeCustomerId = customer.id;
      await dbRepo(User).save(user);
    }
    return user;
  }

  async createPaymentIntent(
    userId: number,
    amount: number,
    currency: string,
    description: string,
  ): Promise<Stripe.PaymentIntent> {
    const user = await this.ensureCustomer(userId);
    try {
      const paymentIntent = await this.stripeService
        .getClient()
        .paymentIntents.create({
          amount,
          currency,
          description,
          customer: user.stripeCustomerId,
          metadata: { userId: user.id.toString() },
        });
      logger.info(
        `CustomerPaymentService.createPaymentIntent: Payment intent ${paymentIntent.id} created`,
      );
      return paymentIntent;
    } catch (error) {
      logger.error(
        `CustomerPaymentService.createPaymentIntent: Failed - ${error.message}`,
      );
      throw new InternalServerErrorException("Failed to create payment intent");
    }
  }

  /**
   * Send a Package flow - upfront payment
   */
  async processSendPackagePayment(
    userId: number,
    orderId: number,
    amount: number,
  ): Promise<Stripe.PaymentIntent> {
    const order = await dbRepo(Order).findOneOrFail({ where: { id: orderId } });
    const paymentIntent = await this.createPaymentIntent(
      userId,
      amount,
      "usd",
      "Send a Package Service",
    );
    order.stripePaymentIntentId = paymentIntent.id;
    order.paymentStatus = "requires_confirmation";
    await dbRepo(Order).save(order);
    return paymentIntent;
  }

  /**
   * Buy from a Store flow - second payment (invoice)
   */
  async processStoreInvoicePayment(
    userId: number,
    orderId: number,
    amount: number,
  ): Promise<Stripe.PaymentIntent> {
    const order = await dbRepo(Order).findOneOrFail({ where: { id: orderId } });
    const paymentIntent = await this.createPaymentIntent(
      userId,
      amount,
      "usd",
      "Store Invoice Payment",
    );
    order.stripeInvoicePaymentIntentId = paymentIntent.id;
    order.paymentStatus = "awaiting_invoice_payment";
    await dbRepo(Order).save(order);
    return paymentIntent;
  }

  /**
   * Car Towing flow - upfront payment
   */
  async processCarTowingPayment(
    userId: number,
    orderId: number,
    amount: number,
  ): Promise<Stripe.PaymentIntent> {
    const order = await dbRepo(Order).findOneOrFail({ where: { id: orderId } });
    const paymentIntent = await this.createPaymentIntent(
      userId,
      amount,
      "usd",
      "Car Towing Service",
    );
    order.stripePaymentIntentId = paymentIntent.id;
    order.paymentStatus = "requires_confirmation";
    await dbRepo(Order).save(order);
    return paymentIntent;
  }

  /**
   * Handle PaymentIntent succeeded events for customer flows
   */
  async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const order = await dbRepo(Order).findOne({
      where: [
        { stripePaymentIntentId: paymentIntent.id },
        { stripeInvoicePaymentIntentId: paymentIntent.id },
      ],
    });

    if (!order) {
      logger.warn(
        `CustomerPaymentService.handlePaymentIntentSucceeded: No order found for ${paymentIntent.id}`,
      );
      return;
    }

    if (order.stripePaymentIntentId === paymentIntent.id) {
      // First payment succeeded
      order.status = OrderStatusEnum.IN_PROGRESS; // order now in progress
      order.paymentStatus = "succeeded";
      await dbRepo(Order).save(order);
      // Assign rider or next steps...
    } else if (order.stripeInvoicePaymentIntentId === paymentIntent.id) {
      // Invoice payment succeeded
      // Will rely on IssuingService (handled externally)
      order.status = OrderStatusEnum.COMPLETED;
      order.paymentStatus = "invoice_paid";
      await dbRepo(Order).save(order);
    }

    logger.info(
      `CustomerPaymentService.handlePaymentIntentSucceeded: Order ${order.id} updated`,
    );
  }

  async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const order = await dbRepo(Order).findOne({
      where: [
        { stripePaymentIntentId: paymentIntent.id },
        { stripeInvoicePaymentIntentId: paymentIntent.id },
      ],
    });

    if (!order) {
      logger.warn(
        `CustomerPaymentService.handlePaymentIntentFailed: No order found for ${paymentIntent.id}`,
      );
      return;
    }

    order.paymentStatus = "failed";
    order.status = OrderStatusEnum.CANCELED;
    await dbRepo(Order).save(order);

    // Notify customer, add to refunds, etc.
    logger.info(
      `CustomerPaymentService.handlePaymentIntentFailed: Order ${order.id} payment failed`,
    );
  }
}
