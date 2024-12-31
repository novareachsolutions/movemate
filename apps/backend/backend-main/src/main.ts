import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { CustomExceptionFilter } from "./errorFilter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle("API Documentation of Vamoose")
    .setDescription("API endpoints for the Vamoose application")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.use(
    "/docs",
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  app.useGlobalFilters(new CustomExceptionFilter());
  app.use(cookieParser());

  await app.listen(configService.get<number>("port") ?? 3000);
}
void bootstrap();
