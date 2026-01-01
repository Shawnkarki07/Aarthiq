import { OnboardingStatus } from '@prisma/client';
import prisma from '../config/prisma.config';
import { generateToken, getTokenExpiration, isTokenExpired } from '../utils/token.utils';
import { hashPassword } from '../utils/password.utils';
import { sendOnboardingApprovalEmail, sendOnboardingRejectionEmail } from './email.service';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';

/**
 * Submit initial onboarding request
 */
export const createOnboardingRequest = async (data: {
  businessName: string;
  email: string;
  phoneNumber: string;
  message?: string;
}) => {
  // Check for duplicate email
  const existing = await prisma.businessOnboardingRequest.findFirst({
    where: {
      email: data.email,
      status: { in: ['PENDING', 'CONTACTED', 'APPROVED'] }
    }
  });

  if (existing) {
    throw new ConflictError('An onboarding request with this email already exists');
  }

  const request = await prisma.businessOnboardingRequest.create({
    data: {
      businessName: data.businessName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      message: data.message || null,
      status: 'PENDING'
    }
  });

  return request;
};

/**
 * List onboarding requests (Admin)
 */
export const listOnboardingRequests = async (filters: {
  status?: OnboardingStatus;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.status) {
    where.status = filters.status;
  }

  const [requests, total] = await Promise.all([
    prisma.businessOnboardingRequest.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.businessOnboardingRequest.count({ where })
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
 * Approve onboarding request and generate token
 */
export const approveOnboardingRequest = async (requestId: string) => {
  const request = await prisma.businessOnboardingRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) {
    throw new NotFoundError('Onboarding request not found');
  }

  if (request.status === 'APPROVED') {
    throw new BadRequestError('Request already approved');
  }

  if (request.status === 'REJECTED') {
    throw new BadRequestError('Cannot approve a rejected request');
  }

  // Generate unique token
  const token = generateToken();
  const tokenExpiresAt = getTokenExpiration();

  const updated = await prisma.businessOnboardingRequest.update({
    where: { id: requestId },
    data: {
      status: 'APPROVED',
      onboardingToken: token,
      tokenExpiresAt,
      reviewedAt: new Date()
    }
  });

  // Send approval email
  await sendOnboardingApprovalEmail(
    updated.email,
    updated.businessName,
    token
  );

  return updated;
};

/**
 * Reject onboarding request
 */
export const rejectOnboardingRequest = async (requestId: string, reason: string) => {
  const request = await prisma.businessOnboardingRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) {
    throw new NotFoundError('Onboarding request not found');
  }

  if (request.status === 'APPROVED') {
    throw new BadRequestError('Cannot reject an approved request');
  }

  const updated = await prisma.businessOnboardingRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason,
      reviewedAt: new Date()
    }
  });

  // Send rejection email
  await sendOnboardingRejectionEmail(
    updated.email,
    updated.businessName,
    reason
  );

  return updated;
};

/**
 * Validate registration token
 */
export const validateRegistrationToken = async (token: string) => {
  const request = await prisma.businessOnboardingRequest.findUnique({
    where: { onboardingToken: token }
  });

  if (!request) {
    throw new NotFoundError('Invalid token');
  }

  if (request.status !== 'APPROVED') {
    throw new BadRequestError('Token is not valid');
  }

  if (isTokenExpired(request.tokenExpiresAt)) {
    throw new BadRequestError('Token has expired');
  }

  if (request.createdBusinessLoginId) {
    throw new BadRequestError('Token has already been used');
  }

  return {
    isValid: true,
    businessName: request.businessName,
    email: request.email,
    phoneNumber: request.phoneNumber
  };
};

/**
 * Complete registration (create User + Business)
 */
export const completeBusinessRegistration = async (
  token: string,
  password: string,
  businessData: any
) => {
  // Validate token
  const request = await prisma.businessOnboardingRequest.findUnique({
    where: { onboardingToken: token }
  });

  if (!request) {
    throw new NotFoundError('Invalid token');
  }

  if (request.status !== 'APPROVED') {
    throw new BadRequestError('Token is not valid');
  }

  if (isTokenExpired(request.tokenExpiresAt)) {
    throw new BadRequestError('Token has expired');
  }

  if (request.createdBusinessLoginId) {
    throw new BadRequestError('Token has already been used');
  }

  // Check if email already exists in business logins
  const existingBusinessLogin = await prisma.businessLogin.findUnique({
    where: { email: request.email }
  });

  if (existingBusinessLogin) {
    throw new ConflictError('Email already registered');
  }

  // Check if registration number exists
  const existingBusiness = await prisma.business.findUnique({
    where: { registrationNumber: businessData.registrationNumber }
  });

  if (existingBusiness) {
    throw new ConflictError('Registration number already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create business login and business in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create business login
    const businessLogin = await tx.businessLogin.create({
      data: {
        email: request.email,
        passwordHash,
        isActive: true
      }
    });

    // Create business
    const business = await tx.business.create({
      data: {
        businessLoginId: businessLogin.id,
        name: businessData.name,
        registrationNumber: businessData.registrationNumber,
        categoryId: businessData.categoryId,
        businessType: businessData.businessType,
        yearEstablished: businessData.yearEstablished,
        location: businessData.location,
        teamSize: businessData.teamSize,
        paidUpCapital: businessData.paidUpCapital,
        investmentCapacityMin: businessData.investmentCapacityMin,
        investmentCapacityMax: businessData.investmentCapacityMax,
        pricePerUnit: businessData.pricePerUnit || null,
        expectedReturnOptions: businessData.expectedReturnOptions || null,
        estimatedMarketValuation: businessData.estimatedMarketValuation || null,
        ipoTimeHorizon: businessData.ipoTimeHorizon || null,
        briefDescription: businessData.briefDescription,
        fullDescription: businessData.fullDescription || null,
        vision: businessData.vision || null,
        mission: businessData.mission || null,
        growthPlans: businessData.growthPlans || null,
        contactEmail: businessData.contactEmail,
        contactPhone: businessData.contactPhone,
        website: businessData.website || null,
        facebookUrl: businessData.facebookUrl || null,
        linkedinUrl: businessData.linkedinUrl || null,
        twitterUrl: businessData.twitterUrl || null,
        status: 'PENDING'
      }
    });

    // Update onboarding request
    await tx.businessOnboardingRequest.update({
      where: { id: request.id },
      data: { createdBusinessLoginId: businessLogin.id }
    });

    return { businessLogin, business };
  });

  return {
    user: {
      id: result.businessLogin.id,
      email: result.businessLogin.email,
      role: 'BUSINESS' as const
    },
    business: result.business
  };
};
