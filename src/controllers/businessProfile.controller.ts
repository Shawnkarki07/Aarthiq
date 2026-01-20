import { Request, Response, NextFunction } from 'express';
import {
  getOwnBusinessProfile,
  updateOwnBusinessProfile,
  changeBusinessPassword,
  requestBusinessRemoval
} from '../services/businessProfile.service';
import { getBusinessInterests, updateInterestFollowUp, addInterestFollowUp } from '../services/interest.service';

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

    const { page, limit } = req.query;

    const result = await getBusinessInterests(business.id, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
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
 * Update interest follow-up details (contacted status and remarks)
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
    const { contacted, followUpRemarks } = req.body;

    // Get the business ID for this login
    const business = await getOwnBusinessProfile(req.user.id);

    const updated = await updateInterestFollowUp(id, business.id, {
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
    const { remarks } = req.body;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ error: 'Remarks are required' });
    }

    // Get the business ID for this login
    const business = await getOwnBusinessProfile(req.user.id);

    const followUp = await addInterestFollowUp(id, business.id, remarks);

    return res.status(201).json({
      message: 'Follow-up added successfully',
      followUp
    });
  } catch (error) {
    next(error);
  }
};
