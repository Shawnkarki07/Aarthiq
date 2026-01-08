import { z } from 'zod';

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address')
      .toLowerCase(),
    password: z.string()
      .min(1, 'Password is required')
  })
});
