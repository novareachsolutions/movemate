import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { CustomExceptionFilter } from "./errorFilter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Apply the global exception filter
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(configService.get<number>("port") ?? 3000);
}
void bootstrap();
