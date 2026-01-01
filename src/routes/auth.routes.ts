import { Router } from 'express';
import { loginHandler } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user (Business or Admin)
 * @access  Public
 */
router.post(
  '/login',
  validate(loginSchema),
  loginHandler
);

export default router;
