import prisma from '../config/prisma.config';
import { NotFoundError, ForbiddenError } from '../utils/errors';

/**
 * Get business profile for logged-in business user
 */
export const getOwnBusinessProfile = async (businessLoginId: string) => {
  const business = await prisma.business.findUnique({
    where: { businessLoginId },
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
      rejectionReason: true,
      viewCount: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!business) {
    throw new NotFoundError('Business profile not found');
  }

  return business;
};

/**
 * Update business profile for logged-in business user
 */
export const updateOwnBusinessProfile = async (
  businessLoginId: string,
  data: {
    name?: string;
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
  }
) => {
  // Verify business exists and belongs to this user
  const existingBusiness = await prisma.business.findUnique({
    where: { businessLoginId },
    select: { id: true, status: true }
  });

  if (!existingBusiness) {
    throw new NotFoundError('Business profile not found');
  }

  // Update business
  const updated = await prisma.business.update({
    where: { businessLoginId },
    data: {
      ...data,
      updatedAt: new Date()
    },
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true
    }
  });

  return updated;
};
