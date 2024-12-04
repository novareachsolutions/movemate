// sendAPackage.ts

import { BadRequestException, NotFoundException } from '@nestjs/common';

export class SendPackageCancellationReasonRequiredError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageNotFoundError extends NotFoundException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageAlreadyCancelledError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageAgentReportReasonRequiredError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageInvalidRatingError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageReviewCommentRequiredError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageAlreadyReviewedError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageOrderNotCompletedError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageAgentAcceptError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageAgentStartError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageAgentCompleteError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageAgentCancelError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}

export class SendPackageIssueReportError extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}
