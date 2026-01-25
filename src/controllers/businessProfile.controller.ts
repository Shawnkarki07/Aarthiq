import { Request, Response, NextFunction } from 'express';
import {
  getOwnBusinessProfile,
  updateOwnBusinessProfile,
  changeBusinessPassword,
  requestBusinessRemoval
} from '../services/businessProfile.service';
import {
  getBusinessInterests,
  updateInterestFollowUp,
  addInterestFollowUp,
  updateFollowUp,
  deleteFollowUp,
  getLeadSources,
  addLeadSource,
  deleteLeadSource,
  getTodayFollowUps
} from '../services/interest.service';
import { InterestStatus } from '@prisma/client';

/**
 * GET /api/business/profile
 * Get own business profile
 */
export const getOwnProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const business = await getOwnBusinessProfile(req.user.id);

    return res.status(200).json({ business });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/business/profile
 * Update own business profile
 */
export const updateOwnProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const updated = await updateOwnBusinessProfile(req.user.id, req.body);

    return res.status(200).json({
      message: 'Profile updated successfully',
      business: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/business/interests
 * Get interest submissions for own business
 */
export const getOwnBusinessInterestsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // First get the business ID for this login
    const business = await getOwnBusinessProfile(req.user.id);

    const { page, limit, status, source } = req.query;

    const result = await getBusinessInterests(business.id, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as InterestStatus | undefined,
      source: source as string | undefined
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/business/change-password
 * Change business account password
 */
export const changePasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { currentPassword, newPassword } = req.body;

    await changeBusinessPassword(req.user.id, currentPassword, newPassword);

    return res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/business/request-removal
 * Request business profile removal
 */
export const requestRemovalHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { reason } = req.body;

    await requestBusinessRemoval(req.user.id, reason);

    return res.status(200).json({
      message: 'Removal request submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/business/interests/:id
 * Update interest (status, source, contacted, remarks)
 */
export const updateInterestFollowUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { contacted, followUpRemarks, status, source } = req.body;

    // Validate status if provided
    if (status && !['NOT_CONTACTED', 'INTERESTED', 'NOT_INTERESTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Get the business ID for this login
    const business = await getOwnBusinessProfile(req.user.id);

    const updated = await updateInterestFollowUp(id, business.id, {
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
 * POST /api/business/interests/:id/followups
 * Add a new follow-up to an interest submission
 */
export const addInterestFollowUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { remarks, nextFollowUpDate } = req.body;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ error: 'Remarks are required' });
    }

    // Get the business ID for this login
    const business = await getOwnBusinessProfile(req.user.id);

    const followUp = await addInterestFollowUp(id, business.id, remarks, nextFollowUpDate);

    return res.status(201).json({
      message: 'Follow-up added successfully',
      followUp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/business/followups/:followUpId
 * Update a follow-up
 */
export const updateFollowUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { followUpId } = req.params;
    const { remarks, nextFollowUpDate } = req.body;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ error: 'Remarks are required' });
    }

    // Get the business ID for this login
    const business = await getOwnBusinessProfile(req.user.id);

    const followUp = await updateFollowUp(followUpId, business.id, remarks, nextFollowUpDate);

    return res.status(200).json({
      message: 'Follow-up updated successfully',
      followUp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/business/followups/:followUpId
 * Delete a follow-up
 */
export const deleteFollowUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { followUpId } = req.params;

    // Get the business ID for this login
    const business = await getOwnBusinessProfile(req.user.id);

    await deleteFollowUp(followUpId, business.id);

    return res.status(200).json({
      message: 'Follow-up deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/business/lead-sources
 * Get lead sources for own business
 */
export const getLeadSourcesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const business = await getOwnBusinessProfile(req.user.id);
    const result = await getLeadSources(business.id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/business/lead-sources
 * Add a custom lead source
 */
export const addLeadSourceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Source name is required' });
    }

    const business = await getOwnBusinessProfile(req.user.id);
    const source = await addLeadSource(business.id, name.trim());

    return res.status(201).json({
      message: 'Lead source added successfully',
      source
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/business/lead-sources/:sourceId
 * Delete a custom lead source
 */
export const deleteLeadSourceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { sourceId } = req.params;

    const business = await getOwnBusinessProfile(req.user.id);
    await deleteLeadSource(sourceId, business.id);

    return res.status(200).json({
      message: 'Lead source deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/business/interests/today
 * Get interests with follow-ups due today
 */
export const getTodayFollowUpsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const business = await getOwnBusinessProfile(req.user.id);
    const interests = await getTodayFollowUps(business.id);

    return res.status(200).json({
      interests,
      count: interests.length
    });
  } catch (error) {
    next(error);
  }
};
