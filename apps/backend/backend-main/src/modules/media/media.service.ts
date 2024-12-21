// src/media/media.service.ts

import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { logger } from '../../logger';

@Injectable()
export class MediaService {
  private readonly bucketName: string;

  constructor(
    @Inject('S3') private readonly s3: AWS.S3,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!this.bucketName) {
      throw new InternalServerErrorException('S3 Bucket name is not configured');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', 
    };

    try {
      const uploadResult: ManagedUpload.SendData = await this.s3.upload(params).promise();
      logger.debug(`File uploaded successfully. URL: ${uploadResult.Location}`);
      return uploadResult.Location;
    } catch (error) {
      logger.error('Error uploading file to S3', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<string> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
      logger.debug(`File with key ${key} deleted successfully.`);
      return `File with key ${key} deleted successfully.`;
    } catch (error) {
      logger.error(`Error deleting file with key ${key} from S3`, error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
