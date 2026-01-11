import { Router } from 'express';
import {
  uploadBusinessMedia,
  uploadBusinessLogo,
  deleteBusinessMedia,
  getBusinessMedia,
  addExternalUrl,
  getMediaTypes
} from '../controllers/upload.controller';
import { upload, uploadLogo } from '../config/upload.config';

const router = Router();

/**
 * @route   GET /api/upload/media-types
 * @desc    Get available media types and their limits
 * @access  Public
 */
router.get('/media-types', getMediaTypes);

/**
 * @route   POST /api/upload/media
 * @desc    Upload business media (documents, images, videos)
 * @body    businessId, mediaType, file, title (optional), description (optional)
 * @mediaTypes  REGISTRATION_CERTIFICATE, PAN_CERTIFICATE, FINANCIAL_DOCUMENT,
 *              PITCH_DECK, BROCHURE, DOCUMENT, COMPANY_LOGO, GALLERY, IMAGE, VIDEO
 * @access  Private (Business owner)
 */
router.post('/media', upload.single('file'), uploadBusinessMedia);

/**
 * @route   POST /api/upload/logo
 * @desc    Upload business logo
 * @body    businessId, file
 * @access  Private (Business owner)
 */
router.post('/logo', uploadLogo.single('file'), uploadBusinessLogo);

/**
 * @route   POST /api/upload/external-url
 * @desc    Add external URL (YouTube video, Website link)
 * @body    businessId, mediaType (YOUTUBE_VIDEO or WEBSITE), externalUrl, title (optional), description (optional)
 * @access  Private (Business owner)
 */
router.post('/external-url', addExternalUrl);

/**
 * @route   GET /api/upload/media/:businessId
 * @desc    Get all media for a business
 * @query   mediaType (optional) - Filter by media type
 * @query   grouped (optional) - If 'true', returns media grouped by type
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
