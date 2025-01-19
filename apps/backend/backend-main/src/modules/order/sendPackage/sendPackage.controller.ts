import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { OrderReview } from "../../../entity/OrderReview";
import { Report } from "../../../entity/Report";
import { SendPackageOrder } from "../../../entity/SendPackageOrder";
import { Roles } from "../../../shared/decorators/roles.decorator";
import { UserRoleEnum } from "../../../shared/enums";
import { AuthGuard } from "../../../shared/guards/auth.guard";
import { IApiResponse, ICustomRequest } from "../../../shared/interface";
import { SendAPackageService } from "./sendPackage.service";
import { TSendPackageOrder } from "./sendPackage.types";

@Controller("order/send-package")
@UseGuards(AuthGuard)
export class SendPackageController {
  constructor(private readonly sendPackageService: SendAPackageService) {}

  @Post("create")
  @Roles(UserRoleEnum.CUSTOMER)
  async createSendPackageOrder(
    @Body() data: TSendPackageOrder,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<SendPackageOrder>> {
    const customerId = request.user.id;
    const createdOrder = await this.sendPackageService.create({
      ...data,
      customerId,
    });
    return {
      success: true,
      message: "Send package order created successfully.",
      data: createdOrder,
    };
  }

  @Post(":orderId/cancel")
  @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN)
  async cancelOrder(
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body("reason") reason: string,
  ): Promise<IApiResponse<SendPackageOrder>> {
    const data = await this.sendPackageService.cancelOrder(orderId, reason);
    return {
      success: true,
      message: "Order canceled successfully.",
      data,
    };
  }

  @Post(":orderId/reportagent")
  @Roles(UserRoleEnum.CUSTOMER)
  async reportAgent(
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body("reason") reason: string,
    @Body("details") details: string,
  ): Promise<IApiResponse<Report>> {
    const data = await this.sendPackageService.reportAgent(
      orderId,
      reason,
      details,
    );
    return {
      success: true,
      message: "Agent reported successfully.",
      data,
    };
  }

  @Post(":orderId/review")
  @Roles(UserRoleEnum.CUSTOMER)
  async leaveReview(
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body("rating") rating: number,
    @Body("comment") comment: string,
  ): Promise<IApiResponse<OrderReview>> {
    const data = await this.sendPackageService.leaveReview(
      orderId,
      rating,
      comment,
    );
    return {
      success: true,
      message: "Review submitted successfully.",
      data,
    };
  }

  @Get(":orderId")
  @Roles(UserRoleEnum.CUSTOMER, UserRoleEnum.AGENT)
  async getOrderDetails(
    @Param("orderId", ParseIntPipe) orderId: number,
  ): Promise<IApiResponse<SendPackageOrder>> {
    const data = await this.sendPackageService.getOrderDetails(orderId);
    return {
      success: true,
      message: "Order details retrieved successfully.",
      data,
    };
  }

  // ====== Agent APIs ======

  @Post("agent/:orderId/accept")
  @Roles(UserRoleEnum.AGENT)
  async acceptOrder(
    @Param("orderId", ParseIntPipe) orderId: number,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<SendPackageOrder>> {
    const agentId = request.user.agent.id;
    const data = await this.sendPackageService.acceptOrder(orderId, agentId);
    return {
      success: true,
      message: "Order accepted successfully.",
      data,
    };
  }

  @Post("agent/:orderId/start")
  @Roles(UserRoleEnum.AGENT)
  async startOrder(
    @Param("orderId", ParseIntPipe) orderId: number,
    @Req() request: ICustomRequest,
  ): Promise<IApiResponse<SendPackageOrder>> {
    const agentId = request.user.agent.id;
    const data = await this.sendPackageService.startOrder(orderId, agentId);
    return {
      success: true,
      message: "Order started successfully.",
      data,
    };
  }

  @Post("agent/:orderId/complete")
  @Roles(UserRoleEnum.AGENT)
  async completeOrder(
    @Param("orderId", ParseIntPipe) orderId: number,
  ): Promise<IApiResponse<SendPackageOrder>> {
    const data = await this.sendPackageService.completeOrder(orderId);
    return {
      success: true,
      message: "Order completed successfully.",
      data,
    };
  }

  @Post("agent/:orderId/cancel")
  @Roles(UserRoleEnum.AGENT)
  async agentCancelOrder(
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body("reason") reason: string,
  ): Promise<IApiResponse<SendPackageOrder>> {
    const data = await this.sendPackageService.agentCancelOrder(
      orderId,
      reason,
    );
    return {
      success: true,
      message: "Order canceled successfully by agent.",
      data,
    };
  }

  @Post("agent/:orderId/report")
  @Roles(UserRoleEnum.AGENT)
  async reportIssue(
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body("issue") issue: string,
  ): Promise<IApiResponse<Report>> {
    const data = await this.sendPackageService.reportIssue(orderId, issue);
    return {
      success: true,
      message: "Issue reported successfully.",
      data,
    };
  }

  // ====== Admin APIs ======

  @Get("admin/orders")
  @Roles(UserRoleEnum.ADMIN)
  async getAllOrders(
    @Query() query: any,
  ): Promise<IApiResponse<SendPackageOrder[]>> {
    const data = await this.sendPackageService.getAllOrders(query);
    return {
      success: true,
      message: "All orders retrieved successfully.",
      data,
    };
  }
}
