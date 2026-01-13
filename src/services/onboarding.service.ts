import { OnboardingStatus, MediaType } from '@prisma/client';
import prisma from '../config/prisma.config';
import { generateToken, getTokenExpiration, isTokenExpired } from '../utils/token.utils';
import { hashPassword } from '../utils/password.utils';
import { sendOnboardingApprovalEmail, sendOnboardingRejectionEmail } from './email.service';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { moveFileToBusinessFolder, getFileUrl, deleteFile } from '../config/upload.config';

// Type for uploaded files during registration
interface RegistrationFiles {
  companyLogo: Express.Multer.File | null;
  registrationCertificate: Express.Multer.File | null;
  panCertificate: Express.Multer.File | null;
  pitchDeck: Express.Multer.File | null;
  galleryImages: Express.Multer.File[];
}

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

  // Send approval email (non-blocking - don't fail if email fails)
  try {
    await sendOnboardingApprovalEmail(
      updated.email,
      updated.businessName,
      token
    );
  } catch (emailError) {
    console.warn('Failed to send approval email (continuing anyway):', emailError);
  }

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
  businessData: any,
  uploadedFiles?: RegistrationFiles
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

  // Find or create category based on industry name
  let category = await prisma.category.findFirst({
    where: { name: businessData.industry }
  });

  if (!category) {
    // Create category if it doesn't exist
    const slug = businessData.industry.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    category = await prisma.category.upsert({
      where: { slug: slug },
      update: {},
      create: {
        name: businessData.industry,
        slug: slug
      }
    });
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

    // Map form data to database schema
    const location = businessData.city && businessData.district
      ? `${businessData.city}, ${businessData.district}`
      : businessData.city || businessData.district || 'Not specified';

    // Create business
    const business = await tx.business.create({
      data: {
        businessLoginId: businessLogin.id,
        name: businessData.companyName,
        registrationNumber: businessData.registrationNumber,
        categoryId: category.id,
        businessType: businessData.companySize || 'Not specified',
        yearEstablished: businessData.foundedYear ? parseInt(businessData.foundedYear) : new Date().getFullYear(),
        location: location,
        teamSize: businessData.companySize || 'Not specified',
        // Financial fields with defaults
        paidUpCapital: businessData.investmentSought ? parseFloat(businessData.investmentSought) : 0,
        investmentCapacityMin: 0,
        investmentCapacityMax: businessData.investmentSought ? parseFloat(businessData.investmentSought) : 0,
        // Investment Parameters
        minimumInvestmentUnits: businessData.minimumInvestmentUnits ? parseInt(businessData.minimumInvestmentUnits) : null,
        maximumInvestmentUnits: businessData.maximumInvestmentUnits ? parseInt(businessData.maximumInvestmentUnits) : null,
        pricePerUnit: businessData.pricePerUnit ? parseFloat(businessData.pricePerUnit) : null,
        expectedReturnOptions: businessData.expectedReturnOptions || null,
        estimatedMarketValuation: businessData.estimatedMarketValuation ? parseFloat(businessData.estimatedMarketValuation) : null,
        ipoTimeHorizon: businessData.ipoTimeHorizon || null,
        // Descriptions
        briefDescription: businessData.description,
        fullDescription: businessData.revenueModel || businessData.useOfFunds || null,
        vision: businessData.vision || null,
        mission: businessData.mission || null,
        growthPlans: businessData.useOfFunds || null,
        // Contact information
        contactEmail: businessData.email || request.email,
        contactPhone: businessData.phone,
        website: businessData.website || null,
        facebookUrl: businessData.facebook || null,
        linkedinUrl: businessData.linkedin || null,
        twitterUrl: businessData.twitter || null,
        logoUrl: null, // Will be updated after file processing
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

  // Process uploaded files after business is created
  if (uploadedFiles) {
    try {
      await processRegistrationFiles(result.business.id, uploadedFiles);
    } catch (fileError) {
      console.error('Error processing uploaded files:', fileError);
      // Don't fail registration if file processing fails
      // Files can be uploaded later via the upload endpoints
    }
  }

  // Fetch updated business with logo URL
  const updatedBusiness = await prisma.business.findUnique({
    where: { id: result.business.id }
  });

  return {
    user: {
      id: result.businessLogin.id,
      email: result.businessLogin.email,
      role: 'BUSINESS' as const
    },
    business: updatedBusiness || result.business
  };
};

/**
 * Process uploaded files during registration
 */
async function processRegistrationFiles(businessId: string, files: RegistrationFiles) {
  const mediaRecords: Array<{
    businessId: string;
    mediaType: MediaType;
    fileName: string;
    fileUrl: string;
    fileSize: bigint;
    mimeType: string;
    title: string;
    displayOrder?: number;
  }> = [];

  let logoUrl: string | null = null;

  // Process company logo
  if (files.companyLogo) {
    const newPath = moveFileToBusinessFolder(files.companyLogo.path, businessId);
    logoUrl = getFileUrl(newPath);

    mediaRecords.push({
      businessId,
      mediaType: 'COMPANY_LOGO',
      fileName: files.companyLogo.originalname,
      fileUrl: logoUrl,
      fileSize: BigInt(files.companyLogo.size),
      mimeType: files.companyLogo.mimetype,
      title: 'Company Logo'
    });
  }

  // Process registration certificate
  if (files.registrationCertificate) {
    const newPath = moveFileToBusinessFolder(files.registrationCertificate.path, businessId);
    const fileUrl = getFileUrl(newPath);

    mediaRecords.push({
      businessId,
      mediaType: 'REGISTRATION_CERTIFICATE',
      fileName: files.registrationCertificate.originalname,
      fileUrl,
      fileSize: BigInt(files.registrationCertificate.size),
      mimeType: files.registrationCertificate.mimetype,
      title: 'Registration Certificate'
    });
  }

  // Process PAN certificate
  if (files.panCertificate) {
    const newPath = moveFileToBusinessFolder(files.panCertificate.path, businessId);
    const fileUrl = getFileUrl(newPath);

    mediaRecords.push({
      businessId,
      mediaType: 'PAN_CERTIFICATE',
      fileName: files.panCertificate.originalname,
      fileUrl,
      fileSize: BigInt(files.panCertificate.size),
      mimeType: files.panCertificate.mimetype,
      title: 'PAN Certificate'
    });
  }

  // Process pitch deck
  if (files.pitchDeck) {
    const newPath = moveFileToBusinessFolder(files.pitchDeck.path, businessId);
    const fileUrl = getFileUrl(newPath);

    mediaRecords.push({
      businessId,
      mediaType: 'PITCH_DECK',
      fileName: files.pitchDeck.originalname,
      fileUrl,
      fileSize: BigInt(files.pitchDeck.size),
      mimeType: files.pitchDeck.mimetype,
      title: 'Pitch Deck'
    });
  }

  // Process gallery images
  if (files.galleryImages && files.galleryImages.length > 0) {
    for (let i = 0; i < files.galleryImages.length; i++) {
      const file = files.galleryImages[i];
      const newPath = moveFileToBusinessFolder(file.path, businessId);
      const fileUrl = getFileUrl(newPath);

      mediaRecords.push({
        businessId,
        mediaType: 'GALLERY',
        fileName: file.originalname,
        fileUrl,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        title: `Gallery Image ${i + 1}`,
        displayOrder: i + 1
      });
    }
  }

  // Save all media records and update logo URL in a transaction
  if (mediaRecords.length > 0 || logoUrl) {
    await prisma.$transaction(async (tx) => {
      // Create media records
      if (mediaRecords.length > 0) {
        await tx.businessMedia.createMany({
          data: mediaRecords
        });
      }

      // Update business logo URL
      if (logoUrl) {
        await tx.business.update({
          where: { id: businessId },
          data: { logoUrl }
        });
      }
    });
  }
}
