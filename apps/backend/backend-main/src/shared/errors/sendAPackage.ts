import { UserFacingError } from "./userFacing";

export class SendPackageNotFoundError extends UserFacingError {
    constructor(message?: string) {
        super(message || "Send package order not found");
        this.name = "SendPackageNotFoundError";
        this.statusCode = 404;
    }
}

export class SendPackageAlreadyCancelledError extends UserFacingError {
    constructor(message?: string) {
        super(message || "Send package order is already canceled");
        this.name = "SendPackageAlreadyCancelledError";
        this.statusCode = 409;
    }
}

export class SendPackageCancellationReasonRequiredError extends UserFacingError {
    constructor(message?: string) {
        super(message || "Cancellation reason is required");
        this.name = "SendPackageCancellationReasonRequiredError";
        this.statusCode = 400;
    }
}

export class SendPackageAgentReportReasonRequiredError extends UserFacingError {
    constructor(message?: string) {
        super(message || "Reason is required to report agent");
        this.name = "SendPackageAgentReportReasonRequiredError";
        this.statusCode = 400;
    }
}

export class SendPackageInvalidRatingError extends UserFacingError {
    constructor(message?: string) {
        super(message || "Rating must be between 1 and 5");
        this.name = "SendPackageInvalidRatingError";
        this.statusCode = 400;
    }
}

export class SendPackageReviewCommentRequiredError extends UserFacingError {
    constructor(message?: string) {
        super(message || "Comment is required for review");
        this.name = "SendPackageReviewCommentRequiredError";
        this.statusCode = 400;
    }
}

export class SendPackageAlreadyReviewedError extends UserFacingError {
    constructor(message?: string) {
        super(message || "Review already submitted for this order");
        this.name = "SendPackageAlreadyReviewedError";
        this.statusCode = 409;
    }
}

export class SendPackageOrderNotCompletedError extends UserFacingError {
    constructor(message?: string) {
        super(message || "Cannot review an incomplete order");
        this.name = "SendPackageOrderNotCompletedError";
        this.statusCode = 400;
    }
}
