import { Request, Response, NextFunction } from 'express';
import { submitInterest, getAllInterests } from '../services/interest.service';

/**
 * POST /api/interests
 * Submit investor interest form
 */
export const submitInterestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId, investorName, phoneNumber, email, message, hasConsent } = req.body;

    const interest = await submitInterest({
      businessId,
      investorName,
      phoneNumber,
      email,
      message,
      hasConsent
    });

    return res.status(201).json({
      message: 'Interest submitted successfully',
      interest: {
        id: interest.id,
        businessName: interest.businessName,
        submittedAt: interest.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interests
 * Get all interest submissions (Admin only)
 */
export const getAllInterestsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await getAllInterests({ page, limit });

    return res.status(200).json({
      message: 'Interests fetched successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};
