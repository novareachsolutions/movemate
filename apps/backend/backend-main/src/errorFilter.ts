import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

import { UserFacingError } from "./shared/errors/userFacing";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost): Response {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorResponse: any;

    if (exception instanceof UserFacingError) {
      status = exception.statusCode;
      errorResponse = {
        success: false,
        message: exception.message,
        data: null,
        error: {
          name: exception.name,
          message: exception.message,
          code: status,
        },
      };

      this.logger.warn(
        `${exception.name}: ${exception.message} - ${request.method} ${request.url}`,
      );
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        success: false,
        message:
          typeof exceptionResponse === "string"
            ? exceptionResponse
            : (exceptionResponse as any).message,
        data: null,
        error: {
          name: exception.name,
          message:
            typeof exceptionResponse === "string"
              ? exceptionResponse
              : (exceptionResponse as any).message,
          code: status,
        },
      };

      if (status >= 500) {
        this.logger.error(
          `${exception.name}: ${errorResponse.message} - ${request.method} ${request.url}`,
          exception instanceof Error ? exception.stack : undefined,
        );
      } else {
        this.logger.warn(
          `${exception.name}: ${errorResponse.message} - ${request.method} ${request.url}`,
        );
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        success: false,
        message: "Internal Server Error",
        data: null,
        error: {
          name: "InternalServerError",
          message: "An unexpected error occurred.",
          code: status,
        },
      };

      this.logger.error(
        `Unhandled Exception: ${exception instanceof Error ? exception.message : "Unknown error"} - ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Add request ID if available
    const requestId = request.headers["x-request-id"];
    if (requestId) {
      errorResponse.error.requestId = requestId;
    }

    return response.status(status).json(errorResponse);
  }
}
