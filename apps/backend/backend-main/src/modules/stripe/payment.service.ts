import { Injectable, NotFoundException } from "@nestjs/common";

import { DropLocation } from "../../entity/DropLocation";
import { Payment } from "../../entity/Payment";
import { PickupLocation } from "../../entity/PickupLocation";
import { SendPackageOrder } from "../../entity/SendPackageOrder";
import { logger } from "../../logger";
import {
  OrderTypeEnum,
  PaymentStatusEnum,
  PaymentTypeEnum,
} from "../../shared/enums";
import {
  TCreateOrderRequest,
  TOrderResponse,
} from "../../shared/types/payment.types";
import { dbReadRepo, dbRepo } from "../database/database.service";
import { StripeService } from "./stripe.service";

@Injectable()
export class PaymentService {
  constructor(private readonly stripeService: StripeService) {}

  async createOrder(orderData: TCreateOrderRequest): Promise<TOrderResponse> {
    try {
      // Validate locations
      const pickupLocation = await dbReadRepo(PickupLocation).findOne({
        where: { id: orderData.pickupLocationId },
      });
      if (!pickupLocation) {
        logger.error(
          `PaymentService.createOrder: Pickup location ${orderData.pickupLocationId} not found`,
        );
        throw new NotFoundException("Pickup location not found");
      }

      const dropLocation = await dbReadRepo(DropLocation).findOne({
        where: { id: orderData.dropLocationId },
      });
      if (!dropLocation) {
        logger.error(
          `PaymentService.createOrder: Drop location ${orderData.dropLocationId} not found`,
        );
        throw new NotFoundException("Drop location not found");
      }

      // Calculate order amount based on distance or fixed rate
      const amount = await this.calculateOrderAmount(
        pickupLocation,
        dropLocation,
      );

      // Create order
      const order: any = await dbRepo(SendPackageOrder).save({
        ...orderData,
        paymentStatus: PaymentStatusEnum.PENDING,
        type: OrderTypeEnum.DELIVERY,
        estimatedDistance: amount.distance,
        estimatedTime: amount.time,
        price: amount.price,
      });

      // Create payment intent
      const paymentIntent = await this.stripeService.createPaymentIntent({
        amount: amount.price,
        currency: "aud",
        description: `Payment for order #${order.id}`,
      });

      // Create payment record
      await dbRepo(Payment).save({
        stripePaymentIntentId: paymentIntent.id,
        type: PaymentTypeEnum.ORDER,
        amount: amount.price,
        status: PaymentStatusEnum.PENDING,
        order: { id: order.id },
      });

      logger.info(
        `PaymentService.createOrder: Created order ${order.id} with payment intent ${paymentIntent.id}`,
      );

      return {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
        amount: amount.price,
      };
    } catch (error) {
      logger.error("PaymentService.createOrder: Failed to create order", error);
      throw error;
    }
  }

  private calculateOrderAmount(
    pickup: PickupLocation,
    drop: DropLocation,
  ): Promise<{ price: number; distance: number; time: number }> {
    // Implement your pricing logic here
    // This is a simple example - replace with your actual calculation
    const distance = this.calculateDistance(
      pickup.latitude,
      pickup.longitude,
      drop.latitude,
      drop.longitude,
    );

    const baseRate = 10; // Base rate in AUD
    const perKmRate = 2; // Rate per km in AUD
    const price = baseRate + distance * perKmRate;
    const estimatedTime = distance * 3; // Simple estimation: 3 minutes per km

    return Promise.resolve({
      price: Math.round(price * 100) / 100, // Round to 2 decimal places
      distance: Math.round(distance * 100) / 100,
      time: Math.round(estimatedTime),
    });
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // Implement distance calculation (e.g., Haversine formula)
    // This is a simplified version
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
