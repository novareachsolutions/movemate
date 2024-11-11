// src/modules/agent/agent.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../../entity/Agent';
import { AgentDocument } from '../../entity/AgentDocument';
import { Order } from '../../entity/Order';
import { Review } from '../../entity/Review';
import { RequiredDoc } from '../../entity/RequiredDoc';
import { ConfigModule } from '@nestjs/config';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agent,
      AgentDocument,
      Order,
      Review,
      RequiredDoc,
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
