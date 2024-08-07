import z from "zod";

// Name schema with min and max length
const ZNameSchema = z
  .string()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name cannot exceed 100 characters" });

// UUID schema
const ZIdSchema = z.string().uuid();

// Phone number schema with regex validation
const ZPhoneNumberSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" });

// Address schema
const ZAddressSchema = z.string();

export { ZAddressSchema, ZIdSchema, ZNameSchema, ZPhoneNumberSchema };
