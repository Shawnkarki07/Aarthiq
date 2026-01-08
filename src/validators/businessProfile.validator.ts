import { z } from 'zod';

/**
 * Update business profile validation
 */
export const updateBusinessProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Business name must be at least 2 characters')
      .max(100, 'Business name is too long')
      .optional(),
    businessType: z.string()
      .max(100, 'Business type is too long')
      .optional(),
    yearEstablished: z.number()
      .int('Year must be an integer')
      .min(1900, 'Year must be after 1900')
      .max(new Date().getFullYear(), 'Year cannot be in the future')
      .optional(),
    location: z.string()
      .max(100, 'Location is too long')
      .optional(),
    teamSize: z.string()
      .max(50, 'Team size description is too long')
      .optional(),
    paidUpCapital: z.number()
      .nonnegative('Paid up capital must be non-negative')
      .optional(),
    investmentCapacityMin: z.number()
      .nonnegative('Investment capacity must be non-negative')
      .optional(),
    investmentCapacityMax: z.number()
      .nonnegative('Investment capacity must be non-negative')
      .optional(),
    minimumInvestmentUnits: z.number()
      .int('Minimum investment units must be an integer')
      .nonnegative('Minimum investment units must be non-negative')
      .optional(),
    maximumInvestmentUnits: z.number()
      .int('Maximum investment units must be an integer')
      .nonnegative('Maximum investment units must be non-negative')
      .optional(),
    pricePerUnit: z.number()
      .nonnegative('Price per unit must be non-negative')
      .optional(),
    expectedReturnOptions: z.string()
      .max(255, 'Expected return options is too long')
      .optional(),
    estimatedMarketValuation: z.number()
      .nonnegative('Market valuation must be non-negative')
      .optional(),
    ipoTimeHorizon: z.string()
      .max(100, 'IPO time horizon is too long')
      .optional(),
    briefDescription: z.string()
      .min(10, 'Brief description must be at least 10 characters')
      .max(200, 'Brief description is too long')
      .optional(),
    fullDescription: z.string()
      .max(5000, 'Full description is too long')
      .optional(),
    vision: z.string()
      .max(1000, 'Vision is too long')
      .optional(),
    mission: z.string()
      .max(1000, 'Mission is too long')
      .optional(),
    growthPlans: z.string()
      .max(2000, 'Growth plans is too long')
      .optional(),
    contactEmail: z.string()
      .email('Invalid email address')
      .max(255, 'Email is too long')
      .optional(),
    contactPhone: z.string()
      .max(20, 'Phone number is too long')
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
      .optional(),
    website: z.string()
      .url('Invalid website URL')
      .max(255, 'Website URL is too long')
      .optional(),
    facebookUrl: z.string()
      .url('Invalid Facebook URL')
      .max(255, 'Facebook URL is too long')
      .optional(),
    linkedinUrl: z.string()
      .url('Invalid LinkedIn URL')
      .max(255, 'LinkedIn URL is too long')
      .optional(),
    twitterUrl: z.string()
      .url('Invalid Twitter URL')
      .max(255, 'Twitter URL is too long')
      .optional()
  }).refine(
    (data) => {
      if (data.investmentCapacityMin !== undefined && data.investmentCapacityMax !== undefined) {
        return data.investmentCapacityMin <= data.investmentCapacityMax;
      }
      return true;
    },
    {
      message: 'Minimum investment capacity cannot be greater than maximum',
      path: ['investmentCapacityMin']
    }
  ).refine(
    (data) => {
      if (data.minimumInvestmentUnits !== undefined && data.maximumInvestmentUnits !== undefined) {
        return data.minimumInvestmentUnits <= data.maximumInvestmentUnits;
      }
      return true;
    },
    {
      message: 'Minimum investment units cannot be greater than maximum',
      path: ['minimumInvestmentUnits']
    }
  )
});

/**
 * Query filters for listing interests
 */
export const listInterestsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

/**
 * Change password validation
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'Password is too long')
  })
});

/**
 * Request removal validation
 */
export const requestRemovalSchema = z.object({
  body: z.object({
    reason: z.string()
      .max(500, 'Reason is too long')
      .optional()
  })
});
