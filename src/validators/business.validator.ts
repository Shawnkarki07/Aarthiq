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
