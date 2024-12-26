import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";

import { AppModule } from "./app.module";
import configuration from "./config/configuration";
import { CustomExceptionFilter } from "./errorFilter";

const config = configuration();
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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
