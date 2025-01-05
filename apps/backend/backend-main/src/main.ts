import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import configuration from "./config/configuration";
import { CustomExceptionFilter } from "./errorFilter";

const configs = configuration();
async function bootstrap(): Promise<void> {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

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

  // Configure CORS
  app.enableCors({
    origin: configs.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });
  // Configure WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(configService.get<number>("port") ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
}
void bootstrap();
