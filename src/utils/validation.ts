import { z, ZodError } from 'zod';
import { AppError } from './errors';

const getValidationMessage = (error: ZodError): string => {
  const flattened = error.flatten();
  const formErrors = flattened.formErrors;
  const fieldErrors = Object.values(flattened.fieldErrors).flat();
  return [...formErrors, ...fieldErrors].join(', ') || 'Invalid request payload';
};

export const validate = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown
): z.infer<TSchema> => {
  try {
    return schema.parse(input);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw new AppError(400, getValidationMessage(error));
    }

    throw error;
  }
};
