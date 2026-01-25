import { Router } from 'express';
import {
  getOwnProfileHandler,
  updateOwnProfileHandler,
  getOwnBusinessInterestsHandler,
  changePasswordHandler,
  requestRemovalHandler,
  updateInterestFollowUpHandler,
  addInterestFollowUpHandler,
  updateFollowUpHandler,
  deleteFollowUpHandler,
  getLeadSourcesHandler,
  addLeadSourceHandler,
  deleteLeadSourceHandler,
  getTodayFollowUpsHandler
} from '../controllers/businessProfile.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  updateBusinessProfileSchema,
  listInterestsSchema,
  changePasswordSchema,
  requestRemovalSchema
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

/**
 * @route   GET /api/business/interests/today
 * @desc    Get interests with follow-ups due today
 * @access  Private (Business)
 */
router.get('/interests/today', getTodayFollowUpsHandler);

/**
 * @route   PUT /api/business/interests/:id
 * @desc    Update interest (status, source, contacted, remarks)
 * @access  Private (Business)
 */
router.put(
  '/interests/:id',
  updateInterestFollowUpHandler
);

/**
 * @route   POST /api/business/interests/:id/followups
 * @desc    Add a new follow-up to an interest submission
 * @access  Private (Business)
 */
router.post(
  '/interests/:id/followups',
  addInterestFollowUpHandler
);

/**
 * @route   PUT /api/business/change-password
 * @desc    Change business account password
 * @access  Private (Business)
 */
router.put(
  '/change-password',
  validate(changePasswordSchema),
  changePasswordHandler
);

/**
 * @route   POST /api/business/request-removal
 * @desc    Request business profile removal
 * @access  Private (Business)
 */
router.post(
  '/request-removal',
  validate(requestRemovalSchema),
  requestRemovalHandler
);

/**
 * @route   PUT /api/business/followups/:followUpId
 * @desc    Update a follow-up
 * @access  Private (Business)
 */
router.put(
  '/followups/:followUpId',
  updateFollowUpHandler
);

/**
 * @route   DELETE /api/business/followups/:followUpId
 * @desc    Delete a follow-up
 * @access  Private (Business)
 */
router.delete(
  '/followups/:followUpId',
  deleteFollowUpHandler
);

/**
 * @route   GET /api/business/lead-sources
 * @desc    Get lead sources for own business
 * @access  Private (Business)
 */
router.get('/lead-sources', getLeadSourcesHandler);

/**
 * @route   POST /api/business/lead-sources
 * @desc    Add a custom lead source
 * @access  Private (Business)
 */
router.post('/lead-sources', addLeadSourceHandler);

/**
 * @route   DELETE /api/business/lead-sources/:sourceId
 * @desc    Delete a custom lead source
 * @access  Private (Business)
 */
router.delete('/lead-sources/:sourceId', deleteLeadSourceHandler);

export default router;
