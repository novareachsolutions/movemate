import { WalletTransaction } from "../../entity/WalletTransaction";
import {
  PaymentStatusEnum,
  PaymentTypeEnum,
  WalletTransactionTypeEnum,
} from "../enums";

// *** Types ***
// -- Entity Specific ---
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

// -- Controller Specific ---
export type TConnectAccountRequest = {
  agentId: number;
  email: string;
  country: string;
  businessType?: "individual" | "company";
};

export type TCreateVirtualCardRequest = {
  agentId: number;
  orderId: number;
  amount: number;
};

export type TCreateSubscriptionRequest = {
  agentId: number;
  plan: string;
  amount: number;
};

export type TWithdrawalRequest = {
  agentId: number;
  amount: number;
  isExpress: boolean;
};

export type TTransactionResponse = {
  transactions: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
};

export type TBalanceResponse = {
  balance: number;
  pendingBalance: number;
};

export type TCreateOrderRequest = {
  senderName: string;
  senderPhoneNumber: string;
  receiverName: string;
  receiverPhoneNumber: string;
  packageType: string;
  pickupLocationId: number;
  dropLocationId: number;
  deliveryInstructions?: string;
};

export type TOrderResponse = {
  orderId: number;
  clientSecret: string;
  amount: number;
};

// *** Interfaces ***
export interface ICreditWalletOptions {
  paymentId?: number;
  reference?: string;
}
