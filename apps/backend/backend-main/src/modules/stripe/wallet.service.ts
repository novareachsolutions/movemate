import { Injectable, NotFoundException } from "@nestjs/common";

import { Wallet } from "../../entity/Wallet";
import { WalletTransaction } from "../../entity/WalletTransaction";
import { logger } from "../../logger";
import { WalletTransactionTypeEnum } from "../../shared/enums";
import {
  ICreditWalletOptions,
  TWalletTransaction,
} from "../../shared/types/payment.types";
import { dbReadRepo, dbRepo } from "../database/database.service";

@Injectable()
export class WalletService {
  async creditWallet(
    agentId: number,
    amount: number,
    options: ICreditWalletOptions = {},
  ): Promise<void> {
    const wallet = await dbReadRepo(Wallet).findOne({
      where: { agentId },
    });

    if (!wallet) {
      logger.error(
        `WalletService.creditWallet: Wallet for agent ${agentId} not found`,
      );
      throw new NotFoundException("Wallet not found");
    }

    // Use transaction to ensure data consistency
    await dbRepo(Wallet).manager.transaction(
      async (transactionalEntityManager) => {
        // Update wallet balance
        const newBalance = wallet.balance + amount;
        await transactionalEntityManager.update(Wallet, wallet.id, {
          balance: newBalance,
        });

        // Create transaction record
        const transaction: TWalletTransaction = {
          walletId: wallet.id,
          type: WalletTransactionTypeEnum.CREDIT,
          amount,
          balanceAfter: newBalance,
          reference: options.reference,
        };

        await transactionalEntityManager.save(WalletTransaction, transaction);

        logger.info(
          `WalletService.creditWallet: Credited ${amount} to wallet ${wallet.id}`,
        );
      },
    );
  }
}
