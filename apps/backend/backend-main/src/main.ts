import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";

import { AppModule } from "./app.module";
import configuration from "./config/configuration";
import { CustomExceptionFilter } from "./errorFilter";

const config = configuration();
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const docConfig = new DocumentBuilder()
    .setTitle("API Documentation of Vamoose")
    .setDescription("API endpoints for the Vamoose application")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  app.use(
    "/docs",
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  app.useGlobalFilters(new CustomExceptionFilter());

  // Configure CORS
  app.enableCors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });
  // Configure WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(config.port ?? 3000);
}
void bootstrap();
