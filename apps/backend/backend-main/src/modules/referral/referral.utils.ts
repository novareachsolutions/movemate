import { v4 as uuidv4 } from "uuid";

export function generateUniqueCode(length: number = 8): string {
  return uuidv4().replace(/-/g, "").substring(0, length).toUpperCase();
}

export function calculateBenefits(): {
  referrerBenefit: number;
  referredBenefit: number;
} {
  const referrerBenefit = 10;
  const referredBenefit = 5;
  return { referrerBenefit, referredBenefit };
}
