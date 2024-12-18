import { UserRoleEnum } from "./enums";

export interface ICustomRequest extends Request {
  user: {
    id?: number;
    phoneNumber?: string;
    role?: UserRoleEnum;
  }
}

export interface IApiResponse<T> {
  data: T | null;
  error?: {
    name:string
    message: string;
    code: number;
  };
  message: string;
  success: boolean;
}
