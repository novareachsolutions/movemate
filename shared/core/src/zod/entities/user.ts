import z from "zod";
import {
  ZAddressSchema,
  ZIdSchema,
  ZNameSchema,
  ZPhoneNumberSchema,
} from "../common";
import { ZRoleEnum } from "../enums";

// Customer schema
const CustomerSchema = z
  .object({
    id: ZIdSchema,
    userId: ZIdSchema,
    name: ZNameSchema,
    phoneNumber: ZPhoneNumberSchema,
    address: ZAddressSchema,
    orders: z.array(ZIdSchema),
  })
  .nullable();

// Rider schema
const RiderSchema = z
  .object({
    id: ZIdSchema,
    userId: ZIdSchema,
    name: ZNameSchema,
    phoneNumber: ZPhoneNumberSchema,
    vehicleType: z.string(),
    licenseNumber: z.string(),
    currentLocation: ZIdSchema.nullable(),
    activeOrders: z.array(ZIdSchema),
    earnings: z.array(ZIdSchema),
  })
  .nullable();

//Shop Owner
const ShopOwnerSchema = z
  .object({
    id: ZIdSchema,
    userId: ZIdSchema,
    name: ZNameSchema,
    phoneNumber: ZPhoneNumberSchema,
    shops: z.array(ZIdSchema),
  })
  .nullable();

//Restaurant Owner Schema
const RestaurantOwnerSchema = z
  .object({
    id: ZIdSchema,
    userId: ZIdSchema,
    name: ZNameSchema,
    phoneNumber: ZPhoneNumberSchema,
    restaurants: z.array(ZIdSchema),
  })
  .nullable();

//Admin Schema
const AdminSchema = z
  .object({
    id: ZIdSchema,
    userId: ZIdSchema,
    name: ZNameSchema,
    department: z.string(),
    permissions: z.array(ZIdSchema),
  })
  .nullable();

// User schema
const UserSchema = z.object({
  id: ZIdSchema,
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

export {
  AdminSchema,
  CustomerSchema,
  RestaurantOwnerSchema,
  RiderSchema,
  ShopOwnerSchema,
  UserSchema,
};
