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
    phoneNumber: z.string(),
    email: z.string().optional(),
    message: z.string()
      .max(1000, 'Message is too long')
      .optional(),
    hasConsent: z.boolean()
      .default(true)
  })
});
