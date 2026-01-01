import { z } from 'zod';

/**
 * Phase 1: Initial inquiry submission
 */
export const createOnboardingRequestSchema = z.object({
  body: z.object({
    businessName: z.string()
      .min(2, 'Business name must be at least 2 characters')
      .max(255, 'Business name too long'),
    email: z.string()
      .email('Invalid email address')
      .toLowerCase(),
    phoneNumber: z.string()
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
      .min(10, 'Phone number too short')
      .max(20, 'Phone number too long'),
    message: z.string()
      .max(1000, 'Message too long')
      .optional()
  })
});

/**
 * Phase 2: Admin approval
 */
export const approveOnboardingRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid request ID')
  })
});

/**
 * Phase 2: Admin rejection
 */
export const rejectOnboardingRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid request ID')
  }),
  body: z.object({
    rejectionReason: z.string()
      .min(10, 'Rejection reason must be at least 10 characters')
      .max(500, 'Rejection reason too long')
  })
});

/**
 * Phase 3: Token validation
 */
export const validateTokenSchema = z.object({
  params: z.object({
    token: z.string()
      .min(64, 'Invalid token format')
      .max(64, 'Invalid token format')
  })
});

/**
 * Phase 3: Complete registration
 */
export const completeRegistrationSchema = z.object({
  body: z.object({
    // Authentication
    token: z.string().min(64).max(64),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

    // Basic Information
    name: z.string().min(2).max(100),
    registrationNumber: z.string().min(1).max(100),
    categoryId: z.number().int().positive(),

    // Business Details
    businessType: z.string().min(1).max(100),
    yearEstablished: z.number()
      .int()
      .min(1900)
      .max(new Date().getFullYear()),
    location: z.string().min(1).max(100),
    teamSize: z.string().min(1).max(50),

    // Financial Information
    paidUpCapital: z.number().positive(),
    investmentCapacityMin: z.number().positive(),
    investmentCapacityMax: z.number().positive(),

    // Investment Parameters (optional)
    pricePerUnit: z.number().positive().optional(),
    expectedReturnOptions: z.string().max(255).optional(),
    estimatedMarketValuation: z.number().positive().optional(),
    ipoTimeHorizon: z.string().max(100).optional(),

    // Descriptions
    briefDescription: z.string().min(10).max(200),
    fullDescription: z.string().max(5000).optional(),
    vision: z.string().max(1000).optional(),
    mission: z.string().max(1000).optional(),
    growthPlans: z.string().max(2000).optional(),

    // Contact Information
    contactEmail: z.string().email().toLowerCase(),
    contactPhone: z.string().regex(/^[0-9+\-\s()]+$/).min(10).max(20),
    website: z.string().url().optional().or(z.literal('')),

    // Social Media (optional)
    facebookUrl: z.string().url().optional().or(z.literal('')),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    twitterUrl: z.string().url().optional().or(z.literal(''))
  }).refine(
    (data) => data.investmentCapacityMax >= data.investmentCapacityMin,
    {
      message: 'Maximum investment capacity must be greater than or equal to minimum',
      path: ['investmentCapacityMax']
    }
  )
});

/**
 * Query filters for listing onboarding requests
 */
export const listOnboardingRequestsSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'CONTACTED', 'APPROVED', 'REJECTED']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});
