import prisma from '../config/prisma.config';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../utils/errors';
import bcrypt from 'bcryptjs';

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
    minimumInvestmentUnits?: number;
    maximumInvestmentUnits?: number;
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

/**
 * Change password for business account
 */
export const changeBusinessPassword = async (
  businessLoginId: string,
  currentPassword: string,
  newPassword: string
) => {
  // Get the business login
  const businessLogin = await prisma.businessLogin.findUnique({
    where: { id: businessLoginId },
    select: { id: true, passwordHash: true }
  });

  if (!businessLogin) {
    throw new NotFoundError('Business account not found');
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, businessLogin.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.businessLogin.update({
    where: { id: businessLoginId },
    data: {
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    }
  });

  return { success: true };
};

/**
 * Request business profile removal
 */
export const requestBusinessRemoval = async (
  businessLoginId: string,
  reason?: string
) => {
  // Get the business for this login
  const business = await prisma.business.findUnique({
    where: { businessLoginId },
    select: { id: true, name: true }
  });

  if (!business) {
    throw new NotFoundError('Business profile not found');
  }

  // Check if there's already a pending removal request
  const existingRequest = await prisma.businessRemovalRequest.findFirst({
    where: {
      businessId: business.id,
      status: 'PENDING'
    }
  });

  if (existingRequest) {
    throw new ForbiddenError('You already have a pending removal request');
  }

  // Create removal request
  const removalRequest = await prisma.businessRemovalRequest.create({
    data: {
      businessId: business.id,
      reason: reason || null,
      status: 'PENDING'
    }
  });

  return removalRequest;
};
