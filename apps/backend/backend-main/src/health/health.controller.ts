import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
} from "@nestjs/terminus";

import { HealthCheckResponseDto } from "../utils/app.dto";

@Controller("health")
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private httpHealthIndicator: HttpHealthIndicator,
  ) {}

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
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      // HTTP health check
      async (): Promise<any> =>
        await this.httpHealthIndicator.pingCheck(
          "nestjs-docs",
          "https://docs.nestjs.com",
        ),
      // TODO: Database (TypeORM) health check
    ]);
  }
}
