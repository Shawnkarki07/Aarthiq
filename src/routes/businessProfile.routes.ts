import { Router } from 'express';
import {
  getOwnProfileHandler,
  updateOwnProfileHandler,
  getOwnBusinessInterestsHandler
} from '../controllers/businessProfile.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  updateBusinessProfileSchema,
  listInterestsSchema
} from '../validators/businessProfile.validator';

const router = Router();

// All routes require BUSINESS authentication
router.use(authenticate);
router.use(authorize('BUSINESS'));

/**
 * @route   GET /api/business/profile
 * @desc    Get own business profile
 * @access  Private (Business)
 */
router.get('/profile', getOwnProfileHandler);

/**
 * @route   PUT /api/business/profile
 * @desc    Update own business profile
 * @access  Private (Business)
 */
router.put(
  '/profile',
  validate(updateBusinessProfileSchema),
  updateOwnProfileHandler
);

/**
 * @route   GET /api/business/interests
 * @desc    Get interest submissions for own business
 * @access  Private (Business)
 */
router.get(
  '/interests',
  validate(listInterestsSchema),
  getOwnBusinessInterestsHandler
);

export default router;
