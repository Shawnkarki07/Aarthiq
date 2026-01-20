import { Request, Response, NextFunction } from 'express';
import { submitInterest, getAllInterests, getBusinessInterests, updateInterestFollowUp, addInterestFollowUp } from '../services/interest.service';

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

/**
 * GET /api/interests/business/:businessId
 * Get interest submissions for a specific business (Admin only)
 */
export const getBusinessInterestsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    const result = await getBusinessInterests(businessId, { page, limit });

    return res.status(200).json({
      message: 'Business interests fetched successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/interests/:id
 * Update interest follow-up details (Admin only)
 */
export const updateInterestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { contacted, followUpRemarks, businessId } = req.body;

    const updated = await updateInterestFollowUp(id, businessId, {
      contacted,
      followUpRemarks
    });

    return res.status(200).json({
      message: 'Interest updated successfully',
      interest: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/interests/:id/followups
 * Add a new follow-up to an interest submission (Admin only)
 */
export const addInterestFollowUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { remarks, businessId } = req.body;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ error: 'Remarks are required' });
    }

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const followUp = await addInterestFollowUp(id, businessId, remarks);

    return res.status(201).json({
      message: 'Follow-up added successfully',
      followUp
    });
  } catch (error) {
    next(error);
  }
};
