export interface ICustomRequest extends Request {
  userId?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error?: {
    message: string;
    code: number;
  };
  message: string;
  success: boolean;
}
