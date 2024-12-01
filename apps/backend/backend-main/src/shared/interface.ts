export interface ICustomRequest extends Request {
  userId?: number;
}

export interface IApiResponse<T> {
  data: T | null;
  error?: {
    message: string;
    code: number;
  };
  message: string;
  success: boolean;
}
