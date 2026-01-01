import { Router } from 'express';
import {
  createOnboardingRequestHandler,
  listOnboardingRequestsHandler,
  approveOnboardingRequestHandler,
  rejectOnboardingRequestHandler,
  validateRegistrationTokenHandler,
  completeRegistrationHandler
} from '../controllers/onboarding.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createOnboardingRequestSchema,
  listOnboardingRequestsSchema,
  approveOnboardingRequestSchema,
  rejectOnboardingRequestSchema,
  validateTokenSchema,
  completeRegistrationSchema
} from '../validators/onboarding.validator';

const router = Router();

/**
 * @route   POST /api/onboarding/request
 * @desc    Submit initial onboarding inquiry
 * @access  Public
 */
router.post(
  '/request',
  validate(createOnboardingRequestSchema),
  createOnboardingRequestHandler
);

/**
 * @route   GET /api/onboarding/requests
 * @desc    List all onboarding requests (with filtering)
 * @access  Private (Admin)
 */
router.get(
  '/requests',
  authenticate,
  authorize('ADMIN'),
  validate(listOnboardingRequestsSchema),
  listOnboardingRequestsHandler
);

/**
 * @route   PUT /api/onboarding/requests/:id/approve
 * @desc    Approve onboarding request and generate registration token
 * @access  Private (Admin)
 */
router.put(
  '/requests/:id/approve',
  authenticate,
  authorize('ADMIN'),
  validate(approveOnboardingRequestSchema),
  approveOnboardingRequestHandler
);

/**
 * @route   PUT /api/onboarding/requests/:id/reject
 * @desc    Reject onboarding request with reason
 * @access  Private (Admin)
 */
router.put(
  '/requests/:id/reject',
  authenticate,
  authorize('ADMIN'),
  validate(rejectOnboardingRequestSchema),
  rejectOnboardingRequestHandler
);

/**
 * @route   GET /api/onboarding/validate/:token
 * @desc    Validate registration token
 * @access  Public
 */
router.get(
  '/validate/:token',
  validate(validateTokenSchema),
  validateRegistrationTokenHandler
);

/**
 * @route   POST /api/onboarding/register
 * @desc    Complete business registration with token
 * @access  Public
 */
router.post(
  '/register',
  validate(completeRegistrationSchema),
  completeRegistrationHandler
);

export default router;
