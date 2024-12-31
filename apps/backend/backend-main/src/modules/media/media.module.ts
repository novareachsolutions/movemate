import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as AWS from "aws-sdk";

import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

@Module({
  imports: [ConfigModule],
  providers: [
    MediaService,
    {
      provide: "S3",
      useFactory: (configService: ConfigService): any => {
        return new AWS.S3({
          accessKeyId: configService.get<string>("AWS_ACCESS_KEY_ID"),
          secretAccessKey: configService.get<string>("AWS_SECRET_ACCESS_KEY"),
          region: configService.get<string>("AWS_REGION"),
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
