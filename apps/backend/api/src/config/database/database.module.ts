import { Module, OnModuleInit } from '@nestjs/common';

import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnModuleInit {
  // Initialize DatabaseService when the module is initialized
  async onModuleInit() {
    await DatabaseService.initialize();
  }

  // Ensure that DatabaseService is cleaned up when the module is destroyed
  async onModuleDestroy() {
    await DatabaseService.stop();
  }
}
