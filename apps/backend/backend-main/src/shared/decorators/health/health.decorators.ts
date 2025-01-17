import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

import { HealthCheckResponseDto } from "../../../utils/app.dto";

export const HealthGetSwaggerer = (): any => {
  return applyDecorators(
    ApiOperation({
      summary: "Health Check",
      description:
        "Check the health status of the application and its dependencies",
    }),
    ApiResponse({
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
    }),
    ApiResponse({
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
    }),
  );
};
