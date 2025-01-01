import { UserFacingError } from "./userFacing";

export class SendPackageCancellationReasonRequiredError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Cancellation reason is required");
    this.name = "SendPackageCancellationReasonRequiredError";
    this.statusCode = 400;
  }
}

export class SendPackageNotFoundError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Send package not found");
    this.name = "SendPackageNotFoundError";
    this.statusCode = 404;
  }
}

export class SendPackageAlreadyCancelledError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Send package is already cancelled");
    this.name = "SendPackageAlreadyCancelledError";
    this.statusCode = 400;
  }
}

export class SendPackageAgentReportReasonRequiredError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Agent report reason is required");
    this.name = "SendPackageAgentReportReasonRequiredError";
    this.statusCode = 400;
  }
}

export class SendPackageInvalidRatingError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Invalid rating provided");
    this.name = "SendPackageInvalidRatingError";
    this.statusCode = 400;
  }
}

export class SendPackageReviewCommentRequiredError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Review comment is required");
    this.name = "SendPackageReviewCommentRequiredError";
    this.statusCode = 400;
  }
}

export class SendPackageAlreadyReviewedError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Send package is already reviewed");
    this.name = "SendPackageAlreadyReviewedError";
    this.statusCode = 400;
  }
}

export class SendPackageOrderNotCompletedError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Order is not completed");
    this.name = "SendPackageOrderNotCompletedError";
    this.statusCode = 400;
  }
}

export class SendPackageAgentAcceptError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Agent failed to accept the package");
    this.name = "SendPackageAgentAcceptError";
    this.statusCode = 400;
  }
}

export class SendPackageAgentStartError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Agent failed to start handling the package");
    this.name = "SendPackageAgentStartError";
    this.statusCode = 400;
  }
}

export class SendPackageAgentCompleteError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Agent failed to complete handling the package");
    this.name = "SendPackageAgentCompleteError";
    this.statusCode = 400;
  }
}

export class SendPackageAgentCancelError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Agent failed to cancel the package");
    this.name = "SendPackageAgentCancelError";
    this.statusCode = 400;
  }
}

export class SendPackageIssueReportError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Issue report failed");
    this.name = "SendPackageIssueReportError";
    this.statusCode = 400;
  }
}

export class SendPackageAgentMismatchError extends UserFacingError {
  constructor(message?: string) {
    super(
      message || "Agent attempting to start the order is not assigned to it.",
    );
    this.name = "SendPackageAgentMismatchError";
    this.statusCode = 403;
  }
}
