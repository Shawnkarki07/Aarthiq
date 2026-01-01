# Media Storage Setup Guide

## Overview

This guide covers setting up file storage for Capital Bridge Nepal, including:
- Local VPS storage (Phase 1 - MVP)
- Migration to Object Storage (Phase 2 - Production)
- Best practices and security

---

## Phase 1: VPS Local Storage (Recommended for MVP)

### 1. Server Setup

#### Create Upload Directory
```bash
# On your VPS
mkdir -p /var/www/capitalbridge/uploads
cd /var/www/capitalbridge/uploads

# Create subdirectories
mkdir -p logos pitch-decks videos brochures documents images

# Set permissions
chmod -R 755 /var/www/capitalbridge/uploads
chown -R www-data:www-data /var/www/capitalbridge/uploads  # Or your Node.js user
```

#### Update .env File
```env
# Base URL (your domain)
BASE_URL=https://capitalbridge.com

# Upload directory (absolute path)
UPLOAD_DIR=/var/www/capitalbridge/uploads

# Max file sizes (in bytes)
MAX_LOGO_SIZE=2097152        # 2MB
MAX_VIDEO_SIZE=104857600     # 100MB
MAX_DOCUMENT_SIZE=10485760   # 10MB
```

---

### 2. Express Server Setup

Update your main Express app to serve static files:

```typescript
// src/index.ts or src/app.ts

import express from 'express';
import path from 'path';
import uploadRoutes from './routes/upload.routes';

const app = express();

// ... other middleware ...

// Serve static files (uploaded media)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}));

// Upload routes
app.use('/api/upload', uploadRoutes);

// ... rest of your routes ...

export default app;
```

---

### 3. Caddy Configuration

Update your Caddyfile to serve static files efficiently:

```caddy
capitalbridge.com {
    # Handle uploaded files
    handle /uploads/* {
        root * /var/www/capitalbridge
        file_server {
            precompressed gzip
        }
        header {
            # Cache static files
            Cache-Control "public, max-age=86400"
            # Security headers
            X-Content-Type-Options "nosniff"
        }
    }

    # Reverse proxy to Node.js
    reverse_proxy localhost:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
    }

    # Enable compression
    encode gzip

    # Auto HTTPS
    tls {
        protocols tls1.2 tls1.3
    }
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

---

### 4. Usage Examples

#### Frontend Upload (JavaScript/React)

```javascript
// Upload logo
const uploadLogo = async (file, businessId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('businessId', businessId);
  formData.append('mediaType', 'logo');

  const response = await fetch('/api/upload/logo', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// Upload pitch deck
const uploadPitchDeck = async (file, businessId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('businessId', businessId);
  formData.append('mediaType', 'pitch_deck');
  formData.append('title', 'Investment Pitch Deck');

  const response = await fetch('/api/upload/media', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

#### Display Uploaded Files

```javascript
// In your React component
const BusinessDetail = ({ business }) => {
  return (
    <div>
      {/* Display logo */}
      <img src={business.logoUrl} alt={business.name} />

      {/* Display media */}
      {business.media.map(media => (
        <div key={media.id}>
          {media.mediaType === 'VIDEO' && (
            <video controls>
              <source src={media.fileUrl} type={media.mimeType} />
            </video>
          )}

          {media.mediaType === 'PITCH_DECK' && (
            <a href={media.fileUrl} download>
              Download Pitch Deck
            </a>
          )}

          {media.mediaType === 'IMAGE' && (
            <img src={media.fileUrl} alt={media.title} />
          )}
        </div>
      ))}
    </div>
  );
};
```

---

### 5. Backup Strategy (IMPORTANT!)

Since files are on VPS, you MUST backup regularly:

#### Automated Daily Backup Script

```bash
#!/bin/bash
# /var/www/capitalbridge/backup-uploads.sh

UPLOAD_DIR="/var/www/capitalbridge/uploads"
BACKUP_DIR="/var/backups/capitalbridge/uploads"
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Compress and backup
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz -C /var/www/capitalbridge uploads

# Keep only last 30 days of backups
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/uploads-$DATE.tar.gz"
```

Make it executable and add to cron:
```bash
chmod +x /var/www/capitalbridge/backup-uploads.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /var/www/capitalbridge/backup-uploads.sh
```

#### Optional: Backup to External Storage

```bash
# Using rsync to backup to another server
rsync -avz /var/www/capitalbridge/uploads/ user@backup-server:/backups/capitalbridge/

# Or use rclone to backup to cloud storage
rclone sync /var/www/capitalbridge/uploads/ remote:capitalbridge-backups/
```

---

## Phase 2: Migration to Object Storage (Production)

### Recommended: DigitalOcean Spaces ($5/month)

#### 1. Setup DigitalOcean Spaces

1. Create a Space in DigitalOcean
2. Get API Keys (Access Key & Secret Key)
3. Enable CDN

#### 2. Install AWS SDK (works with DO Spaces)

```bash
npm install aws-sdk
```

#### 3. Update Configuration

```typescript
// src/config/storage.config.ts
import AWS from 'aws-sdk';

const USE_OBJECT_STORAGE = process.env.USE_OBJECT_STORAGE === 'true';

// Configure DigitalOcean Spaces (S3-compatible)
const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT!);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET
});

export const uploadToStorage = async (
  file: Express.Multer.File,
  key: string
): Promise<string> => {
  if (USE_OBJECT_STORAGE) {
    // Upload to DigitalOcean Spaces
    const params = {
      Bucket: process.env.SPACES_BUCKET!,
      Key: key,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype
    };

    const result = await s3.upload(params).promise();
    return result.Location; // CDN URL
  } else {
    // Upload to local storage (existing logic)
    return localUploadLogic(file, key);
  }
};
```

#### 4. Update .env

```env
# Storage mode
USE_OBJECT_STORAGE=true

# DigitalOcean Spaces config
SPACES_ENDPOINT=sgp1.digitaloceanspaces.com
SPACES_KEY=your_access_key
SPACES_SECRET=your_secret_key
SPACES_BUCKET=capitalbridge
SPACES_CDN_URL=https://capitalbridge.sgp1.cdn.digitaloceanspaces.com
```

#### 5. Migration Script

```typescript
// scripts/migrate-to-spaces.ts
import { PrismaClient } from '@prisma/client';
import { uploadToStorage } from '../src/config/storage.config';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function migrateFiles() {
  // Get all media
  const allMedia = await prisma.businessMedia.findMany();

  for (const media of allMedia) {
    const localPath = media.fileUrl.replace(process.env.BASE_URL!, './uploads');

    if (fs.existsSync(localPath)) {
      const fileBuffer = fs.readFileSync(localPath);
      const file = {
        buffer: fileBuffer,
        mimetype: media.mimeType!,
        originalname: media.fileName
      } as Express.Multer.File;

      const key = `${media.mediaType.toLowerCase()}s/${media.businessId}/${media.fileName}`;
      const newUrl = await uploadToStorage(file, key);

      // Update database
      await prisma.businessMedia.update({
        where: { id: media.id },
        data: { fileUrl: newUrl }
      });

      console.log(`Migrated: ${media.fileName}`);
    }
  }

  console.log('Migration complete!');
}

migrateFiles();
```

---

## Comparison: VPS vs Object Storage

| Feature | VPS Local Storage | Object Storage (DO Spaces) |
|---------|-------------------|----------------------------|
| **Cost** | Free (included in VPS) | ~$5-10/month |
| **Setup Complexity** | Simple | Moderate |
| **Scalability** | Limited by disk | Unlimited |
| **Reliability** | Depends on VPS | 99.9% uptime |
| **Backup** | Manual required | Automatic |
| **CDN** | No (slower global access) | Yes (faster globally) |
| **Best For** | MVP, <100 businesses | Production, growth |

---

## Security Best Practices

### 1. File Validation

```typescript
// Validate file types
const ALLOWED_EXTENSIONS = {
  logo: ['.jpg', '.jpeg', '.png'],
  video: ['.mp4', '.mov'],
  document: ['.pdf', '.doc', '.docx'],
  pitch_deck: ['.pdf', '.ppt', '.pptx']
};

// Check file extension and MIME type
const isValidFile = (file: Express.Multer.File, type: string) => {
  const ext = path.extname(file.originalname).toLowerCase();
  return ALLOWED_EXTENSIONS[type].includes(ext) &&
         ALLOWED_MIME_TYPES[type].includes(file.mimetype);
};
```

### 2. Virus Scanning (Optional but Recommended)

```bash
# Install ClamAV
sudo apt install clamav clamav-daemon

# Update virus definitions
sudo freshclam

# Scan uploaded files
clamscan /var/www/capitalbridge/uploads
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: 'Too many uploads, please try again later'
});

app.use('/api/upload', uploadLimiter);
```

### 4. File Permissions

```bash
# Ensure proper permissions
find /var/www/capitalbridge/uploads -type d -exec chmod 755 {} \;
find /var/www/capitalbridge/uploads -type f -exec chmod 644 {} \;
```

---

## Monitoring & Maintenance

### Check Disk Usage

```bash
# Check upload directory size
du -sh /var/www/capitalbridge/uploads

# List largest files
du -ah /var/www/capitalbridge/uploads | sort -rh | head -20
```

### Cleanup Orphaned Files

```typescript
// scripts/cleanup-orphaned-files.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function cleanupOrphanedFiles() {
  const allMedia = await prisma.businessMedia.findMany();
  const dbFiles = new Set(allMedia.map(m => m.fileUrl));

  // Scan uploads directory
  const uploadDir = './uploads';
  // Compare and delete files not in database
  // ... implementation ...
}
```

---

## Cost Estimation

### VPS Storage (Phase 1)
- **Storage**: 0 (included in VPS)
- **Bandwidth**: Depends on VPS plan
- **Total**: $0 extra

### Object Storage (Phase 2)
Example for 100 businesses with avg 500MB each:
- **Storage**: 50GB × $0.02/GB = $1/month
- **Bandwidth**: 100GB × $0.01/GB = $1/month (DO Spaces)
- **Total**: ~$5/month (minimum DO Spaces fee)

---

## Recommendations

1. **Start with VPS Local Storage**
   - Simple, free, good for MVP
   - You already have VPS

2. **Implement Good Backups**
   - Daily automated backups
   - Test restore procedures

3. **Plan Migration**
   - When you reach 50+ businesses
   - Or when you need reliability/CDN
   - Migration script is ready

4. **Monitor Disk Space**
   - Set up alerts for 80% disk usage
   - Regular cleanup of old files

---

## Quick Start Checklist

- [ ] Create upload directories on VPS
- [ ] Update .env with BASE_URL and UPLOAD_DIR
- [ ] Configure Caddy to serve /uploads
- [ ] Test file upload with Postman
- [ ] Set up daily backup cron job
- [ ] Test file download from browser
- [ ] Implement rate limiting
- [ ] Set up disk space monitoring

---

## Support & Troubleshooting

### Common Issues

**1. "Permission denied" errors**
```bash
sudo chown -R $USER:$USER /var/www/capitalbridge/uploads
chmod -R 755 /var/www/capitalbridge/uploads
```

**2. Files not accessible via URL**
- Check Caddy configuration
- Verify file permissions (644 for files, 755 for directories)
- Check BASE_URL in .env

**3. "File too large" errors**
- Increase limits in upload.config.ts
- Check Nginx/Caddy upload limits

**4. Disk space full**
- Run cleanup script
- Check for orphaned files
- Consider migration to object storage

---

**Last Updated:** 2025-12-29
