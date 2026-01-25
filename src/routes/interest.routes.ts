import { Router } from 'express';
import {
  submitInterestHandler,
  getAllInterestsHandler,
  getBusinessInterestsHandler,
  updateInterestHandler,
  addInterestFollowUpHandler,
  updateFollowUpHandler,
  deleteFollowUpHandler,
  getTodayFollowUpsHandler,
  getSourcesHandler
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
 * @route   GET /api/interests/today
 * @desc    Get all interests with follow-ups due today (Admin only)
 * @access  Admin
 */
router.get(
  '/today',
  authenticate,
  authorize('ADMIN'),
  getTodayFollowUpsHandler
);

/**
 * @route   GET /api/interests/sources
 * @desc    Get all unique lead sources (Admin only)
 * @access  Admin
 */
router.get(
  '/sources',
  authenticate,
  authorize('ADMIN'),
  getSourcesHandler
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

/**
 * @route   PUT /api/interests/followups/:followUpId
 * @desc    Update a follow-up (Admin only)
 * @access  Admin
 */
router.put(
  '/followups/:followUpId',
  authenticate,
  authorize('ADMIN'),
  updateFollowUpHandler
);

/**
 * @route   DELETE /api/interests/followups/:followUpId
 * @desc    Delete a follow-up (Admin only)
 * @access  Admin
 */
router.delete(
  '/followups/:followUpId',
  authenticate,
  authorize('ADMIN'),
  deleteFollowUpHandler
);

export default router;
