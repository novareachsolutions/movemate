import z from "zod";
import {
  ZAddressSchema,
  ZIdSchema,
  ZNameSchema,
  ZPhoneNumberSchema,
} from "../common";
import { ZRoleEnum, ZVehicleTypes } from "../enums";

// Customer schema
export const CustomerSchema = z
  .object({
    id: ZIdSchema.optional(),
    userId: ZIdSchema.optional(),
    name: ZNameSchema,
    phoneNumber: ZPhoneNumberSchema,
    address: ZAddressSchema,
    orders: z.array(ZIdSchema),
  })
  .nullable();

// Rider schema
export const RiderSchema = z
  .object({
    id: ZIdSchema.optional(),
    userId: ZIdSchema.optional(),
    name: ZNameSchema,
    phoneNumber: ZPhoneNumberSchema,
    vehicleType: ZVehicleTypes,
    licenseNumber: z.string(),
    currentLocation: ZIdSchema.nullable(),
    activeOrders: z.array(ZIdSchema),
    earnings: z.array(ZIdSchema),
  })
  .nullable();

//Shop Owner
export const ShopOwnerSchema = z
  .object({
    id: ZIdSchema.optional(),
    userId: ZIdSchema.optional(),
    name: ZNameSchema,
    phoneNumber: ZPhoneNumberSchema,
    shops: z.array(ZIdSchema),
  })
  .nullable();

//Restaurant Owner Schema
export const RestaurantOwnerSchema = z
  .object({
    id: ZIdSchema.optional(),
    userId: ZIdSchema.optional(),
    name: ZNameSchema,
    phoneNumber: ZPhoneNumberSchema,
    restaurants: z.array(ZIdSchema),
  })
  .nullable();

//Admin Schema
export const AdminSchema = z
  .object({
    id: ZIdSchema.optional(),
    userId: ZIdSchema.optional(),
    name: ZNameSchema,
    department: z.string(),
    permissions: z.array(ZIdSchema),
  })
  .nullable();

// User schema
export const UserSchema = z.object({
  id: ZIdSchema.optional(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: ZRoleEnum.default("CUSTOMER"),
  createdAt: z.date(),
  updatedAt: z.date(),
  customer: CustomerSchema,
  rider: RiderSchema,
  shopOwner: ShopOwnerSchema,
  restaurantOwner: RestaurantOwnerSchema,
  admin: AdminSchema,
});


