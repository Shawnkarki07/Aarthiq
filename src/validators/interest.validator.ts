import { z } from 'zod';

/**
 * Submit interest form validation
 */
export const submitInterestSchema = z.object({
  body: z.object({
    businessId: z.string().uuid('Invalid business ID'),
    investorName: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long'),
    phoneNumber: z.string()
      .min(10, 'Phone number must be at least 10 digits')
      .max(20, 'Phone number is too long')
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
    email: z.string()
      .email('Invalid email address')
      .max(255, 'Email is too long')
      .transform(val => val.toLowerCase()),
    message: z.string()
      .max(1000, 'Message is too long')
      .optional(),
    hasConsent: z.boolean()
      .default(true)
  })
});
