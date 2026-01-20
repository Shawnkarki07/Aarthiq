import { Router } from 'express';
import {
  submitInterestHandler,
  getAllInterestsHandler,
  getBusinessInterestsHandler,
  updateInterestHandler,
  addInterestFollowUpHandler
} from '../controllers/interest.controller';
import { validate } from '../middlewares/validation.middleware';
import { submitInterestSchema } from '../validators/interest.validator';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/interests
 * @desc    Submit investor interest form
 * @access  Public
 */
router.post(
  '/',
  validate(submitInterestSchema),
  submitInterestHandler
);

/**
 * @route   GET /api/interests
 * @desc    Get all interest submissions (Admin only)
 * @access  Admin
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  getAllInterestsHandler
);

/**
 * @route   GET /api/interests/business/:businessId
 * @desc    Get interest submissions for a specific business (Admin only)
 * @access  Admin
 */
router.get(
  '/business/:businessId',
  authenticate,
  authorize('ADMIN'),
  getBusinessInterestsHandler
);

/**
 * @route   PUT /api/interests/:id
 * @desc    Update interest follow-up details (Admin only)
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  updateInterestHandler
);

/**
 * @route   POST /api/interests/:id/followups
 * @desc    Add a new follow-up to an interest submission (Admin only)
 * @access  Admin
 */
router.post(
  '/:id/followups',
  authenticate,
  authorize('ADMIN'),
  addInterestFollowUpHandler
);

export default router;
