// Agent
export enum AgentTypeEnum {
  CAR_TOWING = "CAR_TOWING",
  DELIVERY = "DELIVERY",
}

export enum AgentStatusEnum {
  BUSY = "BUSY",
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
}

export enum AgentRegistrationDocumentEnum {
  ABN = "ABN",
  DRIVER_LICENSE = "DRIVER_LICENSE",
  INSURANCE = "INSURANCE",
  OTHER = "OTHER",
  PROFILE_PHOTO = "PROFILE_PHOTO",
  VEHICLE_REGISTRATION = "VEHICLE_REGISTRATION",
}

export enum ApprovalStatusEnum {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum SubscripionStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// Order
export enum OrderStatusEnum {
  ACCEPTED = "ACCEPTED",
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING = "PENDING",
}

export enum OrderTypeEnum {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
}

// User
export enum UserRoleEnum {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  CUSTOMER = "CUSTOMER",
  SUPPORT = "SUPPORT",
}

// Payment
export enum PaymentStatusEnum {
  ERROR = "ERROR",
  NOT_PAID = "NOT_PAID",
  PAID = "PAID",
  PENDING = "PENDING",
  REFUNDED = "REFUNDED",
}

export enum SubscriptionStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum PaymentTypeEnum {
  ORDER = "ORDER",
  SUBSCRIPTION = "SUBSCRIPTION",
  WITHDRAWAL = "WITHDRAWAL",
}

export enum WalletTransactionTypeEnum {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
  REFUND = "REFUND",
  WITHDRAWAL = "WITHDRAWAL",
}

export enum SubscriptionPlanEnum {
  DAILY = "DAILY",
  MONTHLY = "MONTHLY",
  WEEKLY = "WEEKLY",
}
