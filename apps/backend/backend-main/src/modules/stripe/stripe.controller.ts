import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AuthGuard } from "../../shared/guards/auth.guard";
import { IApiResponse } from "../../shared/interface";
import {
  TConnectAccountRequest,
  TCreateOrderRequest,
  TCreateSubscriptionRequest,
  TCreateVirtualCardRequest,
  TOrderResponse,
} from "../../shared/types/payment.types";
import { PaymentService } from "./payment.service";
import { StripeService } from "./stripe.service";

@Controller("stripe")
@UseGuards(AuthGuard)
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @Post("connect-account")
  async createConnectAccount(
    @Body() data: TConnectAccountRequest,
  ): Promise<IApiResponse<{ accountId: string; accountLink: string }>> {
    const result = await this.stripeService.createConnectedAccount(data);
    return {
      success: true,
      message: "Stripe connect account created successfully.",
      data: result,
    };
  }

  @Get("account-links/:agentId")
  async createAccountLink(
    @Param("agentId", ParseIntPipe) agentId: number,
  ): Promise<IApiResponse<{ url: string; expiresAt: string }>> {
    const data = await this.stripeService.createAccountLink(agentId);
    return {
      success: true,
      message: "Account link created successfully.",
      data,
    };
  }

  @Post("virtual-cards")
  async createVirtualCard(
    @Body() data: TCreateVirtualCardRequest,
  ): Promise<IApiResponse<{ cardDetails: any; amount: number }>> {
    const result = await this.stripeService.createVirtualCard(data);
    return {
      success: true,
      message: "Virtual card created successfully.",
      data: result,
    };
  }

  @Post("subscriptions")
  async createSubscription(
    @Body() data: TCreateSubscriptionRequest,
  ): Promise<IApiResponse<{ clientSecret: string; subscriptionId: string }>> {
    const result = await this.stripeService.createSubscription(data);
    return {
      success: true,
      message: "Subscription created successfully.",
      data: result,
    };
  }

  @Post("orders/send-package")
  async createOrder(
    @Body() orderData: TCreateOrderRequest,
  ): Promise<IApiResponse<TOrderResponse>> {
    const data = await this.paymentService.createOrder(orderData);
    return {
      success: true,
      message: "Order created successfully.",
      data,
    };
  }

  @Get("refresh-account-link")
  @Redirect()
  async handleRefreshAccountLink(
    @Query("agent_id") agentId: string,
  ): Promise<{ url: string }> {
    this.logger.log(`Refreshing account link for agent ${agentId}`);
    const { url } = await this.stripeService.createAccountLink(
      parseInt(agentId, 10),
    );
    return { url };
  }

  @Get("return-account-link")
  @Redirect()
  handleReturnAccountLink(
    @Query("agent_id") agentId: string,
  ): Promise<{ url: string }> {
    // Redirect to your frontend success page
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    return Promise.resolve({
      url: `${frontendUrl}/agent/onboarding-success?agent_id=${agentId}`,
    });
  }
}
