import { Controller, Get } from "@nestjs/common";
import { HealthCheckResult } from "@nestjs/terminus";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  checkHealth(): Promise<HealthCheckResult> {
    return this.appService.check();
  }
}
