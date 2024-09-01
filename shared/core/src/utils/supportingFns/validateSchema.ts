import { ZodError, ZodSchema } from "zod";


export const validateWithSafeParse = <T>(schema: ZodSchema<T>, data: any): { isValid: boolean; error?: ZodError<T> } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { isValid: true };
  } else {
    return { isValid: false, error: result.error };
  }
};

export const validateWithParse = <T>(schema: ZodSchema<T>, data: any): T => {
  return schema.parse(data);
};

