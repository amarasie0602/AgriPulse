import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(80, 'Name must be 80 characters or fewer.'),
    email: z.string().trim().email('Enter a valid email address.').max(255),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must be 128 characters or fewer.'),
    farmName: z.string().trim().max(80, 'Farm name must be 80 characters or fewer.').optional(),
  })
  .strict(); // Unknown fields are rejected (-> 400), matching the frontend's whitelisted payload.

export const loginSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email address.').max(255),
    password: z.string().min(1, 'Password is required.'),
  })
  .strict();

export const googleAuthSchema = z
  .object({
    // The ID token (JWT) returned by Google Identity Services on the frontend.
    credential: z.string().min(1, 'Missing Google credential.'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
