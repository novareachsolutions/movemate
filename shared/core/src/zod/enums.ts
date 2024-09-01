import { z } from "zod";

// Enum schemas
export const ZRoleEnum = z.enum([
  "CUSTOMER",
  "RIDER",
  "SHOP_OWNER",
  "RESTAURANT_OWNER",
  "ADMIN",
]);
export const ZOrderStatusEnum = z.enum([
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
export const ZPaymentStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);
export const ZPaymentMethodEnum = z.enum([
  "CREDIT_CARD",
  "DEBIT_CARD",
  "PAYPAL",
  "APPLE_PAY",
  "GOOGLE_PAY",
]);
export const ZEarningStatusEnum = z.enum(["PENDING", "PAID", "FAILED"]);
export const ZTrackingStatusEnum = z.enum([
  "WAITING_FOR_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
]);
export const ZVehicleTypes = z.enum(["CAR", "BIKE", "TRUCK"]);
