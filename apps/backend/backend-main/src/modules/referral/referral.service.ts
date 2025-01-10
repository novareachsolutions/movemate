import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { getManager } from "typeorm";

import { PromotionCode } from "../../entity/PromotionCode";
import { PromotionUsage } from "../../entity/PromotionUsage";
import { Referral } from "../../entity/Referral";
import { ReferralCode } from "../../entity/ReferralCode";
import { User } from "../../entity/User";
import { logger } from "../../logger";
import { dbReadRepo, dbRepo } from "../database/database.service";
import {
  TCreatePromotionCode,
  TCreateReferral,
  TPromotionUsage,
  TReferral,
  TReferralCode,
  TUpdatePromotionCode,
  TUsePromotionCode,
} from "./referral.types";
import { calculateBenefits, generateUniqueCode } from "./referral.utils";

@Injectable()
export class ReferralService {
  /**
   * Generates a unique referral code for a user
   * @param userId - ID of the user generating the code
   * @returns The generated TReferralCode
   */
  async generateReferralCode(userId: number): Promise<TReferralCode> {
    logger.debug(
      `ReferralService.generateReferralCode: Generating referral code for user ID ${userId}.`,
    );

    const user = await dbReadRepo(User).findOne({ where: { id: userId } });
    if (!user) {
      logger.error(
        `ReferralService.generateReferralCode: User with ID ${userId} not found.`,
      );
      throw new NotFoundException("User not found");
    }

    // Check if the user already has a referral code
    const existingCode = await dbReadRepo(ReferralCode).findOne({
      where: { referrer: { id: userId } },
    });
    if (existingCode) {
      logger.error(
        `ReferralService.generateReferralCode: User ID ${userId} already has a referral code.`,
      );
      throw new BadRequestException("User already has a referral code");
    }

    const code = generateUniqueCode();

    const referralCode = dbRepo(ReferralCode).create({
      code,
      referrer: user,
    });

    try {
      await dbRepo(ReferralCode).save(referralCode);
      logger.debug(
        `ReferralService.generateReferralCode: Referral code ${code} generated for user ID ${userId}.`,
      );
    } catch (error) {
      logger.error(
        `ReferralService.generateReferralCode: Failed to generate referral code for user ID ${userId}.`,
        error,
      );
      throw new InternalServerErrorException(
        "Failed to generate referral code",
      );
    }

    return {
      code: referralCode.code,
      createdAt: referralCode.createdAt,
    };
  }

  /**
   * Retrieves all referral codes for a user
   * @param userId - ID of the user
   * @returns Array of TReferralCode
   */
  async getReferralCodes(userId: number): Promise<TReferralCode[]> {
    logger.debug(
      `ReferralService.getReferralCodes: Retrieving referral codes for user ID ${userId}.`,
    );

    const referralCodes = await dbReadRepo(ReferralCode).find({
      where: { referrer: { id: userId } },
      order: { createdAt: "DESC" },
    });

    logger.debug(
      `ReferralService.getReferralCodes: Found ${referralCodes.length} referral codes for user ID ${userId}.`,
    );

    return referralCodes.map((code) => ({
      code: code.code,
      createdAt: code.createdAt,
    }));
  }

  /**
   * Creates a referral when a user signs up with a referral code
   * @param createReferralDto - Data required to create a referral
   * @returns The created TReferral
   */
  async createReferral(createReferralDto: TCreateReferral): Promise<TReferral> {
    const { referralCode: referralCodeStr, referredUserId } = createReferralDto;
    logger.debug(
      `ReferralService.createReferral: Creating referral with code ${referralCodeStr} for referred user ID ${referredUserId}.`,
    );

    const referralCode = await dbReadRepo(ReferralCode).findOne({
      where: { code: referralCodeStr },
      relations: ["referrer"],
    });

    if (!referralCode) {
      logger.error(
        `ReferralService.createReferral: Invalid referral code ${referralCodeStr}.`,
      );
      throw new BadRequestException("Invalid referral code");
    }

    const referredUser = await dbReadRepo(User).findOne({
      where: { id: referredUserId },
    });
    if (!referredUser) {
      logger.error(
        `ReferralService.createReferral: Referred user ID ${referredUserId} not found.`,
      );
      throw new NotFoundException("Referred user not found");
    }

    // Check if the user has already been referred
    const existingReferral = await dbReadRepo(Referral).findOne({
      where: { referredUser: { id: referredUserId } },
    });

    if (existingReferral) {
      logger.error(
        `ReferralService.createReferral: User ID ${referredUserId} has already been referred.`,
      );
      throw new BadRequestException("User has already been referred");
    }

    const benefits = calculateBenefits();

    const referral = dbRepo(Referral).create({
      referralCode: referralCode,
      referredUser: referredUser,
      referrerBenefit: benefits.referrerBenefit,
      referredBenefit: benefits.referredBenefit,
    });

    try {
      await getManager().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(referral);

        // Update referrer's referralCredits
        referralCode.referrer.referralCredits += benefits.referrerBenefit;
        await transactionalEntityManager.save(referralCode.referrer);

        // Update referred user's referralCredits
        referredUser.referralCredits += benefits.referredBenefit;
        await transactionalEntityManager.save(referredUser);
      });
      logger.debug(
        `ReferralService.createReferral: Referral created successfully for referred user ID ${referredUserId}.`,
      );
    } catch (error) {
      logger.error(
        `ReferralService.createReferral: Failed to create referral for referred user ID ${referredUserId}.`,
        error,
      );
      throw new InternalServerErrorException("Failed to create referral");
    }

    return {
      referralCode: referral.referralCode.code,
      referredUserId: referral.referredUser.id,
      referredAt: referral.referredAt,
      referrerBenefit: referral.referrerBenefit,
      referredBenefit: referral.referredBenefit,
    };
  }

  /**
   * Retrieves all referrals made by a referrer
   * @param referrerId - ID of the referrer
   * @returns Array of TReferral
   */
  async getReferralsByReferrer(referrerId: number): Promise<TReferral[]> {
    logger.debug(
      `ReferralService.getReferralsByReferrer: Retrieving referrals made by referrer ID ${referrerId}.`,
    );

    const referrals = await dbReadRepo(Referral).find({
      where: { referralCode: { referrer: { id: referrerId } } },
      relations: ["referralCode", "referredUser"],
      order: { referredAt: "DESC" },
    });

    logger.debug(
      `ReferralService.getReferralsByReferrer: Found ${referrals.length} referrals for referrer ID ${referrerId}.`,
    );

    return referrals.map((ref) => ({
      referralCode: ref.referralCode.code,
      referredUserId: ref.referredUser.id,
      referredAt: ref.referredAt,
      referrerBenefit: ref.referrerBenefit,
      referredBenefit: ref.referredBenefit,
    }));
  }

  /**
   * Retrieves all referrals in the system (Admin)
   * @returns Array of TReferral
   */
  async getAllReferrals(): Promise<TReferral[]> {
    logger.debug(
      `ReferralService.getAllReferrals: Retrieving all referrals in the system.`,
    );

    const referrals = await dbReadRepo(Referral).find({
      relations: ["referralCode", "referredUser"],
      order: { referredAt: "DESC" },
    });

    logger.debug(
      `ReferralService.getAllReferrals: Found ${referrals.length} referrals in the system.`,
    );

    return referrals.map((ref) => ({
      referralCode: ref.referralCode.code,
      referredUserId: ref.referredUser.id,
      referredAt: ref.referredAt,
      referrerBenefit: ref.referrerBenefit,
      referredBenefit: ref.referredBenefit,
    }));
  }

  /**
   * Retrieves referral details for a referred user
   * @param referredUserId - ID of the referred user
   * @returns The TReferral
   */
  async getReferralDetails(referredUserId: number): Promise<TReferral> {
    logger.debug(
      `ReferralService.getReferralDetails: Retrieving referral details for referred user ID ${referredUserId}.`,
    );

    const referral = await dbReadRepo(Referral).findOne({
      where: { referredUser: { id: referredUserId } },
      relations: ["referralCode", "referralCode.referrer"],
    });

    if (!referral) {
      logger.error(
        `ReferralService.getReferralDetails: Referral not found for referred user ID ${referredUserId}.`,
      );
      throw new NotFoundException("Referral not found for the user");
    }

    logger.debug(
      `ReferralService.getReferralDetails: Referral found for referred user ID ${referredUserId}.`,
    );

    return {
      referralCode: referral.referralCode.code,
      referredUserId: referral.referredUser.id,
      referredAt: referral.referredAt,
      referrerBenefit: referral.referrerBenefit,
      referredBenefit: referral.referredBenefit,
    };
  }

  // ===== Promotion Code Management =====

  /**
   * Creates a new promotion code
   * @param createPromotionDto - Data required to create a promotion code
   * @returns The created PromotionCode
   */
  async createPromotionCode(
    createPromotionDto: TCreatePromotionCode,
  ): Promise<PromotionCode> {
    const {
      code,
      description,
      discountAmount,
      discountPercentage,
      usageLimit,
      expirationDate,
      applicableOrderTypes,
      createdById,
    } = createPromotionDto;
    logger.debug(
      `ReferralService.createPromotionCode: Creating promotion code ${code} by user ID ${createdById}.`,
    );

    // Check if promotion code already exists
    const existingPromotion = await dbReadRepo(PromotionCode).findOne({
      where: { code },
    });
    if (existingPromotion) {
      logger.error(
        `ReferralService.createPromotionCode: Promotion code ${code} already exists.`,
      );
      throw new BadRequestException("Promotion code already exists");
    }

    // Fetch the user who is creating the promotion code
    const user = await dbReadRepo(User).findOne({ where: { id: createdById } });
    if (!user) {
      logger.error(
        `ReferralService.createPromotionCode: User ID ${createdById} not found.`,
      );
      throw new NotFoundException("User not found");
    }

    const promotionCode = dbRepo(PromotionCode).create({
      code,
      description,
      discountAmount,
      discountPercentage,
      usageLimit,
      expirationDate,
      applicableOrderTypes,
      createdBy: user,
    });

    try {
      await dbRepo(PromotionCode).save(promotionCode);
      logger.debug(
        `ReferralService.createPromotionCode: Promotion code ${code} created successfully.`,
      );
    } catch (error) {
      logger.error(
        `ReferralService.createPromotionCode: Failed to create promotion code ${code}.`,
        error,
      );
      throw new InternalServerErrorException("Failed to create promotion code");
    }

    return promotionCode;
  }

  /**
   * Retrieves a promotion code by its code
   * @param code - The promotion code string
   * @returns The PromotionCode
   */
  async getPromotionCodeByCode(code: string): Promise<PromotionCode> {
    logger.debug(
      `ReferralService.getPromotionCodeByCode: Retrieving promotion code ${code}.`,
    );

    const promotionCode = await dbReadRepo(PromotionCode).findOne({
      where: { code },
      relations: ["createdBy"],
    });

    if (!promotionCode) {
      logger.error(
        `ReferralService.getPromotionCodeByCode: Promotion code ${code} not found.`,
      );
      throw new NotFoundException("Promotion code not found");
    }

    logger.debug(
      `ReferralService.getPromotionCodeByCode: Promotion code ${code} retrieved successfully.`,
    );

    return promotionCode;
  }

  /**
   * Updates an existing promotion code
   * @param code - The promotion code string
   * @param updatePromotionDto - Data to update the promotion code
   * @returns The updated PromotionCode
   */
  async updatePromotionCode(
    code: string,
    updatePromotionDto: TUpdatePromotionCode,
  ): Promise<PromotionCode> {
    logger.debug(
      `ReferralService.updatePromotionCode: Updating promotion code ${code}.`,
    );

    const promotionCode = await dbReadRepo(PromotionCode).findOne({
      where: { code },
    });
    if (!promotionCode) {
      logger.error(
        `ReferralService.updatePromotionCode: Promotion code ${code} not found.`,
      );
      throw new NotFoundException("Promotion code not found");
    }

    Object.assign(promotionCode, updatePromotionDto);

    try {
      await dbRepo(PromotionCode).save(promotionCode);
      logger.debug(
        `ReferralService.updatePromotionCode: Promotion code ${code} updated successfully.`,
      );
    } catch (error) {
      logger.error(
        `ReferralService.updatePromotionCode: Failed to update promotion code ${code}.`,
        error,
      );
      throw new InternalServerErrorException("Failed to update promotion code");
    }

    return promotionCode;
  }

  /**
   * Deletes a promotion code
   * @param code - The promotion code string
   * @returns void
   */
  async deletePromotionCode(code: string): Promise<void> {
    logger.debug(
      `ReferralService.deletePromotionCode: Deleting promotion code ${code}.`,
    );

    const promotionCode = await dbReadRepo(PromotionCode).findOne({
      where: { code },
    });
    if (!promotionCode) {
      logger.error(
        `ReferralService.deletePromotionCode: Promotion code ${code} not found.`,
      );
      throw new NotFoundException("Promotion code not found");
    }

    try {
      await dbRepo(PromotionCode).remove(promotionCode);
      logger.debug(
        `ReferralService.deletePromotionCode: Promotion code ${code} deleted successfully.`,
      );
    } catch (error) {
      logger.error(
        `ReferralService.deletePromotionCode: Failed to delete promotion code ${code}.`,
        error,
      );
      throw new InternalServerErrorException("Failed to delete promotion code");
    }
  }

  /**
   * Applies a promotion code for a user
   * @param usePromotionDto - Data required to apply a promotion code
   * @returns The PromotionUsage record
   */
  async applyPromotionCode(
    usePromotionDto: TUsePromotionCode,
  ): Promise<TPromotionUsage> {
    const { code, userId } = usePromotionDto;
    logger.debug(
      `ReferralService.applyPromotionCode: Applying promotion code ${code} for user ID ${userId}.`,
    );

    const promotionCode = await dbReadRepo(PromotionCode).findOne({
      where: { code },
      relations: ["createdBy"],
    });

    if (!promotionCode) {
      logger.error(
        `ReferralService.applyPromotionCode: Promotion code ${code} not found.`,
      );
      throw new NotFoundException("Promotion code not found");
    }

    // Check expiration
    if (
      promotionCode.expirationDate &&
      new Date() > promotionCode.expirationDate
    ) {
      logger.error(
        `ReferralService.applyPromotionCode: Promotion code ${code} has expired.`,
      );
      throw new BadRequestException("Promotion code has expired");
    }

    // Check usage limit
    if (
      promotionCode.usageLimit !== null &&
      promotionCode.usageCount >= promotionCode.usageLimit
    ) {
      logger.error(
        `ReferralService.applyPromotionCode: Promotion code ${code} has reached its usage limit.`,
      );
      throw new BadRequestException(
        "Promotion code has reached its usage limit",
      );
    }

    // Fetch user
    const user = await dbReadRepo(User).findOne({ where: { id: userId } });
    if (!user) {
      logger.error(
        `ReferralService.applyPromotionCode: User ID ${userId} not found.`,
      );
      throw new NotFoundException("User not found");
    }

    // Check if user has already used this promotion code if needed
    // Uncomment the following block if you want to restrict one usage per user
    /*
      const existingUsage = await dbReadRepo(PromotionUsage).findOne({
        where: { promotionCode: { id: promotionCode.id }, user: { id: userId } },
      });
      if (existingUsage) {
        logger.error(`ReferralService.applyPromotionCode: User ID ${userId} has already used promotion code ${code}.`);
        throw new BadRequestException('Promotion code already used by this user');
      }
      */

    const promotionUsage = dbRepo(PromotionUsage).create({
      promotionCode: promotionCode,
      user: user,
    });

    try {
      await getManager().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(promotionUsage);

        // Increment usage count
        promotionCode.usageCount += 1;
        await transactionalEntityManager.save(promotionCode);
      });
      logger.debug(
        `ReferralService.applyPromotionCode: Promotion code ${code} applied successfully for user ID ${userId}.`,
      );
    } catch (error) {
      logger.error(
        `ReferralService.applyPromotionCode: Failed to apply promotion code ${code} for user ID ${userId}.`,
        error,
      );
      throw new InternalServerErrorException("Failed to apply promotion code");
    }

    return {
      promotionCode: promotionUsage.promotionCode.code,
      userId: promotionUsage.user.id,
      usedAt: promotionUsage.usedAt,
    };
  }

  /**
   * Retrieves all promotion usages for a user
   * @param userId - ID of the user
   * @returns Array of TPromotionUsage
   */
  async getPromotionUsagesByUser(userId: number): Promise<TPromotionUsage[]> {
    logger.debug(
      `ReferralService.getPromotionUsagesByUser: Retrieving promotion usages for user ID ${userId}.`,
    );

    const usages = await dbReadRepo(PromotionUsage).find({
      where: { user: { id: userId } },
      relations: ["promotionCode"],
      order: { usedAt: "DESC" },
    });

    logger.debug(
      `ReferralService.getPromotionUsagesByUser: Found ${usages.length} promotion usages for user ID ${userId}.`,
    );

    return usages.map((usage) => ({
      promotionCode: usage.promotionCode.code,
      userId: usage.user.id,
      usedAt: usage.usedAt,
    }));
  }
}
