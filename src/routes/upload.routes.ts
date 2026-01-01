import { Router } from 'express';
import {
  uploadBusinessMedia,
  uploadBusinessLogo,
  deleteBusinessMedia,
  getBusinessMedia
} from '../controllers/upload.controller';
import { upload, uploadLogo } from '../config/upload.config';

const router = Router();

/**
 * @route   POST /api/upload/media
 * @desc    Upload business media (video, document, brochure, pitch deck)
 * @access  Private (Business owner)
 */
router.post('/media', upload.single('file'), uploadBusinessMedia);

/**
 * @route   POST /api/upload/logo
 * @desc    Upload business logo
 * @access  Private (Business owner)
 */
router.post('/logo', uploadLogo.single('file'), uploadBusinessLogo);

/**
 * @route   GET /api/upload/media/:businessId
 * @desc    Get all media for a business
 * @query   mediaType (optional) - Filter by media type
 * @access  Public
 */
router.get('/media/:businessId', getBusinessMedia);

/**
 * @route   DELETE /api/upload/media/:mediaId
 * @desc    Delete business media
 * @access  Private (Business owner)
 */
router.delete('/media/:mediaId', deleteBusinessMedia);

export default router;
