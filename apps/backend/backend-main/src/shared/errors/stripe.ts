import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Custom error for failed customer creation in Stripe.
 */
export class StripeCustomerCreationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Custom error for failed payment intent creation in Stripe.
 */
export class StripePaymentIntentCreationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Custom error for missing Stripe API key configuration.
 */
export class MissingStripeApiKeyException extends HttpException {
  constructor() {
    super("Stripe API key is not configured", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
