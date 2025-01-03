export class InvalidFareCalculationError extends Error {
  constructor(message?: string) {
    super(message || "Invalid fare calculation parameters.");
    this.name = "InvalidFareCalculationError";
  }
}

export class DynamicPricingError extends Error {
  constructor(message?: string) {
    super(message || "Error applying dynamic pricing.");
    this.name = "DynamicPricingError";
  }
}

export class RouteDetailsError extends Error {
  constructor(message?: string) {
    super(message || "Error fetching route details.");
    this.name = "RouteDetailsError";
  }
}
