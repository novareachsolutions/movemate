import { Injectable } from "@nestjs/common";

import { logger } from "../../logger";
import {
  DynamicPricingError,
  InvalidFareCalculationError,
} from "../../shared/errors/pricing";
import { PRICING_CONSTANTS } from "./pricing.constants";
import { TFareCalculation } from "./pricing.type";

@Injectable()
export class PricingService {
  calculateFare(body: TFareCalculation): number {
    logger.debug(
      `PricingService.calculateFare: Starting fare calculation with data: ${JSON.stringify(body)}`,
    );

    const {
      distance,
      estimatedTime,
      packageWeight,
      isPeakHour = false,
      isHighDemand = false,
      isSpecialEvent = false,
      isWeatherAffected = false,
    } = body;

    // Validate input
    if (distance < 0 || estimatedTime < 0 || packageWeight < 0) {
      logger.error(
        "PricingService.calculateFare: Negative values provided for distance, estimatedTime, or packageWeight.",
      );
      throw new InvalidFareCalculationError(
        "Distance, Estimated Time, and Package Weight must be non-negative.",
      );
    }

    try {
      let totalFare = PRICING_CONSTANTS.F_BASE;
      logger.debug(
        `PricingService.calculateFare: Base fare (${PRICING_CONSTANTS.F_BASE}) applied.`,
      );

      totalFare += PRICING_CONSTANTS.F_DISTANCE * distance;
      logger.debug(
        `PricingService.calculateFare: Distance charge (${PRICING_CONSTANTS.F_DISTANCE} * ${distance}) added.`,
      );

      totalFare += PRICING_CONSTANTS.F_TIME * estimatedTime;
      logger.debug(
        `PricingService.calculateFare: Time charge (${PRICING_CONSTANTS.F_TIME} * ${estimatedTime}) added.`,
      );

      const packageSurcharge =
        packageWeight > 5 ? PRICING_CONSTANTS.F_PACKAGE_SURCHARGE : 0;
      totalFare += packageSurcharge;
      logger.debug(
        `PricingService.calculateFare: Package surcharge (${packageSurcharge}) applied.`,
      );

      totalFare += PRICING_CONSTANTS.F_ADDITIONAL;
      logger.debug(
        `PricingService.calculateFare: Additional fees (${PRICING_CONSTANTS.F_ADDITIONAL}) added.`,
      );

      let dynamicMultiplier = PRICING_CONSTANTS.MULTIPLIERS.NORMAL;
      const multipliers: { name: string; value: number }[] = [];

      if (isHighDemand) {
        multipliers.push({
          name: "High Demand",
          value: PRICING_CONSTANTS.MULTIPLIERS.HIGH_DEMAND,
        });
      }
      if (isPeakHour) {
        multipliers.push({
          name: "Peak Hours",
          value: PRICING_CONSTANTS.MULTIPLIERS.PEAK_HOURS,
        });
      }
      if (isSpecialEvent) {
        multipliers.push({ name: "Special Event", value: 1.25 });
      }
      if (isWeatherAffected) {
        multipliers.push({ name: "Weather Affected", value: 1.15 });
      }

      if (multipliers.length > 0) {
        dynamicMultiplier = Math.max(...multipliers.map((m) => m.value));
        logger.debug(
          `PricingService.calculateFare: Dynamic multiplier (${dynamicMultiplier}) applied based on factors: ${multipliers.map((m) => m.name).join(", ")}`,
        );
      } else {
        logger.debug(
          "PricingService.calculateFare: No dynamic multiplier applied. Using normal conditions.",
        );
      }

      totalFare *= dynamicMultiplier;
      logger.debug(
        `PricingService.calculateFare: Total fare after applying multiplier (${dynamicMultiplier}): ${totalFare}`,
      );

      totalFare = Math.round(totalFare * 100) / 100;
      logger.debug(
        `PricingService.calculateFare: Total fare rounded to two decimal places: ${totalFare}`,
      );

      return totalFare;
    } catch (error) {
      logger.error(
        `PricingService.calculateFare: An error occurred during fare calculation - ${error}`,
      );
      throw new DynamicPricingError("Failed to apply dynamic pricing.");
    }
  }
}
