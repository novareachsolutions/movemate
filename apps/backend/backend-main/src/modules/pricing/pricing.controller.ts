import { Body, Controller, Post } from "@nestjs/common";

import { IApiResponse } from "../../shared/interface";
import { PricingService } from "./pricing.service";
import { TFareCalculation } from "./pricing.type";

@Controller("pricing")
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post("calculate")
  calculateFare(@Body() body: TFareCalculation): IApiResponse<string> {
    const fare = this.pricingService.calculateFare(body);
    return {
      success: true,
      message: "All agents retrieved successfully.",
      data: `${fare.toFixed(2)}`,
    };
  }
}
