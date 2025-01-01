import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AwsModule } from "./aws.module";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

@Module({
  imports: [ConfigModule, AwsModule],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
