import { Injectable } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
} from "@nestjs/terminus";

@Injectable()
export class AppService {
  constructor(
    private healthCheckService: HealthCheckService,
    private httpHealthIndicator: HttpHealthIndicator,
  ) {}

  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      async (): Promise<any> =>
        await this.httpHealthIndicator.pingCheck(
          "nestjs-docs",
          "https://docs.nestjs.com",
        ),
    ]);
  }
}
