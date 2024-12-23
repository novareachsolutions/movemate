// Agent
export enum AgentTypeEnum {
  CAR_TOWING = "CAR_TOWING",
  DELIVERY = "DELIVERY",
}

export enum AgentStatusEnum {
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

export enum SubscripionStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// Order
export enum OrderStatusEnum {
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING = "PENDING",
}

export enum OrderTypeEnum {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
}

// User
export enum UserRoleEnum {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  CUSTOMER = "CUSTOMER",
  SUPPORT = "SUPPORT",
}

//Payment
export enum PaymentStatusEnum {
  NOT_PAID = "NOT_PAID",
  PAID = "PAID",
  ERROR = "ERROR",
  REFUNDED = "REFUNDED",
}
