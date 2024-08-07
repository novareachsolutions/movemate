import { z } from "zod";

// Enum schemas
const ZRoleEnum = z.enum([
  "CUSTOMER",
  "RIDER",
  "SHOP_OWNER",
  "RESTAURANT_OWNER",
  "ADMIN",
]);
const ZOrderStatusEnum = z.enum([
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
const ZPaymentStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);
const ZPaymentMethodEnum = z.enum([
  "CREDIT_CARD",
  "DEBIT_CARD",
  "PAYPAL",
  "APPLE_PAY",
  "GOOGLE_PAY",
]);
const ZEarningStatusEnum = z.enum(["PENDING", "PAID", "FAILED"]);
const ZTrackingStatusEnum = z.enum([
  "WAITING_FOR_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
]);

export {
  ZEarningStatusEnum,
  ZOrderStatusEnum,
  ZPaymentMethodEnum,
  ZPaymentStatusEnum,
  ZRoleEnum,
  ZTrackingStatusEnum,
};
