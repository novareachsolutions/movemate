// src/media/media.controller.ts

import {
    Controller,
    Post,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { MediaService } from './media.service';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { Express } from 'express';
  
  @Controller('media')
  export class MediaController {
    constructor(private readonly mediaService: MediaService) {}
  
    /**
     * Endpoint to upload a file
     * @param file The file to upload
     * @returns URL of the uploaded file
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadMedia(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
      if (!file) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }
  
      const url = await this.mediaService.uploadFile(file);
      return { url };
    }
  
    /**
     * Endpoint to delete a file
     * @param key The S3 key of the file to delete
     * @returns Success message
     */
    @Delete(':key')
    async deleteMedia(@Param('key') key: string): Promise<{ message: string }> {
      if (!key) {
        throw new HttpException('File key is required', HttpStatus.BAD_REQUEST);
      }
  
      const message = await this.mediaService.deleteFile(key);
      return { message };
    }
  }
  