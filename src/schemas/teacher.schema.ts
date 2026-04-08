import { z } from 'zod';

const normalizedEmailSchema = z
  .string()
  .trim()
  .min(1, 'email cannot be empty')
  .email('must be a valid email')
  .transform((email) => email.toLowerCase());

export const registerSchema = z.object({
  teacher: z.preprocess(
    (value) => (value === undefined ? undefined : value),
    z
      .string({ required_error: 'teacher email is required' })
      .trim()
      .min(1, 'teacher email cannot be empty')
      .email('must be a valid email')
      .transform((email) => email.toLowerCase())
  ),
  students: z
    .array(
      z
        .string({ required_error: 'student email is required' })
        .trim()
        .min(1, 'student email cannot be empty')
        .email('must be a valid email')
        .transform((email) => email.toLowerCase()),
      { required_error: 'student email is required' }
    )
    .nonempty('students cannot be empty')
});

export type RegisterRequest = z.infer<typeof registerSchema>;

export const commonStudentsQuerySchema = z.object({
  teacher: z.preprocess((value) => {
    if (value === undefined) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }, z.array(normalizedEmailSchema).nonempty('teacher email is required'))
});

export type CommonStudentsQuery = z.infer<typeof commonStudentsQuerySchema>;

export const suspendSchema = z.object({
  student: z
    .string({ required_error: 'student email is required' })
    .trim()
    .min(1, 'student email cannot be empty')
    .email('must be a valid email')
    .transform((email) => email.toLowerCase())
});

export type SuspendRequest = z.infer<typeof suspendSchema>;

export const retrieveForNotificationsSchema = z.object({
  teacher: z
    .string({ required_error: 'teacher email is required' })
    .trim()
    .min(1, 'teacher email cannot be empty')
    .email('must be a valid email')
    .transform((email) => email.toLowerCase()),
  notification: z
    .string({ required_error: 'notification is required' })
    .trim()
    .min(1, 'notification cannot be empty')
});

export type RetrieveForNotificationsRequest = z.infer<typeof retrieveForNotificationsSchema>;
