import { UserFacingError } from "./userFacing";

export class UserNotFoundError extends UserFacingError {
  constructor(message?: string) {
    super(message || "User not found");
    this.name = "UserNotFoundError";
    this.statusCode = 404;
  }
}

export class UserAlreadyExistsError extends UserFacingError {
  constructor(message?: string) {
    super(message || "User already exists");
    this.name = "UserAlreadyExistsError";
    this.statusCode = 409;
  }
}

export class UserPhoneNumberAlreadyExistsError extends UserFacingError {
  constructor(message?: string) {
    super(message || "User phone number already exists");
    this.name = "UserPhoneNumberAlreadyExistsError";
    this.statusCode = 409;
  }
}

export class UserAccessDeniedError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Access denied");
    this.name = "UserAccessDeniedError";
    this.statusCode = 403;
  }
}

export class UserTokenRefreshError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Token refresh failed");
    this.name = "UserTokenRefreshError";
    this.statusCode = 401;
  }
}

export class UserPhoneNumberBlockedError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Phone number blocked");
    this.name = "UserPhoneNumberBlockedError";
    this.statusCode = 403;
  }
}

export class UserPhoneNumberIsRequiredError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Phone number is required");
    this.name = "UserPhoneNumberIsRequiredError";
    this.statusCode = 400;
  }
}

export class UserFailedToSendOtpError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Failed to send OTP");
    this.name = "UserFailedToSendOtpError";
    this.statusCode = 400;
  }
}

export class UserInvalidOtpError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Invalid OTP");
    this.name = "UserInvalidOtpError";
    this.statusCode = 400;
  }
}

export class UserOtpRequestTooSoonException extends UserFacingError {
  constructor(waitTime: number) {
    super(`Please wait ${waitTime} seconds before requesting a new OTP.`);
    this.name = "UserOtpRequestTooSoonException";
    this.statusCode = 429;
  }
}

export class UserRetryOtpError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Please retry OTP");
    this.name = "UserRetryOtpError";
    this.statusCode = 401;
  }
}

export class UserInvalidDocumentError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Invalid document");
    this.name = "UserInvalidDocumentError";
    this.statusCode = 400;
  }
}

export class UserDocumentAlreadyExistsError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Document already exists");
    this.name = "UserDocumentAlreadyExistsError";
    this.statusCode = 409;
  }
}

export class UserExpiryDateRequiredError extends UserFacingError {
  constructor(message?: string) {
    super(message || "Expiry date is required for this document.");
    this.name = "UserExpiryDateRequiredError";
    this.statusCode = 400;
  }
}

export class UserHasRunningOrderError extends UserFacingError {
  constructor(message?: string) {
    super(message || "User already has a running order");
    this.name = "UserHasRunningOrderError";
    this.statusCode = 409;
  }
}
