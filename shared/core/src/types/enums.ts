// Enum definitions based on Zod schemas

enum RoleEnum {
  CUSTOMER = "CUSTOMER",
  RIDER = "RIDER",
  SHOP_OWNER = "SHOP_OWNER",
  RESTAURANT_OWNER = "RESTAURANT_OWNER",
  ADMIN = "ADMIN",
}

enum OrderStatusEnum {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

enum PaymentStatusEnum {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

enum PaymentMethodEnum {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  APPLE_PAY = "APPLE_PAY",
  GOOGLE_PAY = "GOOGLE_PAY",
}

enum EarningStatusEnum {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

enum TrackingStatusEnum {
  WAITING_FOR_PICKUP = "WAITING_FOR_PICKUP",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
}

export {
  EarningStatusEnum,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  RoleEnum,
  TrackingStatusEnum,
};
