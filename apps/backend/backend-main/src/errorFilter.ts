import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";

import { logger } from "./logger";
import { UserFacingError } from "./shared/errors/userFacing";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof UserFacingError ? exception.statusCode : 500;

    // For user-facing errors, send the exception message and status code
    if (exception instanceof UserFacingError) {
      return response.status(status).json({
        success: false,
        message: exception.message,
        data: null,
        error: {
          name: exception.name,
          message: exception.message,
          code: status,
        },
      });
    }

    // For other errors, send a generic internal server error response
    logger.error("CustomExceptionFilter: Internal Server Error", exception);
    return response.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
      error: {
        message: "An unexpected error occurred.",
        code: 500,
      },
    });
  }
}
