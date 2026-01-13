import prisma from '../config/prisma.config';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

/**
 * List pending businesses (Admin)
 * Now returns ALL businesses for review (PENDING, APPROVED, REJECTED)
 */
export const listPendingBusinesses = async (filters: {
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50; // Increased to show more businesses
  const skip = (page - 1) * limit;

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      // Removed status filter - now shows all businesses
      include: {
        businessLogin: {
          select: { id: true, email: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.business.count() // Count all businesses
  ]);

  return {
    businesses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Approve business
 */
export const approveBusiness = async (businessId: string) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { businessLogin: true }
  });

  if (!business) {
    throw new NotFoundError('Business not found');
  }

  if (business.status === 'APPROVED') {
    throw new BadRequestError('Business already approved');
  }

  // Use transaction to update both business and invalidate the onboarding token
  const updated = await prisma.$transaction(async (tx) => {
    // Update business status
    const updatedBusiness = await tx.business.update({
      where: { id: businessId },
      data: {
        status: 'APPROVED',
        rejectionReason: null
      }
    });

    // Find and invalidate the onboarding token
    // Clear the token so it cannot be used again
    const onboardingRequest = await tx.businessOnboardingRequest.findFirst({
      where: {
        createdBusinessLoginId: business.businessLoginId
      }
    });

    if (onboardingRequest && onboardingRequest.onboardingToken) {
      await tx.businessOnboardingRequest.update({
        where: { id: onboardingRequest.id },
        data: {
          onboardingToken: null,
          tokenExpiresAt: null
        }
      });
    }

    return updatedBusiness;
  });

  // Email removed - admin will call directly
  return updated;
};

/**
 * Reject business
 */
export const rejectBusiness = async (businessId: string, reason: string) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { businessLogin: true }
  });

  if (!business) {
    throw new NotFoundError('Business not found');
  }

  if (business.status === 'REJECTED') {
    throw new BadRequestError('Business already rejected');
  }

  // Use transaction to update both business and invalidate the onboarding token
  const updated = await prisma.$transaction(async (tx) => {
    // Update business status
    const updatedBusiness = await tx.business.update({
      where: { id: businessId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason
      }
    });

    // Find and invalidate the onboarding token
    // Clear the token so it cannot be used again
    const onboardingRequest = await tx.businessOnboardingRequest.findFirst({
      where: {
        createdBusinessLoginId: business.businessLoginId
      }
    });

    if (onboardingRequest && onboardingRequest.onboardingToken) {
      await tx.businessOnboardingRequest.update({
        where: { id: onboardingRequest.id },
        data: {
          onboardingToken: null,
          tokenExpiresAt: null
        }
      });
    }

    return updatedBusiness;
  });

  // Email removed - admin will call directly
  return updated;
};

/**
 * Get business by ID
 */
export const getBusinessById = async (businessId: string) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      businessLogin: {
        select: { id: true, email: true }
      },
      category: true
    }
  });

  if (!business) {
    throw new NotFoundError('Business not found');
  }

  return business;
};

/**
 * Get approved business by ID (Public)
 */
export const getApprovedBusinessById = async (businessId: string) => {
  const business = await prisma.business.findUnique({
    where: {
      id: businessId,
      status: 'APPROVED'
    },
    select: {
      id: true,
      name: true,
      registrationNumber: true,
      categoryId: true,
      category: {
        select: { id: true, name: true, slug: true }
      },
      businessType: true,
      yearEstablished: true,
      location: true,
      teamSize: true,
      paidUpCapital: true,
      investmentCapacityMin: true,
      investmentCapacityMax: true,
      minimumInvestmentUnits: true,
      maximumInvestmentUnits: true,
      pricePerUnit: true,
      expectedReturnOptions: true,
      estimatedMarketValuation: true,
      ipoTimeHorizon: true,
      briefDescription: true,
      fullDescription: true,
      vision: true,
      mission: true,
      growthPlans: true,
      contactEmail: true,
      contactPhone: true,
      website: true,
      facebookUrl: true,
      linkedinUrl: true,
      twitterUrl: true,
      logoUrl: true,
      viewCount: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!business) {
    throw new NotFoundError('Business not found');
  }

  // Increment view count
  await prisma.business.update({
    where: { id: businessId },
    data: { viewCount: { increment: 1 } }
  });

  return business;
};

/**
 * List approved businesses (Public)
 * Now also checks isActive field
 */
export const listApprovedBusinesses = async (filters: {
  categoryId?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { status: 'APPROVED', isActive: true };
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      select: {
        id: true,
        name: true,
        registrationNumber: true,
        categoryId: true,
        category: {
          select: { id: true, name: true, slug: true }
        },
        businessType: true,
        yearEstablished: true,
        location: true,
        teamSize: true,
        paidUpCapital: true,
        investmentCapacityMin: true,
        investmentCapacityMax: true,
        pricePerUnit: true,
        expectedReturnOptions: true,
        estimatedMarketValuation: true,
        ipoTimeHorizon: true,
        briefDescription: true,
        fullDescription: true,
        vision: true,
        mission: true,
        growthPlans: true,
        contactEmail: true,
        contactPhone: true,
        website: true,
        facebookUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        logoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.business.count({ where })
  ]);

  return {
    businesses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * List all active businesses for admin (includes both active and inactive)
 */
export const listAllBusinessesForAdmin = async (filters: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = { status: 'APPROVED' };

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: {
        businessLogin: {
          select: { id: true, email: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.business.count({ where })
  ]);

  return {
    businesses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get full business details by ID (Admin)
 */
export const getBusinessDetailsByIdForAdmin = async (businessId: string) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      businessLogin: {
        select: { id: true, email: true }
      },
      category: {
        select: { id: true, name: true, slug: true }
      },
      media: true,
      interests: {
        take: 10,
        orderBy: { submittedAt: 'desc' }
      }
    }
  });

  if (!business) {
    throw new NotFoundError('Business not found');
  }

  // Convert BigInt fileSize to string for JSON serialization
  if (business.media && business.media.length > 0) {
    const mediaWithStringSize = business.media.map(m => ({
      ...m,
      fileSize: m.fileSize ? m.fileSize.toString() : null
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (business as any).media = mediaWithStringSize;
  }

  return business;
};

/**
 * Update business details (Admin)
 */
export const updateBusiness = async (
  businessId: string,
  data: {
    name?: string;
    categoryId?: number;
    businessType?: string;
    yearEstablished?: number;
    location?: string;
    teamSize?: string;
    paidUpCapital?: number;
    investmentCapacityMin?: number;
    investmentCapacityMax?: number;
    pricePerUnit?: number;
    expectedReturnOptions?: string;
    estimatedMarketValuation?: number;
    ipoTimeHorizon?: string;
    briefDescription?: string;
    fullDescription?: string;
    vision?: string;
    mission?: string;
    growthPlans?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    facebookUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    logoUrl?: string;
    isFeatured?: boolean;
  }
) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId }
  });

  if (!business) {
    throw new NotFoundError('Business not found');
  }

  const updated = await prisma.business.update({
    where: { id: businessId },
    data
  });

  return updated;
};

/**
 * Toggle business active status (Admin)
 * Also toggles the business login access
 */
export const toggleBusinessActive = async (businessId: string) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      businessLogin: true
    }
  });

  if (!business) {
    throw new NotFoundError('Business not found');
  }

  const newActiveStatus = !business.isActive;

  // Update both Business.isActive and BusinessLogin.isActive
  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      isActive: newActiveStatus,
      businessLogin: {
        update: {
          isActive: newActiveStatus
        }
      }
    },
    include: {
      businessLogin: true
    }
  });

  return updated;
};

/**
 * List removal requests (Admin)
 */
export const listRemovalRequests = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.businessRemovalRequest.findMany({
      skip,
      take: limit,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            contactPhone: true,
            isActive: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    }),
    prisma.businessRemovalRequest.count()
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Approve removal request and deactivate business (Admin)
 */
export const approveRemovalRequest = async (requestId: string) => {
  // Get the removal request
  const request = await prisma.businessRemovalRequest.findUnique({
    where: { id: requestId },
    include: {
      business: {
        include: {
          businessLogin: true
        }
      }
    }
  });

  if (!request) {
    throw new NotFoundError('Removal request not found');
  }

  if (request.status !== 'PENDING') {
    throw new ForbiddenError('This request has already been reviewed');
  }

  // Update request status and deactivate the business
  const [updatedRequest] = await prisma.$transaction([
    // Update removal request status
    prisma.businessRemovalRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date()
      }
    }),
    // Deactivate the business
    prisma.business.update({
      where: { id: request.businessId },
      data: {
        isActive: false,
        businessLogin: {
          update: {
            isActive: false
          }
        }
      }
    })
  ]);

  return updatedRequest;
};

/**
 * Reject removal request (Admin)
 */
export const rejectRemovalRequest = async (requestId: string) => {
  // Get the removal request
  const request = await prisma.businessRemovalRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) {
    throw new NotFoundError('Removal request not found');
  }

  if (request.status !== 'PENDING') {
    throw new ForbiddenError('This request has already been reviewed');
  }

  // Update request status
  const updatedRequest = await prisma.businessRemovalRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      reviewedAt: new Date()
    }
  });

  return updatedRequest;
};
