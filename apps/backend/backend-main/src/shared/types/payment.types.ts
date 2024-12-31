import {
  PaymentStatusEnum,
  PaymentTypeEnum,
  WalletTransactionTypeEnum,
} from "../enums";

// *** Types ***
export type TPayment = {
  stripePaymentIntentId: string;
  type: PaymentTypeEnum;
  amount: number;
  orderId?: number;
  agentId?: number;
  status: PaymentStatusEnum;
  commissionAmount?: number;
  failureReason?: string;
};

export type TCreatePaymentIntent = {
  type: PaymentTypeEnum;
  amount: number;
  orderId?: number;
  agentId?: number;
  description?: string;
};

export type TWalletTransaction = {
  walletId: number;
  type: WalletTransactionTypeEnum;
  amount: number;
  balanceAfter: number;
  reference?: string;
  paymentId?: number;
};

// *** Interfaces ***
export interface ICreditWalletOptions {
  paymentId?: number;
  reference?: string;
}
