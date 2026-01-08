import { Router } from 'express';
import {
  listPendingBusinessesHandler,
  approveBusinessHandler,
  rejectBusinessHandler,
  listApprovedBusinessesHandler,
  getApprovedBusinessByIdHandler,
  listAllBusinessesForAdminHandler,
  getBusinessDetailsByIdForAdminHandler,
  updateBusinessHandler,
  toggleBusinessActiveHandler,
  listRemovalRequestsHandler,
  approveRemovalRequestHandler,
  rejectRemovalRequestHandler
} from '../controllers/business.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  listPendingBusinessesSchema,
  approveBusinessSchema,
  rejectBusinessSchema,
  listApprovedBusinessesSchema,
  getBusinessByIdSchema,
  listAllBusinessesForAdminSchema,
  updateBusinessSchema,
  toggleBusinessActiveSchema,
  listRemovalRequestsSchema,
  approveRemovalRequestSchema,
  rejectRemovalRequestSchema
} from '../validators/business.validator';

const router = Router();

/**
 * @route   GET /api/businesses
 * @desc    List all approved businesses
 * @access  Public
 */
router.get(
  '/',
  validate(listApprovedBusinessesSchema),
  listApprovedBusinessesHandler
);

/**
 * @route   GET /api/businesses/pending
 * @desc    List pending businesses for approval
 * @access  Private (Admin)
 */
router.get(
  '/pending',
  authenticate,
  authorize('ADMIN'),
  validate(listPendingBusinessesSchema),
  listPendingBusinessesHandler
);

/**
 * @route   PUT /api/businesses/:id/approve
 * @desc    Approve business profile
 * @access  Private (Admin)
 */
router.put(
  '/:id/approve',
  authenticate,
  authorize('ADMIN'),
  validate(approveBusinessSchema),
  approveBusinessHandler
);

/**
 * @route   PUT /api/businesses/:id/reject
 * @desc    Reject business profile with reason
 * @access  Private (Admin)
 */
router.put(
  '/:id/reject',
  authenticate,
  authorize('ADMIN'),
  validate(rejectBusinessSchema),
  rejectBusinessHandler
);

/**
 * @route   GET /api/businesses/active
 * @desc    List all businesses for admin (includes active/inactive status)
 * @access  Private (Admin)
 */
router.get(
  '/active',
  authenticate,
  authorize('ADMIN'),
  validate(listAllBusinessesForAdminSchema),
  listAllBusinessesForAdminHandler
);

/**
 * @route   PUT /api/businesses/:id/toggle-active
 * @desc    Toggle business active status
 * @access  Private (Admin)
 */
router.put(
  '/:id/toggle-active',
  authenticate,
  authorize('ADMIN'),
  validate(toggleBusinessActiveSchema),
  toggleBusinessActiveHandler
);

/**
 * @route   GET /api/businesses/removal-requests
 * @desc    List all removal requests
 * @access  Private (Admin)
 */
router.get(
  '/removal-requests',
  authenticate,
  authorize('ADMIN'),
  validate(listRemovalRequestsSchema),
  listRemovalRequestsHandler
);

/**
 * @route   PUT /api/businesses/removal-requests/:id/approve
 * @desc    Approve removal request and deactivate business
 * @access  Private (Admin)
 */
router.put(
  '/removal-requests/:id/approve',
  authenticate,
  authorize('ADMIN'),
  validate(approveRemovalRequestSchema),
  approveRemovalRequestHandler
);

/**
 * @route   PUT /api/businesses/removal-requests/:id/reject
 * @desc    Reject removal request
 * @access  Private (Admin)
 */
router.put(
  '/removal-requests/:id/reject',
  authenticate,
  authorize('ADMIN'),
  validate(rejectRemovalRequestSchema),
  rejectRemovalRequestHandler
);

/**
 * @route   GET /api/businesses/:id/details
 * @desc    Get full business details by ID (Admin)
 * @access  Private (Admin)
 */
router.get(
  '/:id/details',
  authenticate,
  authorize('ADMIN'),
  validate(getBusinessByIdSchema),
  getBusinessDetailsByIdForAdminHandler
);

/**
 * @route   PUT /api/businesses/:id
 * @desc    Update business details
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateBusinessSchema),
  updateBusinessHandler
);

/**
 * @route   GET /api/businesses/:id
 * @desc    Get approved business details by ID
 * @access  Public
 */
router.get(
  '/:id',
  validate(getBusinessByIdSchema),
  getApprovedBusinessByIdHandler
);

export default router;
