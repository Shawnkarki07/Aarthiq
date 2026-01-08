import { z } from 'zod';

/**
 * Phase 4: Admin approval of business
 */
export const approveBusinessSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid business ID')
  })
});

/**
 * Phase 4: Admin rejection of business
 */
export const rejectBusinessSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid business ID')
  }),
  body: z.object({
    rejectionReason: z.string()
      .min(10, 'Rejection reason must be at least 10 characters')
      .max(500, 'Rejection reason too long')
  })
});

/**
 * Query filters for listing pending businesses
 */
export const listPendingBusinessesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

/**
 * Query filters for listing approved businesses (Public)
 */
export const listApprovedBusinessesSchema = z.object({
  query: z.object({
    categoryId: z.string().uuid('Invalid category ID').optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

/**
 * Get business by ID (Public)
 */
export const getBusinessByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid business ID')
  })
});

/**
 * Query filters for listing all businesses for admin
 */
export const listAllBusinessesForAdminSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

/**
 * Update business details (Admin)
 */
export const updateBusinessSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid business ID')
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    categoryId: z.number().int().positive().optional(),
    businessType: z.string().max(100).optional(),
    yearEstablished: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
    location: z.string().max(100).optional(),
    teamSize: z.string().max(50).optional(),
    paidUpCapital: z.number().positive().optional(),
    investmentCapacityMin: z.number().positive().optional(),
    investmentCapacityMax: z.number().positive().optional(),
    pricePerUnit: z.number().positive().optional(),
    expectedReturnOptions: z.string().max(255).optional(),
    estimatedMarketValuation: z.number().positive().optional(),
    ipoTimeHorizon: z.string().max(100).optional(),
    briefDescription: z.string().max(200).optional(),
    fullDescription: z.string().optional(),
    vision: z.string().optional(),
    mission: z.string().optional(),
    growthPlans: z.string().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().max(20).optional(),
    website: z.string().url().optional(),
    facebookUrl: z.string().url().optional(),
    linkedinUrl: z.string().url().optional(),
    twitterUrl: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
    isFeatured: z.boolean().optional()
  })
});

/**
 * Toggle business active status (Admin)
 */
export const toggleBusinessActiveSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid business ID')
  })
});

/**
 * List removal requests (Admin)
 */
export const listRemovalRequestsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

/**
 * Approve removal request (Admin)
 */
export const approveRemovalRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid request ID')
  })
});

/**
 * Reject removal request (Admin)
 */
export const rejectRemovalRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid request ID')
  })
});
