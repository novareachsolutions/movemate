import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheckResult } from "@nestjs/terminus";

import { AppService } from "./app.service";
import { HealthCheckResponseDto } from "./utils/app.dto";
@ApiTags("Health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Health Check",
    description:
      "Check the health status of the application and its dependencies",
  })
  @ApiResponse({
    status: 200,
    description: "Application is healthy",
    type: HealthCheckResponseDto,
    schema: {
      example: {
        status: "ok",
        info: {
          "nestjs-docs": {
            status: "up",
          },
        },
        error: {},
        details: {
          "nestjs-docs": {
            status: "up",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: "Service is unhealthy",
    schema: {
      example: {
        status: "error",
        info: {},
        error: {
          "nestjs-docs": {
            status: "down",
            message: "Failed to connect to service",
          },
        },
        details: {
          "nestjs-docs": {
            status: "down",
            message: "Failed to connect to service",
          },
        },
      },
    },
  })
  checkHealth(): Promise<HealthCheckResult> {
    return this.appService.check();
  }
}
