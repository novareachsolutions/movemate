import { Injectable, NotFoundException } from "@nestjs/common";

import { Payment } from "../../entity/Payment";
import { SendPackageOrder } from "../../entity/SendPackageOrder";
import { logger } from "../../logger";
import { PaymentStatusEnum } from "../../shared/enums";
import {
  TCreatePaymentIntent,
  TPayment,
} from "../../shared/types/payment.types";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { StripeService } from "../stripe/stripe.service";
import { WalletService } from "./wallet.service";

@Injectable()
export class PaymentService {
  constructor(
    private stripeService: StripeService,
    private walletService: WalletService,
  ) {}

  async createPaymentIntent(data: TCreatePaymentIntent): Promise<Payment> {
    if (data.orderId) {
      const order = await dbReadRepo(SendPackageOrder).findOne({
        where: { id: data.orderId },
      });
      if (!order) {
        logger.error(
          `PaymentService.createPaymentIntent: Order ${data.orderId} not found`,
        );
        throw new NotFoundException("Order not found");
      }
    }

    // Create Stripe Payment Intent
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: data.amount,
      currency: "aud",
      description: data.description || `Payment for ${data.type}`,
    });

    // Create payment record
    const payment: TPayment = {
      stripePaymentIntentId: paymentIntent.id,
      type: data.type,
      amount: data.amount,
      orderId: data.orderId,
      agentId: data.agentId,
      status: PaymentStatusEnum.PENDING,
    };

    const response = await dbRepo(Payment).save(payment);
    logger.info(
      `PaymentService.createPaymentIntent: Created payment ${response.id}`,
    );
    return response;
  }

  async handlePaymentSuccess(stripeEvent: any): Promise<void> {
    const paymentIntentId = stripeEvent.data.object.id;
    const payment = await dbReadRepo(Payment).findOne({
      where: { stripePaymentIntentId: paymentIntentId },
      relations: ["order", "agent"],
    });

    if (!payment) {
      logger.error(
        `PaymentService.handlePaymentSuccess: Payment with intent ${paymentIntentId} not found`,
      );
      throw new NotFoundException("Payment not found");
    }

    // Update payment status
    await dbRepo(Payment).update(payment.id, {
      status: PaymentStatusEnum.PAID,
    });

    // Update order payment status if exists
    if (payment.orderId) {
      await dbRepo(SendPackageOrder).update(payment.orderId, {
        paymentStatus: PaymentStatusEnum.PAID,
      });
    }

    // Handle rider earnings if applicable
    if (payment.agent && payment.order) {
      const commission = payment.amount * payment.agent.commissionRate;
      const netAmount = payment.amount - commission;

      await dbRepo(Payment).update(payment.id, {
        commissionAmount: commission,
      });

      await this.walletService.creditWallet(payment.agent.id, netAmount, {
        reference: `Earnings from order #${payment.order.id}`,
        paymentId: payment.id,
      });

      logger.info(
        `PaymentService.handlePaymentSuccess: Credited ${netAmount} to agent ${payment.agent.id}`,
      );
    }
  }

  async handlePaymentFailure(stripeEvent: any): Promise<void> {
    const paymentIntentId = stripeEvent.data.object.id;
    const payment = await dbReadRepo(Payment).findOne({
      where: { stripePaymentIntentId: paymentIntentId },
      relations: ["order"],
    });

    if (!payment) {
      logger.error(
        `PaymentService.handlePaymentFailure: Payment with intent ${paymentIntentId} not found`,
      );
      throw new NotFoundException("Payment not found");
    }

    // Update payment status
    await dbRepo(Payment).update(payment.id, {
      status: PaymentStatusEnum.ERROR,
      failureReason: stripeEvent.data.object.last_payment_error?.message,
    });

    // Update order payment status if exists
    if (payment.orderId) {
      await dbRepo(SendPackageOrder).update(payment.orderId, {
        paymentStatus: PaymentStatusEnum.ERROR,
      });
    }

    logger.error(
      `PaymentService.handlePaymentFailure: Payment ${payment.id} failed`,
    );
  }
}
