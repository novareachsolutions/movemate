import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { CustomExceptionFilter } from "./errorFilter";

async function bootstrap(): Promise<void> {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Apply the global exception filter
  app.useGlobalFilters(new CustomExceptionFilter());

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle("API Documentation")
    .setDescription("API endpoints for the application")
    .setVersion("1.0")
    .addBearerAuth() // Add Bearer token for secured endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(configService.get<number>("port") ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
}
void bootstrap();
