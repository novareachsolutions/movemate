import z from "zod";
import { ZIdSchema } from "../common";
import { ZOrderStatusEnum } from "../enums";

// Order schema
const OrderSchema = z.object({
  id: ZIdSchema,
  serviceId: ZIdSchema,
  customerId: ZIdSchema,
  riderId: ZIdSchema.nullable(),
  status: ZOrderStatusEnum,
  totalAmount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  orderItems: z.array(ZIdSchema),
  orderFields: z.array(ZIdSchema),
  paymentId: ZIdSchema.nullable(),
  tracking: ZIdSchema.nullable(),
});

export {OrderSchema}
