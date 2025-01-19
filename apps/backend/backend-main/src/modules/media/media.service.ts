import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from "aws-sdk";
import { ManagedUpload } from "aws-sdk/clients/s3";

import {
  MediaDeleteError,
  MediaInvalidKeyError,
  MediaMissingFileError,
  MediaUploadError,
} from "../../shared/errors/media";

@Injectable()
export class MediaService {
  private readonly bucketName: string;
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject("S3") private readonly s3: AWS.S3,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>("AWS_S3_BUCKET_NAME");
    if (!this.bucketName) {
      this.logger.error(
        "MediaService.constructor: S3 Bucket name is not configured",
      );
      throw new MediaInvalidKeyError("S3 Bucket name is not configured");
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      this.logger.error(
        "MediaService.uploadFile: No file was provided in the request.",
      );
      throw new MediaMissingFileError("No file was provided in the request.");
    }
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    try {
      const uploadResult: ManagedUpload.SendData = await this.s3
        .upload(params)
        .promise();
      this.logger.debug(
        `MediaService.uploadFile: File uploaded successfully. URL: ${uploadResult.Location}`,
      );
      return uploadResult.Location;
    } catch (error) {
      this.logger.error(
        "MediaService.uploadFile:  Error uploading file to S3",
        error,
      );
      throw new MediaUploadError("Failed to upload file");
    }
  }

  async deleteFile(key: string): Promise<string> {
    if (!key) {
      this.logger.error(
        "MediaService.deleteFile: File key is required for deletion",
      );
      throw new MediaInvalidKeyError("File key is required for deletion");
    }

    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
      this.logger.debug(
        `MediaService.deleteFile: File with key ${key} deleted successfully.`,
      );
      return `File with key ${key} deleted successfully.`;
    } catch (error) {
      this.logger.error(
        `MediaService.deleteFile: Error deleting file with key ${key} from S3`,
        error,
      );
      throw new MediaDeleteError(`Failed to delete file with key ${key}`);
    }
  }
}
