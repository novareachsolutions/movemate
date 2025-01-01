import { Module } from "@nestjs/common";
import * as AWS from "aws-sdk";

@Module({
  providers: [
    {
      provide: "S3",
      useFactory: (): AWS.S3 => {
        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION,
        });
        return s3;
      },
    },
  ],
  exports: ["S3"],
})
export class AwsModule {}
