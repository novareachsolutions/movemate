import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    const url = await this.mediaService.uploadFile(file);
    return { url };
  }

  @Delete(':key')
  async deleteMedia(@Param('key') key: string): Promise<{ message: string }> {
    const message = await this.mediaService.deleteFile(key);
    return { message };
  }
}
