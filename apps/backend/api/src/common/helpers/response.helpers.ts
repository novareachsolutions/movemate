import { StandardResponse } from 'src/shared/interfaces/standardResponse';

export function createResponse<T>(
  success: boolean,
  message: string,
  data: T,
): StandardResponse<T> {
  return { success, message, data };
}
