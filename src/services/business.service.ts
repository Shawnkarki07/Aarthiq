import prisma from '../config/prisma.config';
import { sendBusinessApprovalEmail, sendBusinessRejectionEmail } from './email.service';
import { NotFoundError, BadRequestError } from '../utils/errors';

/**
 * List pending businesses (Admin)
 */
export const listPendingBusinesses = async (filters: {
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where: { status: 'PENDING' },
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
    prisma.business.count({ where: { status: 'PENDING' } })
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

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      status: 'APPROVED',
      rejectionReason: null
    }
  });

  // Send approval email
  await sendBusinessApprovalEmail(
    business.businessLogin.email,
    business.name
  );

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

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason
    }
  });

  // Send rejection email
  await sendBusinessRejectionEmail(
    business.businessLogin.email,
    business.name,
    reason
  );

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
 */
export const listApprovedBusinesses = async (filters: {
  categoryId?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { status: 'APPROVED' };
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
