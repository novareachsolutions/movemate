import { Injectable, NotFoundException } from "@nestjs/common";
import Stripe from "stripe";

import { Agent } from "../../entity/Agent";
import { Payment } from "../../entity/Payment";
import { SendPackageOrder } from "../../entity/SendPackageOrder";
import { OrderStatusEnum, PaymentStatusEnum } from "../../shared/enums";
import {
  TCreateOrderRequest,
  TOrderResponse,
} from "../../shared/types/payment.types";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { StripeService } from "./stripe.service";

@Injectable()
export class PaymentService {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * The function `createOrder` processes an order, calculates commission if an agent is involved,
   * creates a payment intent, and saves payment details in the database.
   * @param {TCreateOrderRequest} orderData - The `orderData` parameter in the `createOrder` function
   * represents the data needed to create a new order. It likely includes information such as the order
   * ID, amount, currency, and any other relevant details for processing the order.
   * @returns The `createOrder` function returns a Promise that resolves to a `TOrderResponse` object.
   * The `TOrderResponse` object contains the following properties:
   */
  async createOrder(orderData: TCreateOrderRequest): Promise<TOrderResponse> {
    const order = await dbReadRepo(SendPackageOrder).findOne({
      where: { id: orderData.orderId },
      relations: ["agent"],
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Calculate commission if agent exists
    let transferAmount = orderData.amount;
    if (order.agent) {
      const commission = orderData.amount * order.agent.commissionRate;
      transferAmount = orderData.amount - commission;
    }

    // Create payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: orderData.amount,
      currency: orderData.currency,
      description: `Payment for order #${order.id}`,
      transfer_data: order.agent
        ? {
            destination: order.agent.stripeAccountId,
            amount: Math.round(transferAmount * 100),
          }
        : undefined,
    });

    // Create payment record
    await dbRepo(Payment).save({
      order,
      amount: orderData.amount,
      currency: orderData.currency,
      stripePaymentIntentId: paymentIntent.id,
      status: PaymentStatusEnum.PENDING,
      commission: order.agent
        ? orderData.amount * order.agent.commissionRate
        : 0,
    });

    return {
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * The function `handlePaymentSuccess` updates payment and order statuses, and agent wallet balance
   * if applicable, based on a successful payment with a given payment intent ID. Used in the stripe
   * webhook handler.
   * @param {string} paymentIntentId - The `paymentIntentId` parameter is a string that represents the
   * unique identifier of a payment intent in the Stripe payment system. This function
   * `handlePaymentSuccess` is designed to handle the successful completion of a payment process by
   * updating the payment and order statuses in the database. It also updates the agent's
   */
  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    const payment = await dbReadRepo(Payment).findOne({
      where: { stripePaymentIntentId: paymentIntentId },
      relations: ["order", "order.agent"],
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    // Update payment status
    await dbRepo(Payment).update(payment.id, {
      status: PaymentStatusEnum.PAID,
    });

    // Update order status
    await dbRepo(SendPackageOrder).update(payment.order.id, {
      paymentStatus: PaymentStatusEnum.PAID,
      status: OrderStatusEnum.PENDING,
    });

    // Update agent wallet if exists
    if (payment.order.agent) {
      const transferAmount = payment.amount - payment.commissionAmount;
      await dbRepo(Agent).update(payment.order.agent.id, {
        walletBalance: () => `wallet_balance + ${transferAmount}`,
      });
    }
  }

  /**
   * The function `handleTransferCreated` updates the wallet balance of an agent and changes the status
   * of a payment to PAID based on a Stripe transfer. Used in the stripe webhook handler.
   * @param transfer - The `transfer` parameter in the `handleTransferCreated` function represents a
   * Stripe transfer object. This object contains information about a transfer of funds from a Stripe
   * account to a connected bank account or debit card.
   */
  async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
    const payment = await dbReadRepo(Payment).findOne({
      where: { stripeTransferId: transfer.id },
      relations: ["order", "order.agent"],
    });

    if (payment && payment.order.agent) {
      await dbRepo(Agent).update(payment.order.agent.id, {
        walletBalance: () => `wallet_balance + ${transfer.amount / 100}`,
      });

      await dbRepo(Payment).update(payment.id, {
        status: PaymentStatusEnum.PAID,
      });
    }
  }
}
