export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    statusCode: number;
  }
  
  export class ResponseUtil {
    static success<T>(message: string, data?: T): ApiResponse<T> {
      return {
        success: true,
        message,
        data,
        statusCode: 200,
      };
    }
  
    static error(message: string, statusCode: number): ApiResponse<null> {
      return {
        success: false,
        message,
        statusCode,
      };
    }
  }
  