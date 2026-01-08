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
 * Updated to match Register.tsx frontend field names
 */
export const completeRegistrationSchema = z.object({
  body: z.object({
    // Authentication
    token: z.string().min(64).max(64),
    password: z.string()
      .min(8, 'Password must be at least 8 characters'),

    // Company Information (Required)
    companyName: z.string().min(2, 'Company name must be at least 2 characters').max(255),
    registrationNumber: z.string().min(1, 'Registration number is required').max(100),
    industry: z.string().min(1, 'Industry is required').max(100),

    // Company Information (Optional)
    panNumber: z.string().max(50).optional().or(z.literal('')),
    foundedYear: z.string().max(4).optional().or(z.literal('')),
    companySize: z.string().max(50).optional().or(z.literal('')),

    // Contact Information (Required)
    email: z.string().email('Invalid email address').toLowerCase(),
    phone: z.string().min(10, 'Phone number must be at least 10 characters').max(20),
    address: z.string().min(1, 'Street address is required').max(255),
    city: z.string().min(1, 'City is required').max(100),
    district: z.string().min(1, 'District is required').max(100),

    // Contact Information (Optional)
    website: z.string().optional(),

    // Business Details (Required)
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),

    // Business Details (Optional)
    vision: z.string().max(1000, 'Vision is too long').optional(),
    mission: z.string().max(1000, 'Mission is too long').optional(),
    fundingStage: z.string().optional(),
    investmentSought: z.string().optional(),
    useOfFunds: z.string().optional(),
    revenueModel: z.string().optional(),

    // Investment Parameters (Optional)
    minimumInvestmentUnits: z.string().optional(),
    maximumInvestmentUnits: z.string().optional(),
    pricePerUnit: z.string().optional(),
    expectedReturnOptions: z.string().optional(),
    estimatedMarketValuation: z.string().optional(),
    ipoTimeHorizon: z.string().optional(),

    // Social Media (Optional)
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional()
  }).strip() // Strip unknown fields like confirmPassword and acceptTerms (frontend-only validation)
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
