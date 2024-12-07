import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

import { Agent } from "../../entity/Agent";
import { logger } from "../../logger";
import { dbRepo } from "../database/database.service";
import { StripeService } from "./stripe.service";

@Injectable()
export class IssuingService {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * Create a virtual card for the rider via Stripe Issuing.
   * This is a placeholder function.
   */
  async createVirtualCard(agentId: number): Promise<string> {
    const agent = await dbRepo(Agent).findOneOrFail({ where: { id: agentId } });
    // Call Stripe Issuing APIs to create a card
    // Example:
    const cardholder = await this.createCardholder(agentId);
    const card = await this.stripeService.getClient().issuing.cards.create({
      cardholder: cardholder.id,
      currency: "usd",
      type: "virtual",
    });

    logger.info(
      `IssuingService.createVirtualCard: Created card ${card.id} for agent ${agentId}`,
    );
    return card.id;
  }

  /**
   * Load funds onto the rider’s virtual card after customer pays invoice.
   */
  async loadFundsToRiderCard(agentId: number, amount: number): Promise<void> {
    // Normally, you'd create a top-up or use a funding source for the card.
    // This logic depends on how you've set up Issuing funding in Stripe.
    await logger.info(
      `IssuingService.loadFundsToRiderCard: Loading ${amount} onto card for agent ${agentId}`,
    );
  }

  private async createCardholder(
    agentId: number,
  ): Promise<Stripe.Issuing.Cardholder> {
    // Example: Create a cardholder for the agent
    const agent = await dbRepo(Agent).findOneOrFail({
      where: { id: agentId },
      relations: ["user"],
    });
    const user = agent.user;
    return await this.stripeService.getClient().issuing.cardholders.create({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone_number: user.phoneNumber,
      type: "individual",
      billing: {
        address: {
          line1: user.street || "N/A",
          city: user.suburb || "N/A",
          state: user.state || "N/A",
          postal_code: user.postalCode ? user.postalCode.toString() : "00000",
          country: "US",
        },
      },
    });
  }
}
