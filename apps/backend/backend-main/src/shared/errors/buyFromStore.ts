// src/shared/errors/buyFromStore.errors.ts

import { BadRequestException, NotFoundException } from '@nestjs/common';

export class BuyFromStoreCancellationReasonRequiredError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class BuyFromStoreNotFoundError extends NotFoundException {
  constructor(message: string) {
    super(message);
  }
}

export class BuyFromStoreAlreadyCancelledError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class BuyFromStoreInvalidRatingError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class BuyFromStoreReviewCommentRequiredError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class BuyFromStoreOrderNotCompletedError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class BuyFromStoreReportReasonRequiredError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

// Add more custom errors as needed
