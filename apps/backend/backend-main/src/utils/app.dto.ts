import { ApiProperty } from "@nestjs/swagger";

export class HealthCheckResponseDto {
  @ApiProperty({
    example: "ok",
    description: "Overall health status",
    enum: ["ok", "error"],
  })
  status: string;

  @ApiProperty({
    example: {
      "nestjs-docs": {
        status: "up",
      },
    },
    description: "Health information for each service",
  })
  info: Record<string, { status: string }>;

  @ApiProperty({
    example: {},
    description: "Error information if any service is down",
  })
  error: Record<string, any>;

  @ApiProperty({
    example: {
      "nestjs-docs": {
        status: "up",
      },
    },
    description: "Detailed health status for each service",
  })
  details: Record<string, { status: string }>;
}
