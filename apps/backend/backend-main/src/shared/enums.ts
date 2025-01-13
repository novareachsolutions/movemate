// Agent
export enum AgentTypeEnum {
  CAR_TOWING = "CAR_TOWING",
  DELIVERY = "DELIVERY",
}

export enum AgentStatusEnum {
  BUSY = "BUSY",
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
}

export enum AgentRegistrationDocumentEnum {
  ABN = "ABN",
  DRIVER_LICENSE = "DRIVER_LICENSE",
  INSURANCE = "INSURANCE",
  OTHER = "OTHER",
  PROFILE_PHOTO = "PROFILE_PHOTO",
  VEHICLE_REGISTRATION = "VEHICLE_REGISTRATION",
}

export enum ApprovalStatusEnum {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

// Order
export enum OrderStatusEnum {
  ACCEPTED = "ACCEPTED",
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING = "PENDING",
}

export enum OrderTypeEnum {
  BUY_FROM_STORE = "BUY_FROM_STORE",
  CAR_TOWING = "CAR_TOWING",
  HOUSE_MOVING = "HOUSE_MOVING",
  SEND_PACKAGE = "SEND_PACKAGE",
}

// User
export enum UserRoleEnum {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  CUSTOMER = "CUSTOMER",
  SUPPORT = "SUPPORT",
}

// Payment
export enum PaymentStatusEnum {
  ERROR = "ERROR",
  NOT_PAID = "NOT_PAID",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}
