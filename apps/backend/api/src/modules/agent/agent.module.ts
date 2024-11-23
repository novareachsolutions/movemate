import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
