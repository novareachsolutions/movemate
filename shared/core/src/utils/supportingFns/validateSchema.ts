import { ZodError, ZodSchema } from "zod";


const validateWithSafeParse = <T>(schema: ZodSchema<T>, data: any): { isValid: boolean; errors?: ZodError<T> } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { isValid: true };
  } else {
    return { isValid: false, errors: result.error };
  }
};


const validateWithParse = <T>(schema: ZodSchema<T>, data: any): T => {
  return schema.parse(data);
};

export { validateWithParse, validateWithSafeParse };
