import { Injectable } from "@nestjs/common";

import { Agent } from "../../entity/Agent";
import { logger } from "../../logger";
import { SubscripionStatusEnum } from "../../shared/enums";
import { dbRepo } from "../database/database.service";
import { StripeService } from "./stripe.service";

@Injectable()
export class RiderPaymentService {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * Process subscription payment for a rider.
   * In a real scenario, you'd create a PaymentIntent, have the rider pay from the app.
   */
  async subscribeRider(agentId: number, amount: number): Promise<string> {
    const agent = await dbRepo(Agent).findOneOrFail({ where: { id: agentId } });

    // In practice, you'd create a PaymentIntent similar to customers, but here we simulate:
    // Once paid, update subscription
    agent.subscriptionStatus = SubscripionStatusEnum.ACTIVE;
    agent.subscriptionExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ); // 1 week subscription
    await dbRepo(Agent).save(agent);

    logger.info(
      `RiderPaymentService.subscribeRider: Agent ${agentId} subscribed`,
    );
    return "Subscription activated";
  }

  /**
   * Process trip payments under the Commission model:
   * Deduct commission and add remaining to rider wallet.
   */
  async processTripPayment(
    agentId: number,
    totalAmount: number,
  ): Promise<void> {
    const agent = await dbRepo(Agent).findOneOrFail({ where: { id: agentId } });
    const commission = totalAmount * agent.commissionRate;
    const riderEarnings = totalAmount - commission;

    agent.walletBalance = Number(agent.walletBalance) + riderEarnings;
    await dbRepo(Agent).save(agent);

    logger.info(
      `RiderPaymentService.processTripPayment: Agent ${agentId} earned ${riderEarnings}, commission ${commission}`,
    );
  }

  /**
   * Handle rider withdrawals:
   * - Immediate withdrawal: Deduct express fee.
   * - Scheduled withdrawal: Transfer entire wallet balance.
   */
  async withdrawRiderFunds(
    agentId: number,
    immediate: boolean = false,
  ): Promise<void> {
    const agent = await dbRepo(Agent).findOneOrFail({ where: { id: agentId } });
    const amountToWithdraw = Number(agent.walletBalance);
    if (amountToWithdraw <= 0) return;

    let finalAmount = amountToWithdraw;
    if (immediate) {
      const expressFee = 5_00; // $5.00 in cents, example fee
      finalAmount -= expressFee;
    }

    // Transfer funds from platform to rider's bank account via Stripe Connect
    // For simplicity:
    await this.transferToRiderBankAccount(agent.stripeAccountId, finalAmount);

    agent.walletBalance = 0;
    await dbRepo(Agent).save(agent);

    logger.info(
      `RiderPaymentService.withdrawRiderFunds: Agent ${agentId} withdrew ${finalAmount}`,
    );
  }

  private async transferToRiderBankAccount(
    stripeAccountId: string,
    amountInCents: number,
  ): Promise<void> {
    // Use Stripe payout or transfers API
    // Example (not fully implemented):
    await this.stripeService.getClient().transfers.create({
      amount: amountInCents,
      currency: "usd",
      destination: stripeAccountId,
    });
  }
}
