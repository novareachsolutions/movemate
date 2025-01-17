import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
} from "@nestjs/terminus";

import { HealthGetSwaggerer } from "../shared/decorators/health/health.decorators";

@Controller("health")
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private httpHealthIndicator: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthGetSwaggerer()
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
