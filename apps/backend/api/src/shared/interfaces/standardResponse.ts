export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
