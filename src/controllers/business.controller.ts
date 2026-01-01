import { Request, Response, NextFunction } from 'express';
import {
  listPendingBusinesses,
  approveBusiness,
  rejectBusiness,
  listApprovedBusinesses,
  getApprovedBusinessById
} from '../services/business.service';

/**
 * GET /api/businesses/pending
 * List pending businesses for approval (Admin)
 */
export const listPendingBusinessesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = req.query;

    const result = await listPendingBusinesses({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/businesses/:id/approve
 * Approve business
 */
export const approveBusinessHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const business = await approveBusiness(id);

    return res.status(200).json({
      message: 'Business approved successfully',
      business: {
        id: business.id,
        name: business.name,
        status: business.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/businesses/:id/reject
 * Reject business
 */
export const rejectBusinessHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const business = await rejectBusiness(id, rejectionReason);

    return res.status(200).json({
      message: 'Business rejected',
      business: {
        id: business.id,
        name: business.name,
        status: business.status,
        rejectionReason: business.rejectionReason
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/businesses
 * List approved businesses (Public)
 */
export const listApprovedBusinessesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId, page, limit } = req.query;

    const result = await listApprovedBusinesses({
      categoryId: categoryId as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/businesses/:id
 * Get approved business by ID (Public)
 */
export const getApprovedBusinessByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const business = await getApprovedBusinessById(id);

    return res.status(200).json({ business });
  } catch (error) {
    next(error);
  }
};
