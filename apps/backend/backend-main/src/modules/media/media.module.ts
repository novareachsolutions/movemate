import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    MediaService,
    {
      provide: 'S3',
      useFactory: (configService: ConfigService) => {
        return new AWS.S3({
          accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
          region: configService.get<string>('AWS_REGION'),
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
