import prisma from '../config/prisma.config';
import { NotFoundError, BadRequestError } from '../utils/errors';
import {
  sendInterestNotificationToBusiness,
  sendInterestConfirmationToInvestor
} from './email.service';
import { InterestStatus } from '@prisma/client';

// Default lead sources
const DEFAULT_SOURCES = [
  'aarthiQ Platform',
  'Website',
  'Referral',
  'Social Media',
  'Manual Entry',
  'Other'
];

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
  source?: string;
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
      hasConsent: data.hasConsent ?? true,
      source: data.source || 'aarthiQ Platform',
      status: 'NOT_CONTACTED'
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
    status?: InterestStatus;
    source?: string;
  }
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 100;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: {
    businessId: string;
    status?: InterestStatus;
    source?: string;
  } = { businessId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.source) {
    where.source = filters.source;
  }

  const [interests, total, statusCounts] = await Promise.all([
    prisma.interestSubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit,
      include: {
        followUps: {
          orderBy: { followUpNumber: 'asc' }
        },
        leadSource: true
      }
    }),
    prisma.interestSubmission.count({ where }),
    // Get counts by status for tab badges
    prisma.interestSubmission.groupBy({
      by: ['status'],
      where: { businessId },
      _count: true
    })
  ]);

  // Format status counts
  const counts = {
    NOT_CONTACTED: 0,
    INTERESTED: 0,
    NOT_INTERESTED: 0
  };
  statusCounts.forEach(item => {
    counts[item.status] = item._count;
  });

  return {
    interests,
    statusCounts: counts,
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
  status?: InterestStatus;
  source?: string;
  businessId?: string;
  search?: string;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: {
    status?: InterestStatus;
    source?: string;
    businessId?: string;
    OR?: Array<{
      investorName?: { contains: string; mode: 'insensitive' };
      email?: { contains: string; mode: 'insensitive' };
      phoneNumber?: { contains: string };
    }>;
  } = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.source) {
    where.source = filters.source;
  }

  if (filters.businessId) {
    where.businessId = filters.businessId;
  }

  if (filters.search) {
    where.OR = [
      { investorName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phoneNumber: { contains: filters.search } }
    ];
  }

  const [interests, total, statusCounts, allBusinesses] = await Promise.all([
    prisma.interestSubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            contactEmail: true,
            logoUrl: true
          }
        },
        followUps: {
          orderBy: { followUpNumber: 'asc' }
        }
      }
    }),
    prisma.interestSubmission.count({ where }),
    // Get counts by status (global, not filtered)
    prisma.interestSubmission.groupBy({
      by: ['status'],
      _count: true
    }),
    // Get all businesses with inquiries for filter dropdown
    prisma.business.findMany({
      where: {
        interests: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { interests: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  // Format status counts
  const counts = {
    NOT_CONTACTED: 0,
    INTERESTED: 0,
    NOT_INTERESTED: 0,
    total: 0
  };
  statusCounts.forEach(item => {
    counts[item.status] = item._count;
    counts.total += item._count;
  });

  return {
    interests,
    statusCounts: counts,
    businesses: allBusinesses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get all today's follow-ups across all businesses (Admin only)
 */
export const getAllTodayFollowUps = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const interests = await prisma.interestSubmission.findMany({
    where: {
      followUps: {
        some: {
          nextFollowUpDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          logoUrl: true
        }
      },
      followUps: {
        orderBy: { followUpNumber: 'asc' }
      }
    },
    orderBy: { submittedAt: 'desc' }
  });

  return interests;
};

/**
 * Get all unique sources across all businesses (Admin only)
 */
export const getAllSources = async () => {
  const sources = await prisma.interestSubmission.findMany({
    select: { source: true },
    distinct: ['source']
  });

  return [...new Set([...DEFAULT_SOURCES, ...sources.map(s => s.source)])];
};

/**
 * Update interest submission (Business owner only)
 */
export const updateInterestFollowUp = async (
  interestId: string,
  businessId: string,
  data: {
    contacted?: boolean;
    followUpRemarks?: string;
    status?: InterestStatus;
    source?: string;
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

  // Build update data
  const updateData: {
    contacted?: boolean;
    followUpRemarks?: string;
    status?: InterestStatus;
    source?: string;
  } = {};

  if (data.contacted !== undefined) {
    updateData.contacted = data.contacted;
  }
  if (data.followUpRemarks !== undefined) {
    updateData.followUpRemarks = data.followUpRemarks;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
    // Auto-update contacted based on status
    if (data.status !== 'NOT_CONTACTED') {
      updateData.contacted = true;
    }
  }
  if (data.source !== undefined) {
    updateData.source = data.source;
  }

  // Update the interest
  const updated = await prisma.interestSubmission.update({
    where: { id: interestId },
    data: updateData,
    include: {
      followUps: {
        orderBy: { followUpNumber: 'asc' }
      }
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
  remarks: string,
  nextFollowUpDate?: string | null
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
      remarks: remarks,
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null
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

/**
 * Update a follow-up
 */
export const updateFollowUp = async (
  followUpId: string,
  businessId: string,
  remarks: string,
  nextFollowUpDate?: string | null
) => {
  // Verify the follow-up exists and belongs to an interest of this business
  const followUp = await prisma.interestFollowUp.findFirst({
    where: {
      id: followUpId,
      interestSubmission: {
        businessId: businessId
      }
    }
  });

  if (!followUp) {
    throw new NotFoundError('Follow-up not found');
  }

  // Build update data
  const updateData: { remarks: string; nextFollowUpDate?: Date | null } = { remarks };

  if (nextFollowUpDate !== undefined) {
    updateData.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
  }

  // Update the follow-up
  const updated = await prisma.interestFollowUp.update({
    where: { id: followUpId },
    data: updateData
  });

  return updated;
};

/**
 * Delete a follow-up
 */
export const deleteFollowUp = async (
  followUpId: string,
  businessId: string
) => {
  // Verify the follow-up exists and belongs to an interest of this business
  const followUp = await prisma.interestFollowUp.findFirst({
    where: {
      id: followUpId,
      interestSubmission: {
        businessId: businessId
      }
    }
  });

  if (!followUp) {
    throw new NotFoundError('Follow-up not found');
  }

  // Delete the follow-up
  await prisma.interestFollowUp.delete({
    where: { id: followUpId }
  });

  return { success: true };
};

/**
 * Get lead sources for a business (includes defaults + custom)
 */
export const getLeadSources = async (businessId: string) => {
  // Get custom sources for this business
  const customSources = await prisma.leadSource.findMany({
    where: { businessId },
    orderBy: { name: 'asc' }
  });

  // Combine default sources with custom ones
  const allSources = [
    ...DEFAULT_SOURCES,
    ...customSources.filter(s => !DEFAULT_SOURCES.includes(s.name)).map(s => s.name)
  ];

  return {
    sources: allSources,
    customSources: customSources
  };
};

/**
 * Add a custom lead source
 */
export const addLeadSource = async (businessId: string, name: string) => {
  // Check if source already exists (either default or custom)
  if (DEFAULT_SOURCES.includes(name)) {
    throw new BadRequestError('This source already exists as a default source');
  }

  const existing = await prisma.leadSource.findFirst({
    where: { businessId, name }
  });

  if (existing) {
    throw new BadRequestError('This source already exists');
  }

  const source = await prisma.leadSource.create({
    data: {
      businessId,
      name,
      isDefault: false
    }
  });

  return source;
};

/**
 * Delete a custom lead source
 */
export const deleteLeadSource = async (sourceId: string, businessId: string) => {
  const source = await prisma.leadSource.findFirst({
    where: { id: sourceId, businessId }
  });

  if (!source) {
    throw new NotFoundError('Lead source not found');
  }

  if (source.isDefault) {
    throw new BadRequestError('Cannot delete default lead sources');
  }

  await prisma.leadSource.delete({
    where: { id: sourceId }
  });

  return { success: true };
};

/**
 * Get interests with today's follow-up actions
 */
export const getTodayFollowUps = async (businessId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const interests = await prisma.interestSubmission.findMany({
    where: {
      businessId,
      followUps: {
        some: {
          nextFollowUpDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }
    },
    include: {
      followUps: {
        orderBy: { followUpNumber: 'asc' }
      }
    }
  });

  return interests;
};
