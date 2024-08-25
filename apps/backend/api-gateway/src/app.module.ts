import { Module, MiddlewareConsumer } from '@nestjs/common';
import { LoggingMiddleware } from './middlewares/logging.middleware';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');
  }
}
