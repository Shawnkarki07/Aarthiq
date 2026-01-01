import { Router } from 'express';
import { submitInterestHandler } from '../controllers/interest.controller';
import { validate } from '../middlewares/validation.middleware';
import { submitInterestSchema } from '../validators/interest.validator';

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

export default router;
