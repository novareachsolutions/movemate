import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../../shared/guards/auth.guard";
import { IApiResponse } from "../../shared/interface";
import {
  TBalanceResponse,
  TTransactionResponse,
  TWithdrawalRequest,
} from "../../shared/types/payment.types";
import { WalletService } from "./wallet.service";

@Controller("wallet")
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get("balance/:agentId")
  async getBalance(
    @Param("agentId", ParseIntPipe) agentId: number,
  ): Promise<IApiResponse<TBalanceResponse>> {
    const data = await this.walletService.getBalance(agentId);
    return {
      success: true,
      message: "Wallet balance retrieved successfully.",
      data,
    };
  }

  @Post("withdraw")
  async requestWithdrawal(
    @Body() data: TWithdrawalRequest,
  ): Promise<IApiResponse<{ transferId: string }>> {
    const result = await this.walletService.requestWithdrawal(data);
    return {
      success: true,
      message: "Withdrawal request processed successfully.",
      data: result,
    };
  }

  @Get("transactions/:agentId")
  async getTransactions(
    @Param("agentId", ParseIntPipe) agentId: number,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
  ): Promise<IApiResponse<TTransactionResponse>> {
    const data = await this.walletService.getTransactions(agentId, {
      page,
      limit,
    });
    return {
      success: true,
      message: "Transactions retrieved successfully.",
      data,
    };
  }
}
