import { Request, Response, NextFunction } from 'express';
import {
  getOwnBusinessProfile,
  updateOwnBusinessProfile,
  changeBusinessPassword,
  requestBusinessRemoval
} from '../services/businessProfile.service';
import { getBusinessInterests } from '../services/interest.service';

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
