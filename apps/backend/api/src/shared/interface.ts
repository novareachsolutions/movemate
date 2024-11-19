export interface ICustomRequest extends Request {
  userId?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error?: {
    message: string;
    code: number;
  };
}
