import { Injectable, NotFoundException } from "@nestjs/common";

import { Wallet } from "../../entity/Wallet";
import { WalletTransaction } from "../../entity/WalletTransaction";
import { logger } from "../../logger";
import { WalletTransactionTypeEnum } from "../../shared/enums";
import {
  TBalanceResponse,
  TTransactionResponse,
  TWithdrawalRequest,
} from "../../shared/types/payment.types";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { StripeService } from "./stripe.service";

@Injectable()
export class WalletService {
  constructor(private readonly stripeService: StripeService) {}

  async getBalance(agentId: number): Promise<TBalanceResponse> {
    try {
      const wallet = await dbReadRepo(Wallet).findOne({
        where: { agentId },
      });

      if (!wallet) {
        logger.error(
          `WalletService.getBalance: Wallet not found for agent ${agentId}`,
        );
        throw new NotFoundException("Wallet not found");
      }

      // Get pending transactions (e.g., pending withdrawals)
      const pendingTransactions = await dbReadRepo(WalletTransaction).find({
        where: {
          walletId: wallet.id,
        },
      });

      const pendingBalance = pendingTransactions.reduce(
        (sum, tx) => sum + (tx.type === "DEBIT" ? tx.amount : 0),
        0,
      );

      logger.info(
        `WalletService.getBalance: Retrieved balance for agent ${agentId}`,
      );

      return {
        balance: wallet.balance,
        pendingBalance,
      };
    } catch (error) {
      logger.error(
        `WalletService.getBalance: Failed to get balance for agent ${agentId}`,
        error,
      );
      throw error;
    }
  }

  async requestWithdrawal(
    data: TWithdrawalRequest,
  ): Promise<{ transferId: string }> {
    try {
      const wallet = await dbReadRepo(Wallet).findOne({
        where: { agentId: data.agentId },
        relations: ["agent"],
      });

      if (!wallet) {
        logger.error(
          `WalletService.requestWithdrawal: Wallet not found for agent ${data.agentId}`,
        );
        throw new NotFoundException("Wallet not found");
      }

      if (wallet.balance < data.amount) {
        logger.error(
          `WalletService.requestWithdrawal: Insufficient balance for agent ${data.agentId}`,
        );
        throw new Error("Insufficient balance");
      }

      // Create transfer in Stripe
      const transfer = await this.stripeService.createTransfer({
        amount: data.amount,
        destination: wallet.agent.stripeAccountId,
        isExpress: data.isExpress,
      });

      // Create transaction record
      await dbRepo(WalletTransaction).save({
        wallet: { id: wallet.id },
        type: WalletTransactionTypeEnum.WITHDRAWAL,
        amount: data.amount,
        balanceAfter: wallet.balance - data.amount,
        stripeTransferId: transfer.id,
      });

      // Update wallet balance
      await dbRepo(Wallet).update(wallet.id, {
        balance: wallet.balance - data.amount,
      });

      logger.info(
        `WalletService.requestWithdrawal: Processed withdrawal for agent ${data.agentId}`,
      );

      return { transferId: transfer.id };
    } catch (error) {
      logger.error(
        `WalletService.requestWithdrawal: Failed to process withdrawal for agent ${data.agentId}`,
        error,
      );
      throw error;
    }
  }

  async getTransactions(
    agentId: number,
    options: { page: number; limit: number },
  ): Promise<TTransactionResponse> {
    try {
      const wallet = await dbReadRepo(Wallet).findOne({
        where: { agentId },
      });

      if (!wallet) {
        logger.error(
          `WalletService.getTransactions: Wallet not found for agent ${agentId}`,
        );
        throw new NotFoundException("Wallet not found");
      }

      const skip = (options.page - 1) * options.limit;

      const [transactions, total] = await dbReadRepo(WalletTransaction)
        .createQueryBuilder("transaction")
        .where("transaction.walletId = :walletId", { walletId: wallet.id })
        .orderBy("transaction.createdAt", "DESC")
        .skip(skip)
        .take(options.limit)
        .getManyAndCount();

      logger.info(
        `WalletService.getTransactions: Retrieved transactions for agent ${agentId}`,
      );

      return {
        transactions,
        total,
        page: options.page,
        limit: options.limit,
      };
    } catch (error) {
      logger.error(
        `WalletService.getTransactions: Failed to get transactions for agent ${agentId}`,
        error,
      );
      throw error;
    }
  }
}
