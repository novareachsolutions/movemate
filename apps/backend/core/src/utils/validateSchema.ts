import { ZodSchema } from 'zod';

export const validateSchema = (schema: ZodSchema, data: any) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error('Validation failed');
  }
  return result.data;
};
