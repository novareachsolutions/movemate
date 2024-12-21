import cookieParser from 'cookie-parser';
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { CustomExceptionFilter } from "./errorFilter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.useGlobalFilters(new CustomExceptionFilter());
  app.use(cookieParser());

  await app.listen(configService.get<number>("port") ?? 3000);
}
void bootstrap();
