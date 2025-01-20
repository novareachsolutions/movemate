import {
  Controller,
  Delete,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";

import { MediaService } from "./media.service";

@Controller("media")
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    this.logger.debug(`MediaController.uploadMedia: Uploading media`);
    const url = await this.mediaService.uploadFile(file);
    this.logger.log(
      `MediaController.uploadMedia: Media uploaded successfully to ${url}`,
    );
    return { url };
  }

  @Delete(":key")
  async deleteMedia(@Param("key") key: string): Promise<{ message: string }> {
    this.logger.debug(`MediaController.deleteMedia: Deleting media for ${key}`);
    const message = await this.mediaService.deleteFile(key);
    this.logger.log(
      `MediaController.deleteMedia: Media deleted successfully for ${key}`,
    );
    return { message };
  }
}
