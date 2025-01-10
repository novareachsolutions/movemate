import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";

import { Roles } from "../../shared/decorators/roles.decorator";
import { UserRoleEnum } from "../../shared/enums";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { IApiResponse } from "../../shared/interface";
import { ReferralService } from "./referral.service";
import {
  TCreatePromotionCode,
  TCreateReferral,
  TPromotionUsage,
  TReferral,
  TReferralCode,
  TUpdatePromotionCode,
  TUsePromotionCode,
} from "./referral.types";

@Controller("referrals")
@UseGuards(AuthGuard)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post("generate/:userId")
  @Roles(UserRoleEnum.ADMIN)
  async generateReferralCode(
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<IApiResponse<TReferralCode>> {
    const referralCode =
      await this.referralService.generateReferralCode(userId);
    return {
      success: true,
      message: "Referral code generated successfully.",
      data: referralCode,
    };
  }

  @Get("codes/:userId")
  @Roles(UserRoleEnum.ADMIN)
  async getReferralCodes(
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<IApiResponse<TReferralCode[]>> {
    const referralCodes = await this.referralService.getReferralCodes(userId);
    return {
      success: true,
      message: "Referral codes retrieved successfully.",
      data: referralCodes,
    };
  }

  @Post("create")
  @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.AGENT, UserRoleEnum.ADMIN)
  async createReferral(
    @Body() createReferralDto: TCreateReferral,
  ): Promise<IApiResponse<TReferral>> {
    const referral =
      await this.referralService.createReferral(createReferralDto);
    return {
      success: true,
      message: "Referral created successfully.",
      data: referral,
    };
  }

  @Get("referrer/:referrerId")
  @Roles(UserRoleEnum.ADMIN)
  async getReferralsByReferrer(
    @Param("referrerId", ParseIntPipe) referrerId: number,
  ): Promise<IApiResponse<TReferral[]>> {
    const referrals =
      await this.referralService.getReferralsByReferrer(referrerId);
    return {
      success: true,
      message: "Referrals retrieved successfully.",
      data: referrals,
    };
  }

  @Get("all")
  @Roles(UserRoleEnum.ADMIN)
  async getAllReferrals(): Promise<IApiResponse<TReferral[]>> {
    const referrals = await this.referralService.getAllReferrals();
    return {
      success: true,
      message: "All referrals retrieved successfully.",
      data: referrals,
    };
  }

  @Get("details/:referredUserId")
  @Roles(UserRoleEnum.ADMIN)
  async getReferralDetails(
    @Param("referredUserId", ParseIntPipe) referredUserId: number,
  ): Promise<IApiResponse<TReferral>> {
    const referral =
      await this.referralService.getReferralDetails(referredUserId);
    return {
      success: true,
      message: "Referral details retrieved successfully.",
      data: referral,
    };
  }

  // ===== Promotion Code Management =====

  @Post("promotions/create")
  @Roles(UserRoleEnum.ADMIN)
  async createPromotionCode(
    @Body() createPromotionDto: TCreatePromotionCode,
  ): Promise<IApiResponse<any>> {
    // Replace 'any' with appropriate type if needed
    const promotionCode =
      await this.referralService.createPromotionCode(createPromotionDto);
    return {
      success: true,
      message: "Promotion code created successfully.",
      data: promotionCode,
    };
  }

  @Get("promotions/:code")
  @Roles(UserRoleEnum.ADMIN)
  async getPromotionCode(
    @Param("code") code: string,
  ): Promise<IApiResponse<any>> {
    // Replace 'any' with appropriate type if needed
    const promotionCode =
      await this.referralService.getPromotionCodeByCode(code);
    return {
      success: true,
      message: "Promotion code retrieved successfully.",
      data: promotionCode,
    };
  }

  @Put("promotions/:code")
  @Roles(UserRoleEnum.ADMIN)
  async updatePromotionCode(
    @Param("code") code: string,
    @Body() updatePromotionDto: TUpdatePromotionCode,
  ): Promise<IApiResponse<any>> {
    // Replace 'any' with appropriate type if needed
    const updatedPromotion = await this.referralService.updatePromotionCode(
      code,
      updatePromotionDto,
    );
    return {
      success: true,
      message: "Promotion code updated successfully.",
      data: updatedPromotion,
    };
  }

  @Delete("promotions/:code")
  @Roles(UserRoleEnum.ADMIN)
  async deletePromotionCode(
    @Param("code") code: string,
  ): Promise<IApiResponse<null>> {
    await this.referralService.deletePromotionCode(code);
    return {
      success: true,
      message: "Promotion code deleted successfully.",
      data: null,
    };
  }

  @Post("promotions/apply")
  @Roles(UserRoleEnum.ADMIN)
  async applyPromotionCode(
    @Body() usePromotionDto: TUsePromotionCode,
  ): Promise<IApiResponse<TPromotionUsage>> {
    const promotionUsage =
      await this.referralService.applyPromotionCode(usePromotionDto);
    return {
      success: true,
      message: "Promotion code applied successfully.",
      data: promotionUsage,
    };
  }

  @Get("promotions/usage/:userId")
  @Roles(UserRoleEnum.ADMIN)
  async getPromotionUsagesByUser(
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<IApiResponse<TPromotionUsage[]>> {
    const usages = await this.referralService.getPromotionUsagesByUser(userId);
    return {
      success: true,
      message: "Promotion usages retrieved successfully.",
      data: usages,
    };
  }
}
