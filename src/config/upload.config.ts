import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Base upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  // Images
  COMPANY_LOGO: 2 * 1024 * 1024,              // 2MB
  GALLERY: 5 * 1024 * 1024,                    // 5MB per image
  IMAGE: 5 * 1024 * 1024,                      // 5MB

  // Documents
  REGISTRATION_CERTIFICATE: 10 * 1024 * 1024,  // 10MB
  PAN_CERTIFICATE: 10 * 1024 * 1024,           // 10MB
  FINANCIAL_DOCUMENT: 20 * 1024 * 1024,        // 20MB (may have multiple pages)
  PITCH_DECK: 50 * 1024 * 1024,                // 50MB (presentations can be large)
  BROCHURE: 20 * 1024 * 1024,                  // 20MB
  DOCUMENT: 10 * 1024 * 1024,                  // 10MB

  // Video
  VIDEO: 100 * 1024 * 1024,                    // 100MB
};

// Allowed file types per media type
const ALLOWED_MIME_TYPES = {
  // Images
  COMPANY_LOGO: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  GALLERY: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  // Documents (PDF for certificates, PDF/Word/Excel for others)
  REGISTRATION_CERTIFICATE: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  PAN_CERTIFICATE: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  FINANCIAL_DOCUMENT: [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/x-excel',
    'application/x-msexcel',
  ],
  PITCH_DECK: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  BROCHURE: ['application/pdf'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],

  // Video
  VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
};

// Gallery images limit per business
const GALLERY_LIMIT = 6;

// Ensure upload directories exist
const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Directory mapping for each media type
const MEDIA_TYPE_DIRECTORIES: Record<string, string> = {
  COMPANY_LOGO: 'logos',
  GALLERY: 'gallery',
  IMAGE: 'images',
  REGISTRATION_CERTIFICATE: 'certificates',
  PAN_CERTIFICATE: 'certificates',
  FINANCIAL_DOCUMENT: 'financial',
  PITCH_DECK: 'pitch-decks',
  BROCHURE: 'brochures',
  DOCUMENT: 'documents',
  VIDEO: 'videos',
};

// Initialize upload directories
Object.values(MEDIA_TYPE_DIRECTORIES).forEach((dir) => {
  ensureDirectoryExists(path.join(UPLOAD_DIR, dir));
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const mediaType = (req.body.mediaType || 'DOCUMENT').toUpperCase();
    const businessId = req.body.businessId || 'temp';
    const directory = MEDIA_TYPE_DIRECTORIES[mediaType] || 'documents';

    const uploadPath = path.join(UPLOAD_DIR, directory, businessId);
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

// File filter - disabled for now, will validate in controller
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept all files here, validation will happen in the controller
  // This is necessary because req.body is not available during multipart parsing
  cb(null, true);
};

// Generic upload with max file size (100MB for videos)
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.VIDEO }
});

// Logo-specific storage configuration
const logoStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const businessId = req.body.businessId || 'temp';
    const directory = 'logos';
    const uploadPath = path.join(UPLOAD_DIR, directory, businessId);
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req: Request, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// Logo file filter - only accept images
const logoFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid logo file type. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Logo-specific upload (smaller limit)
export const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: logoFileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.COMPANY_LOGO }
});

// Get file size limit for a media type
export const getFileSizeLimit = (mediaType: string): number => {
  const type = mediaType.toUpperCase();
  return FILE_SIZE_LIMITS[type as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.DOCUMENT;
};

// Helper function to get file URL
export const getFileUrl = (filePath: string): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  // Normalize path separators
  let normalizedPath = filePath.replace(/\\/g, '/');
  
  // Remove any leading ./ or /
  normalizedPath = normalizedPath.replace(/^\.\//, '').replace(/^\//, '');
  
  // Remove uploads/ prefix if it exists (since we'll add it back)
  normalizedPath = normalizedPath.replace(/^uploads\//, '');
  
  // Construct the final URL
  return `${baseUrl}/uploads/${normalizedPath}`;
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

// Registration-specific storage configuration
const registrationStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // Determine directory based on field name
    let directory = 'documents';
    if (file.fieldname === 'companyLogo') {
      directory = 'logos';
    } else if (file.fieldname === 'registrationCertificate' || file.fieldname === 'panCertificate') {
      directory = 'certificates';
    } else if (file.fieldname === 'pitchDeck') {
      directory = 'pitch-decks';
    } else if (file.fieldname === 'galleryImages') {
      directory = 'gallery';
    }

    // Use 'temp' folder during registration, will be moved after business is created
    const uploadPath = path.join(UPLOAD_DIR, directory, 'temp');
    ensureDirectoryExists(uploadPath);

    cb(null, uploadPath);
  },
  filename: (req: Request, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();

    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// Registration file filter - allow images and documents
const registrationFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const documentTypes = [
    'application/pdf',
    'image/jpeg', 'image/jpg', 'image/png',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  let allowedTypes: string[] = [];

  if (file.fieldname === 'companyLogo' || file.fieldname === 'galleryImages') {
    allowedTypes = imageTypes;
  } else if (file.fieldname === 'pitchDeck') {
    allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
  } else {
    // Certificates and other documents
    allowedTypes = documentTypes;
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${allowedTypes.join(', ')}`));
  }
};

// Registration upload middleware (handles multiple files)
export const registrationUpload = multer({
  storage: registrationStorage,
  fileFilter: registrationFileFilter,
  limits: { fileSize: FILE_SIZE_LIMITS.PITCH_DECK } // 50MB max for pitch decks
});

// Move file from temp to business-specific folder
export const moveFileToBusinessFolder = (tempPath: string, businessId: string): string => {
  const directory = path.dirname(tempPath);
  const fileName = path.basename(tempPath);
  const newDirectory = directory.replace('/temp', `/${businessId}`);

  ensureDirectoryExists(newDirectory);

  const newPath = path.join(newDirectory, fileName);
  fs.renameSync(tempPath, newPath);

  return newPath;
};

export { UPLOAD_DIR, FILE_SIZE_LIMITS, ALLOWED_MIME_TYPES, GALLERY_LIMIT, MEDIA_TYPE_DIRECTORIES };
