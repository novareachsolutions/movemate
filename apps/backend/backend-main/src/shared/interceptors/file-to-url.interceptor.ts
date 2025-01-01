import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { MediaService } from "../../modules/media/media.service";

@Injectable()
export class FileToUrlInterceptor implements NestInterceptor {
  constructor(private readonly mediaService: MediaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (!request.file) {
      throw new BadRequestException("File is required.");
    }

    try {
      const fileUrl = await this.mediaService.uploadFile(request.file);
      request.body.url = fileUrl;

      return next.handle().pipe(
        map((data) => {
          return { ...data, fileUrl };
        }),
        catchError(async (error) => {
          const key = this.extractKeyFromUrl(fileUrl);
          if (key) {
            await this.mediaService.deleteFile(key);
          }
          throw error;
        }),
      );
    } catch (error) {
      throw new BadRequestException(`File processing failed: ${error.message}`);
    }
  }

  private extractKeyFromUrl(fileUrl: string): string {
    const urlParts = fileUrl.split("/");
    return urlParts[urlParts.length - 1];
  }
}
