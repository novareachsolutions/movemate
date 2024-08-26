import z from "zod";

// Name schema with min and max length
export const ZNameSchema = z
  .string()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name cannot exceed 100 characters" });

export const ZIdSchema = z.string().uuid();

export const ZPhoneNumberSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" });

export const ZAddressSchema = z.string();

