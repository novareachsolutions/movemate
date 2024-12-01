// Agent
export enum AgentTypeEnum {
  CAR_TOWING = 'CAR_TOWING',
  DELIVERY = 'DELIVERY',
}

export enum AgentStatusEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export enum AgentRegistrationDocumentEnum {
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  VEHICLE_REGISTRATION = 'VEHICLE_REGISTRATION',
  INSURANCE = 'INSURANCE',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  ABN = 'ABN',
  OTHER = 'OTHER',
}

// Order
export enum OrderStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export enum OrderTypeEnum {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

export enum CancellationSourceEnum {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
}

// User
export enum UserRoleEnum {
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  SUPPORT = 'SUPPORT',
}
