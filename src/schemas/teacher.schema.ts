import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email('must be a valid email')
  .transform((email) => email.toLowerCase());

export const registerSchema = z
  .object({
    teacher: emailSchema,
    students: z.array(emailSchema).nonempty('students cannot be empty')
  });

export type RegisterRequest = z.infer<typeof registerSchema>;

export const commonStudentsQuerySchema = z
  .object({
    teacher: z
      .union([z.string(), z.array(z.string())])
      .transform((value) => (Array.isArray(value) ? value : [value]))
      .pipe(z.array(emailSchema).nonempty('teacher query is required'))
  });

export type CommonStudentsQuery = z.infer<typeof commonStudentsQuerySchema>;

export const suspendSchema = z
  .object({
    student: emailSchema
  });

export type SuspendRequest = z.infer<typeof suspendSchema>;

export const retrieveForNotificationsSchema = z
  .object({
    teacher: emailSchema,
    notification: z.string().min(1, 'notification cannot be empty')
  });

export type RetrieveForNotificationsRequest = z.infer<typeof retrieveForNotificationsSchema>;
