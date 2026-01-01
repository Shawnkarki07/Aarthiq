import { Request, Response } from 'express';
import prisma from '../config/prisma.config';
import { upload, getFileUrl, deleteFile } from '../config/upload.config';

/**
 * Upload business media (logo, video, document, etc.)
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

    // Verify business exists and user owns it
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { businessLogin: true }
    });

    if (!business) {
      // Delete uploaded file if business not found
      deleteFile(file.path);
      return res.status(404).json({ error: 'Business not found' });
    }

    // TODO: Add authentication check
    // if (business.businessLoginId !== req.user?.id) {
    //   deleteFile(file.path);
    //   return res.status(403).json({ error: 'Not authorized' });
    // }

    // Generate file URL
    const fileUrl = getFileUrl(file.path);

    // Save to database
    const media = await prisma.businessMedia.create({
      data: {
        businessId,
        mediaType: mediaType.toUpperCase(),
        fileName: file.originalname,
        fileUrl,
        fileSize: BigInt(file.size),
        mimeType: file.mimetype,
        title: title || file.originalname,
        description: description || null,
      }
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      media: {
        ...media,
        fileSize: media.fileSize?.toString() // Convert BigInt to string for JSON
      }
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Delete uploaded file on error
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
 * Upload business logo
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

    // Generate file URL
    const logoUrl = getFileUrl(file.path);

    // Update business logo
    const business = await prisma.business.update({
      where: { id: businessId },
      data: { logoUrl }
    });

    return res.status(200).json({
      message: 'Logo uploaded successfully',
      logoUrl
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
 */
export const getBusinessMedia = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { mediaType } = req.query;

    const whereClause: any = { businessId };

    if (mediaType) {
      whereClause.mediaType = (mediaType as string).toUpperCase();
    }

    const media = await prisma.businessMedia.findMany({
      where: whereClause,
      orderBy: { displayOrder: 'asc' }
    });

    return res.status(200).json({
      media: media.map(m => ({
        ...m,
        fileSize: m.fileSize?.toString() // Convert BigInt to string
      }))
    });

  } catch (error) {
    console.error('Get media error:', error);
    return res.status(500).json({
      error: 'Failed to fetch media',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
