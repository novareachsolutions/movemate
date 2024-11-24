import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { CustomExceptionFilter } from './errorFilter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Apply the global exception filter
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
