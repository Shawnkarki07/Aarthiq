import { Router } from 'express';
import { submitInterestHandler, getAllInterestsHandler } from '../controllers/interest.controller';
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

export default router;
