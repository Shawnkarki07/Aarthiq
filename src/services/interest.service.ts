import prisma from '../config/prisma.config';
import { NotFoundError, BadRequestError } from '../utils/errors';
import {
  sendInterestNotificationToBusiness,
  sendInterestConfirmationToInvestor
} from './email.service';

/**
 * Submit interest for a business
 */
export const submitInterest = async (data: {
  businessId: string;
  investorName: string;
  phoneNumber: string;
  email: string;
  message?: string;
  hasConsent?: boolean;
}) => {
  // Verify business exists and is approved
  const business = await prisma.business.findUnique({
    where: { id: data.businessId },
    select: {
      id: true,
      name: true,
      status: true,
      businessLogin: {
        select: { email: true }
      }
    }
  });

  if (!business) {
    throw new NotFoundError('Business not found');
  }

  if (business.status !== 'APPROVED') {
    throw new BadRequestError('Business is not available for investment inquiries');
  }

  // Create interest submission
  const interest = await prisma.interestSubmission.create({
    data: {
      businessId: data.businessId,
      investorName: data.investorName,
      phoneNumber: data.phoneNumber,
      email: data.email.toLowerCase(),
      message: data.message || null,
      hasConsent: data.hasConsent ?? true
    }
  });

  // Send email notifications (async, don't wait)
  Promise.all([
    // Notify business about new interest
    sendInterestNotificationToBusiness(
      business.businessLogin.email,
      business.name,
      {
        investorName: data.investorName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        message: data.message
      }
    ),
    // Send confirmation to investor
    sendInterestConfirmationToInvestor(
      data.email,
      data.investorName,
      business.name
    )
  ]).catch(error => {
    console.error('Error sending interest notification emails:', error);
    // Don't throw error - email failure shouldn't block interest submission
  });

  return {
    ...interest,
    businessName: business.name
  };
};

/**
 * Get interests for a specific business (Business owner only)
 */
export const getBusinessInterests = async (
  businessId: string,
  filters: {
    page?: number;
    limit?: number;
  }
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [interests, total] = await Promise.all([
    prisma.interestSubmission.findMany({
      where: { businessId },
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit,
      include: {
        followUps: {
          orderBy: { followUpNumber: 'asc' }
        }
      }
    }),
    prisma.interestSubmission.count({ where: { businessId } })
  ]);

  return {
    interests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get all interest submissions (Admin only)
 */
export const getAllInterests = async (filters: {
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const [interests, total] = await Promise.all([
    prisma.interestSubmission.findMany({
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit,
      include: {
        business: {
          select: {
            name: true,
            registrationNumber: true,
            contactEmail: true
          }
        },
        followUps: {
          orderBy: { followUpNumber: 'asc' }
        }
      }
    }),
    prisma.interestSubmission.count()
  ]);

  return {
    interests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Update interest submission follow-up details (Business owner only)
 */
export const updateInterestFollowUp = async (
  interestId: string,
  businessId: string,
  data: {
    contacted?: boolean;
    followUpRemarks?: string;
  }
) => {
  // Verify the interest belongs to this business
  const interest = await prisma.interestSubmission.findFirst({
    where: {
      id: interestId,
      businessId: businessId
    }
  });

  if (!interest) {
    throw new NotFoundError('Interest submission not found');
  }

  // Update the interest
  const updated = await prisma.interestSubmission.update({
    where: { id: interestId },
    data: {
      contacted: data.contacted,
      followUpRemarks: data.followUpRemarks
    }
  });

  return updated;
};

/**
 * Add a new follow-up to an interest submission
 */
export const addInterestFollowUp = async (
  interestId: string,
  businessId: string,
  remarks: string
) => {
  // Verify the interest belongs to this business
  const interest = await prisma.interestSubmission.findFirst({
    where: {
      id: interestId,
      businessId: businessId
    },
    include: {
      followUps: {
        orderBy: { followUpNumber: 'desc' },
        take: 1
      }
    }
  });

  if (!interest) {
    throw new NotFoundError('Interest submission not found');
  }

  // Calculate the next follow-up number
  const nextFollowUpNumber = interest.followUps.length > 0
    ? interest.followUps[0].followUpNumber + 1
    : 1;

  // Create the new follow-up
  const followUp = await prisma.interestFollowUp.create({
    data: {
      interestSubmissionId: interestId,
      followUpNumber: nextFollowUpNumber,
      remarks: remarks
    }
  });

  // Also mark as contacted if not already
  if (!interest.contacted) {
    await prisma.interestSubmission.update({
      where: { id: interestId },
      data: { contacted: true }
    });
  }

  return followUp;
};
