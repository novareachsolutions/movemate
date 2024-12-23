import { UserFacingError } from "./userFacing";

export class BuyFromStoreCancellationReasonRequiredError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "BuyFromStoreCancellationReasonRequiredError";
    this.statusCode = 400;
  }
}

export class BuyFromStoreNotFoundError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "BuyFromStoreNotFoundError";
    this.statusCode = 404;
  }
}

export class BuyFromStoreAlreadyCancelledError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "BuyFromStoreAlreadyCancelledError";
    this.statusCode = 400;
  }
}

export class BuyFromStoreInvalidRatingError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "BuyFromStoreInvalidRatingError";
    this.statusCode = 400;
  }
}

export class BuyFromStoreReviewCommentRequiredError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "BuyFromStoreReviewCommentRequiredError";
    this.statusCode = 400;
  }
}

export class BuyFromStoreOrderNotCompletedError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "BuyFromStoreOrderNotCompletedError";
    this.statusCode = 400;
  }
}

export class BuyFromStoreReportReasonRequiredError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "BuyFromStoreReportReasonRequiredError";
    this.statusCode = 400;
  }
}

export class BuyFromStoreInvalidActionError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "BuyFromStoreInvalidActionError";
    this.statusCode = 400;
  }
}

export class BuyFromStoreDeliveryError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "BuyFromStoreDeliveryError";
    this.statusCode = 400;
  }
}
