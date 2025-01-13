import { PaymentStatusEnum, PaymentTypeEnum } from "../enums";

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

export type TBalanceResponse = {
  balance: number;
  pendingBalance: number;
};

export type TCreateOrderRequest = {
  agentId?: number;
  amount: number;
  currency: string;
  customerId: number;
  orderId: number;
};

export type TOrderResponse = {
  clientSecret: string;
  orderId: number;
  paymentIntentId: string;
};
