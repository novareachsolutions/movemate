import { PricingFacingError } from "./pricingFacing";

export class InvalidFareCalculationError extends PricingFacingError {
    constructor(message?: string) {
        super(message || "Invalid fare calculation parameters.");
        this.name = "InvalidFareCalculationError";
        this.statusCode = 400;
    }
}

export class DynamicPricingError extends PricingFacingError {
    constructor(message?: string) {
        super(message || "Error applying dynamic pricing.");
        this.name = "DynamicPricingError";
        this.statusCode = 500;
    }
}

export class RouteDetailsError extends PricingFacingError {
    constructor(message?: string) {
        super(message || "Error fetching route details.");
        this.name = "RouteDetailsError";
        this.statusCode = 502;
    }
}
