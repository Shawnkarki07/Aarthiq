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
 * Admin can update ALL fields - no validation restrictions
 */
export const updateBusinessSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid business ID')
  }),
  body: z.object({
    name: z.any().optional(),
    registrationNumber: z.any().optional(),
    panNumber: z.any().optional(),
    categoryId: z.any().optional(),
    businessType: z.any().optional(),
    yearEstablished: z.any().optional(),
    teamSize: z.any().optional(),
    promoterProfile: z.any().optional(),
    location: z.any().optional(),
    address: z.any().optional(),
    contactEmail: z.any().optional(),
    contactPhone: z.any().optional(),
    website: z.any().optional(),
    facebookUrl: z.any().optional(),
    linkedinUrl: z.any().optional(),
    instagramUrl: z.any().optional(),
    fundingStage: z.any().optional(),
    paidUpCapital: z.any().optional(),
    briefDescription: z.any().optional(),
    fullDescription: z.any().optional(),
    vision: z.any().optional(),
    mission: z.any().optional(),
    growthPlans: z.any().optional(),
    minimumInvestmentUnits: z.any().optional(),
    maximumInvestmentUnits: z.any().optional(),
    pricePerUnit: z.any().optional(),
    expectedReturnOptions: z.any().optional(),
    estimatedMarketValuation: z.any().optional(),
    ipoTimeHorizon: z.any().optional(),
    logoUrl: z.any().optional(),
    isFeatured: z.any().optional(),
    isActive: z.any().optional(),
  }).passthrough() // Allow any additional fields
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
