import { Request, Response, NextFunction } from 'express';
import {
  submitInterest,
  getAllInterests,
  getBusinessInterests,
  updateInterestFollowUp,
  addInterestFollowUp,
  updateFollowUp,
  deleteFollowUp,
  getAllTodayFollowUps,
  getAllSources
} from '../services/interest.service';
import { InterestStatus } from '@prisma/client';

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
    const { status, source, businessId, search } = req.query;

    const result = await getAllInterests({
      page,
      limit,
      status: status as InterestStatus | undefined,
      source: source as string | undefined,
      businessId: businessId as string | undefined,
      search: search as string | undefined
    });

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
 * Update interest (status, source, contacted, remarks) (Admin only)
 */
export const updateInterestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { contacted, followUpRemarks, businessId, status, source } = req.body;

    // Validate status if provided
    if (status && !['NOT_CONTACTED', 'INTERESTED', 'NOT_INTERESTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await updateInterestFollowUp(id, businessId, {
      contacted,
      followUpRemarks,
      status: status as InterestStatus | undefined,
      source
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
    const { remarks, businessId, nextFollowUpDate } = req.body;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ error: 'Remarks are required' });
    }

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const followUp = await addInterestFollowUp(id, businessId, remarks, nextFollowUpDate);

    return res.status(201).json({
      message: 'Follow-up added successfully',
      followUp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/interests/followups/:followUpId
 * Update a follow-up (Admin only)
 */
export const updateFollowUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { followUpId } = req.params;
    const { remarks, businessId, nextFollowUpDate } = req.body;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ error: 'Remarks are required' });
    }

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const followUp = await updateFollowUp(followUpId, businessId, remarks, nextFollowUpDate);

    return res.status(200).json({
      message: 'Follow-up updated successfully',
      followUp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/interests/followups/:followUpId
 * Delete a follow-up (Admin only)
 */
export const deleteFollowUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { followUpId } = req.params;
    const { businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    await deleteFollowUp(followUpId, businessId);

    return res.status(200).json({
      message: 'Follow-up deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interests/today
 * Get all interests with follow-ups due today (Admin only)
 */
export const getTodayFollowUpsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const interests = await getAllTodayFollowUps();

    return res.status(200).json({
      message: 'Today\'s follow-ups fetched successfully',
      interests,
      count: interests.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/interests/sources
 * Get all unique lead sources (Admin only)
 */
export const getSourcesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sources = await getAllSources();

    return res.status(200).json({
      sources
    });
  } catch (error) {
    next(error);
  }
};
