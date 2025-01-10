import { OrderTypeEnum } from "../../shared/enums";

export type TReferralCode = {
  code: string;
  createdAt: Date;
};

export type TReferral = {
  referralCode: string;
  referredUserId: number;
  referredAt: Date;
  referrerBenefit: number;
  referredBenefit: number;
};

export type TCreateReferral = {
  referralCode: string;
  referredUserId: number;
};

export type TCreatePromotionCode = {
  code: string;
  description?: string;
  discountAmount?: number;
  discountPercentage?: number;
  usageLimit?: number;
  expirationDate?: Date;
  applicableOrderTypes: OrderTypeEnum[];
  createdById: number;
};

export type TUpdatePromotionCode = {
  description?: string;
  discountAmount?: number;
  discountPercentage?: number;
  usageLimit?: number;
  expirationDate?: Date;
  applicableOrderTypes?: OrderTypeEnum[];
};

export type TUsePromotionCode = {
  code: string;
  userId: number;
};

export type TPromotionUsage = {
  promotionCode: string;
  userId: number;
  usedAt: Date;
};
