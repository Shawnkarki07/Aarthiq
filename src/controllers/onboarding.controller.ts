import { Request, Response, NextFunction } from 'express';
import {
  createOnboardingRequest,
  listOnboardingRequests,
  approveOnboardingRequest,
  rejectOnboardingRequest,
  validateRegistrationToken,
  completeBusinessRegistration
} from '../services/onboarding.service';

/**
 * POST /api/onboarding/request
 * Submit initial onboarding inquiry
 */
export const createOnboardingRequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = await createOnboardingRequest(req.body);

    return res.status(201).json({
      message: 'Onboarding request submitted successfully',
      request: {
        id: request.id,
        businessName: request.businessName,
        email: request.email,
        status: request.status,
        submittedAt: request.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/onboarding/requests
 * List all onboarding requests (Admin)
 */
export const listOnboardingRequestsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page, limit } = req.query;

    const result = await listOnboardingRequests({
      status: status as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/onboarding/requests/:id/approve
 * Approve onboarding request and generate token
 */
export const approveOnboardingRequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const request = await approveOnboardingRequest(id);

    return res.status(200).json({
      message: 'Onboarding request approved',
      request: {
        id: request.id,
        businessName: request.businessName,
        email: request.email,
        status: request.status,
        onboardingToken: request.onboardingToken,
        tokenExpiresAt: request.tokenExpiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/onboarding/requests/:id/reject
 * Reject onboarding request
 */
export const rejectOnboardingRequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const request = await rejectOnboardingRequest(id, rejectionReason);

    return res.status(200).json({
      message: 'Onboarding request rejected',
      request: {
        id: request.id,
        businessName: request.businessName,
        status: request.status,
        rejectionReason: request.rejectionReason
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/onboarding/validate/:token
 * Validate registration token
 */
export const validateRegistrationTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const result = await validateRegistrationToken(token);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/onboarding/register
 * Complete business registration
 */
export const completeRegistrationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password, ...businessData } = req.body;

    // Extract uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const uploadedFiles = {
      companyLogo: files?.companyLogo?.[0] || null,
      registrationCertificate: files?.registrationCertificate?.[0] || null,
      panCertificate: files?.panCertificate?.[0] || null,
      pitchDeck: files?.pitchDeck?.[0] || null,
      galleryImages: files?.galleryImages || []
    };

    const result = await completeBusinessRegistration(
      token,
      password,
      businessData,
      uploadedFiles
    );

    return res.status(201).json({
      message: 'Registration completed successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role
      },
      business: {
        id: result.business.id,
        name: result.business.name,
        status: result.business.status
      }
    });
  } catch (error) {
    next(error);
  }
};
