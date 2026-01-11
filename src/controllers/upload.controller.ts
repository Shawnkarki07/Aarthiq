import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import { getFileUrl, deleteFile, GALLERY_LIMIT } from '../config/upload.config';
import { MediaType } from '@prisma/client';

// Valid media types from Prisma schema
const VALID_MEDIA_TYPES = [
  'REGISTRATION_CERTIFICATE',
  'PAN_CERTIFICATE',
  'FINANCIAL_DOCUMENT',
  'PITCH_DECK',
  'BROCHURE',
  'DOCUMENT',
  'COMPANY_LOGO',
  'GALLERY',
  'IMAGE',
  'VIDEO',
  'YOUTUBE_VIDEO',
  'WEBSITE',
] as const;

/**
 * Upload business media (documents, images, videos, etc.)
 */
export const uploadBusinessMedia = async (req: Request, res: Response) => {
  try {
    const { businessId, mediaType, title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    if (!mediaType) {
      deleteFile(file.path);
      return res.status(400).json({ error: 'Media type is required' });
    }

    const normalizedMediaType = mediaType.toUpperCase();

    // Validate media type
    if (!VALID_MEDIA_TYPES.includes(normalizedMediaType as any)) {
      deleteFile(file.path);
      return res.status(400).json({
        error: 'Invalid media type',
        validTypes: VALID_MEDIA_TYPES
      });
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { businessLogin: true }
    });

    if (!business) {
      deleteFile(file.path);
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check gallery limit (max 6 images)
    if (normalizedMediaType === 'GALLERY') {
      const galleryCount = await prisma.businessMedia.count({
        where: {
          businessId,
          mediaType: 'GALLERY'
        }
      });

      if (galleryCount >= GALLERY_LIMIT) {
        deleteFile(file.path);
        return res.status(400).json({
          error: `Gallery limit reached. Maximum ${GALLERY_LIMIT} images allowed.`,
          currentCount: galleryCount,
          limit: GALLERY_LIMIT
        });
      }
    }

    // Check for single-item media types (only one allowed per business)
    const singleItemTypes = ['COMPANY_LOGO', 'REGISTRATION_CERTIFICATE', 'PAN_CERTIFICATE', 'PITCH_DECK'];
    if (singleItemTypes.includes(normalizedMediaType)) {
      const existing = await prisma.businessMedia.findFirst({
        where: {
          businessId,
          mediaType: normalizedMediaType as MediaType
        }
      });

      if (existing) {
        deleteFile(file.path);
        return res.status(400).json({
          error: `A ${normalizedMediaType.toLowerCase().replace('_', ' ')} already exists. Delete the existing one first or update it.`,
          existingMediaId: existing.id
        });
      }
    }

    // Generate file URL
    const fileUrl = getFileUrl(file.path);

    // Get display order for gallery images
    let displayOrder = 0;
    if (normalizedMediaType === 'GALLERY') {
      const lastGalleryItem = await prisma.businessMedia.findFirst({
        where: { businessId, mediaType: 'GALLERY' },
        orderBy: { displayOrder: 'desc' }
      });
      displayOrder = (lastGalleryItem?.displayOrder || 0) + 1;
    }

    // Save to database
    const media = await prisma.businessMedia.create({
      data: {
        businessId,
        mediaType: normalizedMediaType as MediaType,
        fileName: file.originalname,
        fileUrl,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        title: title || file.originalname,
        description: description || null,
        displayOrder,
      }
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      media: {
        ...media,
        fileSize: media.fileSize?.toString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);

    if (req.file) {
      deleteFile(req.file.path);
    }

    return res.status(500).json({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Upload business logo (stores in both Business.logoUrl and BusinessMedia)
 */
export const uploadBusinessLogo = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      deleteFile(file.path);
      return res.status(404).json({ error: 'Business not found' });
    }

    // Generate file URL
    const logoUrl = getFileUrl(file.path);

    // Delete existing logo media if any
    await prisma.businessMedia.deleteMany({
      where: { businessId, mediaType: 'COMPANY_LOGO' }
    });

    // Create logo in BusinessMedia and update Business.logoUrl
    const [media] = await prisma.$transaction([
      prisma.businessMedia.create({
        data: {
          businessId,
          mediaType: 'COMPANY_LOGO',
          fileName: file.originalname,
          fileUrl: logoUrl,
          fileSize: BigInt(file.size),
          mimeType: file.mimetype,
          title: 'Company Logo',
        }
      }),
      prisma.business.update({
        where: { id: businessId },
        data: { logoUrl }
      })
    ]);

    return res.status(200).json({
      message: 'Logo uploaded successfully',
      logoUrl,
      media: {
        ...media,
        fileSize: media.fileSize?.toString()
      }
    });

  } catch (error) {
    console.error('Logo upload error:', error);

    if (req.file) {
      deleteFile(req.file.path);
    }

    return res.status(500).json({
      error: 'Failed to upload logo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Add external URL (YouTube video, Website link)
 */
export const addExternalUrl = async (req: Request, res: Response) => {
  try {
    const { businessId, mediaType, externalUrl, title, description } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    if (!mediaType) {
      return res.status(400).json({ error: 'Media type is required' });
    }

    if (!externalUrl) {
      return res.status(400).json({ error: 'External URL is required' });
    }

    const normalizedMediaType = mediaType.toUpperCase();

    // Only allow external URL types
    const externalUrlTypes = ['YOUTUBE_VIDEO', 'WEBSITE'];
    if (!externalUrlTypes.includes(normalizedMediaType)) {
      return res.status(400).json({
        error: 'Invalid media type for external URL',
        validTypes: externalUrlTypes
      });
    }

    // Validate URL format
    try {
      new URL(externalUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Create media entry
    const media = await prisma.businessMedia.create({
      data: {
        businessId,
        mediaType: normalizedMediaType as MediaType,
        externalUrl,
        title: title || externalUrl,
        description: description || null,
      }
    });

    return res.status(201).json({
      message: 'External URL added successfully',
      media
    });

  } catch (error) {
    console.error('Add external URL error:', error);
    return res.status(500).json({
      error: 'Failed to add external URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete business media
 */
export const deleteBusinessMedia = async (req: Request, res: Response) => {
  try {
    const { mediaId } = req.params;

    // Find media
    const media = await prisma.businessMedia.findUnique({
      where: { id: mediaId },
      include: { business: true }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // TODO: Add authentication check
    // if (media.business.businessLoginId !== req.user?.id) {
    //   return res.status(403).json({ error: 'Not authorized' });
    // }

    // Extract file path from URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const filePath = media.fileUrl?.replace(`${baseUrl}/uploads`, './uploads').replace(/\//g, '\\') || '';

    // Delete from filesystem
    deleteFile(filePath);

    // Delete from database
    await prisma.businessMedia.delete({
      where: { id: mediaId }
    });

    return res.status(200).json({
      message: 'Media deleted successfully'
    });

  } catch (error) {
    console.error('Delete media error:', error);
    return res.status(500).json({
      error: 'Failed to delete media',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get business media
 * Query params:
 *   - mediaType: Filter by specific media type
 *   - grouped: If 'true', returns media grouped by type
 */
export const getBusinessMedia = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { mediaType, grouped } = req.query;

    const whereClause: any = { businessId };

    if (mediaType) {
      whereClause.mediaType = (mediaType as string).toUpperCase();
    }

    const media = await prisma.businessMedia.findMany({
      where: whereClause,
      orderBy: [
        { mediaType: 'asc' },
        { displayOrder: 'asc' }
      ]
    });

    const formattedMedia = media.map(m => ({
      ...m,
      fileSize: m.fileSize?.toString()
    }));

    // Return grouped media if requested
    if (grouped === 'true') {
      const groupedMedia: Record<string, any[]> = {};

      formattedMedia.forEach(m => {
        const type = m.mediaType;
        if (!groupedMedia[type]) {
          groupedMedia[type] = [];
        }
        groupedMedia[type].push(m);
      });

      return res.status(200).json({
        media: groupedMedia,
        summary: {
          total: formattedMedia.length,
          byType: Object.fromEntries(
            Object.entries(groupedMedia).map(([type, items]) => [type, items.length])
          )
        }
      });
    }

    return res.status(200).json({
      media: formattedMedia,
      total: formattedMedia.length
    });

  } catch (error) {
    console.error('Get media error:', error);
    return res.status(500).json({
      error: 'Failed to fetch media',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get available media types and their limits
 */
export const getMediaTypes = async (_req: Request, res: Response) => {
  return res.status(200).json({
    mediaTypes: VALID_MEDIA_TYPES,
    limits: {
      GALLERY: { maxCount: GALLERY_LIMIT, description: 'Gallery images (up to 6)' },
      COMPANY_LOGO: { maxCount: 1, description: 'Company logo' },
      REGISTRATION_CERTIFICATE: { maxCount: 1, description: 'Company registration certificate' },
      PAN_CERTIFICATE: { maxCount: 1, description: 'PAN certificate' },
      PITCH_DECK: { maxCount: 1, description: 'Pitch deck presentation' },
      FINANCIAL_DOCUMENT: { maxCount: null, description: 'Financial documents (unlimited)' },
      BROCHURE: { maxCount: null, description: 'Brochures (unlimited)' },
      DOCUMENT: { maxCount: null, description: 'Other documents (unlimited)' },
      VIDEO: { maxCount: null, description: 'Videos (unlimited)' },
      YOUTUBE_VIDEO: { maxCount: null, description: 'YouTube video links (unlimited)' },
      WEBSITE: { maxCount: null, description: 'Website links (unlimited)' },
    }
  });
};
