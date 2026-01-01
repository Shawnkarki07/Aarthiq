import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Base upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  logo: 2 * 1024 * 1024,        // 2MB
  image: 5 * 1024 * 1024,       // 5MB
  video: 100 * 1024 * 1024,     // 100MB
  document: 10 * 1024 * 1024,   // 10MB
  pitchDeck: 10 * 1024 * 1024,  // 10MB
  brochure: 10 * 1024 * 1024,   // 10MB
};

// Allowed file types
const ALLOWED_MIME_TYPES = {
  logo: ['image/jpeg', 'image/jpg', 'image/png'],
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  pitchDeck: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  brochure: ['application/pdf'],
};

// Ensure upload directories exist
const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Initialize upload directories
Object.keys(ALLOWED_MIME_TYPES).forEach((type) => {
  ensureDirectoryExists(path.join(UPLOAD_DIR, `${type}s`));
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const fileType = req.body.mediaType || 'document';
    const businessId = req.body.businessId || 'temp';

    const uploadPath = path.join(UPLOAD_DIR, `${fileType}s`, businessId);
    ensureDirectoryExists(uploadPath);

    cb(null, uploadPath);
  },
  filename: (req: Request, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();

    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileType = req.body.mediaType || 'document';
  const allowedTypes = ALLOWED_MIME_TYPES[fileType as keyof typeof ALLOWED_MIME_TYPES] || [];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types for ${fileType}: ${allowedTypes.join(', ')}`));
  }
};

// Create multer upload instances for different file types
export const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.logo }
});

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.image }
});

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.video }
});

export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.document }
});

export const uploadPitchDeck = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.pitchDeck }
});

export const uploadBrochure = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.brochure }
});

// Generic upload with dynamic limits
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.video } // Max limit
});

// Helper function to get file URL
export const getFileUrl = (filePath: string): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  // Remove the uploads directory prefix and create URL
  const relativePath = filePath.replace(UPLOAD_DIR, '').replace(/\\/g, '/');
  return `${baseUrl}/uploads${relativePath}`;
};

// Helper function to delete file
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export { UPLOAD_DIR, FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES };
