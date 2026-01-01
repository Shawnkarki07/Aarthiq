# Capital Bridge Nepal - Database Schema Documentation

## Overview

This document describes the database schema for Capital Bridge Nepal's investment discovery platform - a neutral marketplace connecting businesses seeking investment with potential investors in Nepal.

## Architecture

The schema uses **PostgreSQL** as the database and **Prisma ORM** for type-safe database access.

### Database Structure

```
┌─────────────────────────────────────────────────┐
│              CATEGORIES TABLE                    │
│  (Tech, Fintech, Healthcare, etc.)              │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│                 USERS TABLE                      │
│  (Businesses & Admins)                          │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│              BUSINESSES TABLE                    │
│  (Main business information)                    │
└─────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐    ┌─────────────────────────┐
│ BUSINESS_MEDIA   │    │ INTEREST_SUBMISSIONS    │
│ (Docs, Videos)   │    │ (Investor Leads)        │
└──────────────────┘    └─────────────────────────┘
```

## Core Models

### 1. User Model
**Purpose:** Authentication for businesses and admins

**Key Fields:**
- `id` (UUID) - Primary key
- `email` - Unique, used for login
- `passwordHash` - Bcrypt hashed password
- `role` - Enum: BUSINESS or ADMIN
- `username` - Optional username (mainly for admins)
- `isActive` - Account status

**Relations:**
- One User → One Business (for BUSINESS role)

**Notes:**
- Public investors don't need accounts (no authentication required to browse)
- Only businesses and admins need to log in

---

### 2. Category Model
**Purpose:** Business categories for filtering and organization

**Key Fields:**
- `id` (Auto-increment) - Primary key
- `name` - Display name (e.g., "Tech Company", "Fintech")
- `slug` - URL-friendly identifier (e.g., "tech", "fintech")
- `description` - Category description

**Seeded Categories:**
- Tech Company
- Hydropower
- Fintech
- Edtech
- Manufacturing
- Tourism & Hospitality
- Agriculture
- Real Estate
- Healthcare
- Food & Beverage
- Retail
- Others

---

### 3. Business Model
**Purpose:** Complete business profile and registration data

**Key Fields:**

#### Basic Information
- `id` (UUID) - Primary key
- `userId` → User (FK, unique)
- `name` - Business name
- `registrationNumber` - Unique government registration number
- `categoryId` → Category (FK)

#### Business Type & Details
- `businessType` - String: "Pvt. Ltd.", "Public Ltd.", "Partnership", "Sole Proprietorship", "NGO/INGO", "Other"
- `yearEstablished` - Integer (founding year)
- `location` - String: "Kathmandu", "Pokhara", "Biratnagar", etc.
- `teamSize` - String: "1-5 employees", "6-10 employees", etc.

#### Financial Information
- `paidUpCapital` (Decimal) - In NPR
- `investmentCapacityMin` (Decimal) - Minimum investment sought
- `investmentCapacityMax` (Decimal) - Maximum investment sought

#### Description & Content
- `briefDescription` (200 chars) - Tagline for listings
- `fullDescription` (Optional, Text) - Detailed company description

#### Contact Information
- `contactEmail` - Business contact email
- `contactPhone` - Phone number
- `website` - Optional company website

#### Social Media (Optional)
- `facebookUrl`
- `linkedinUrl`
- `twitterUrl`

#### Media
- `logoUrl` - Company logo path/URL

#### Status & Approval
- `status` - Enum: PENDING, APPROVED, REJECTED
- `rejectionReason` - Explanation if rejected

#### Metadata
- `viewCount` - Track profile views
- `isFeatured` - Featured business flag
- `createdAt`, `updatedAt` - Timestamps

**Relations:**
- One Business → One User
- One Business → One Category
- One Business → Many BusinessMedia
- One Business → Many InterestSubmissions

---

### 4. BusinessMedia Model
**Purpose:** Store all uploaded files (videos, documents, brochures, pitch decks)

**Key Fields:**
- `id` (UUID) - Primary key
- `businessId` → Business (FK)
- `mediaType` - Enum: VIDEO, DOCUMENT, IMAGE, BROCHURE, PITCH_DECK
- `fileName` - Original filename
- `fileUrl` - Storage path/URL
- `fileSize` - File size in bytes
- `mimeType` - MIME type
- `title` - Optional display title
- `description` - Optional description
- `displayOrder` - For ordering media items
- `uploadedAt` - Upload timestamp

**Media Types:**
- **VIDEO**: Investment pitch videos (MP4, YouTube links)
- **DOCUMENT**: Company documents, certificates
- **IMAGE**: Additional images beyond logo
- **BROCHURE**: Marketing brochures (PDF)
- **PITCH_DECK**: Investment presentations (PDF/PPT)

---

### 5. InterestSubmission Model
**Purpose:** Capture investor interest (lead generation)

**Key Fields:**
- `id` (UUID) - Primary key
- `businessId` → Business (FK)
- `investorName` - Name of interested investor
- `phoneNumber` - Contact phone
- `email` - Contact email
- `remarks` - Optional message/questions
- `submittedAt` - Submission timestamp

**Notes:**
- No authentication required for investors to submit interest
- Similar to a contact form
- Businesses can view and export their leads

---

## Enums

```typescript
enum UserRole {
  BUSINESS  // Business seeking investment
  ADMIN     // Platform administrator
}

enum BusinessStatus {
  PENDING   // Awaiting admin approval
  APPROVED  // Approved and visible to public
  REJECTED  // Rejected by admin
}

enum MediaType {
  VIDEO       // Video files or YouTube links
  DOCUMENT    // General documents
  IMAGE       // Images
  BROCHURE    // Marketing brochures
  PITCH_DECK  // Investment pitch decks
}
```

---

## Key Features

### 1. Simple & Flexible
- No separate lookup tables for locations, business types, team sizes
- These are stored as simple strings for flexibility
- Easy to change without database migrations

### 2. Public Browsing
- No authentication required for investors
- Anyone can browse businesses and submit interest
- Only businesses and admins need accounts

### 3. Media Management
- Single table for all media types
- Supports videos, documents, brochures, pitch decks
- Display order for controlling presentation

### 4. Lead Capture
- Simple interest submission form
- No complex CRM features
- Businesses can view and manage their leads

### 5. Admin Approval Workflow
- Simple three-state approval (pending, approved, rejected)
- Rejection reason tracking
- Featured business capability

### 6. Performance Optimization
- Strategic indexes on frequently queried fields
- UUID for distributed scalability
- Simple structure for fast queries

---

## Database Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/capitalbridge?schema=public"
```

### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

### 4. Create Migration
```bash
npm run prisma:migrate dev --name init
```

### 5. Seed Categories
```bash
npm run prisma:seed
```

### 6. Open Prisma Studio (Optional)
```bash
npm run prisma:studio
```

---

## Common Queries

### Get all approved businesses with filters
```typescript
const businesses = await prisma.business.findMany({
  where: {
    status: 'APPROVED',
    categoryId: categoryId, // Optional filter
    location: { contains: 'Kathmandu' }, // Optional filter
    paidUpCapital: { gte: minCapital, lte: maxCapital } // Optional filter
  },
  include: {
    category: true,
    user: { select: { email: true } }
  },
  orderBy: { createdAt: 'desc' }
});
```

### Get business detail with all media
```typescript
const business = await prisma.business.findUnique({
  where: { id: businessId },
  include: {
    category: true,
    user: { select: { email: true } },
    media: {
      orderBy: { displayOrder: 'asc' }
    },
    interests: {
      orderBy: { submittedAt: 'desc' },
      take: 10 // Latest 10 interests
    }
  }
});

// Increment view count
await prisma.business.update({
  where: { id: businessId },
  data: { viewCount: { increment: 1 } }
});
```

### Submit investor interest
```typescript
const interest = await prisma.interestSubmission.create({
  data: {
    businessId,
    investorName: 'John Doe',
    phoneNumber: '+977-9812345678',
    email: 'john@example.com',
    remarks: 'Interested in learning more about your business'
  }
});

// Send notification email to business
// (implement email service separately)
```

### Approve a business (Admin)
```typescript
const approvedBusiness = await prisma.business.update({
  where: { id: businessId },
  data: {
    status: 'APPROVED'
  }
});
```

### Get pending businesses for admin
```typescript
const pendingBusinesses = await prisma.business.findMany({
  where: { status: 'PENDING' },
  include: {
    category: true,
    user: { select: { email: true } }
  },
  orderBy: { createdAt: 'asc' }
});
```

### Search businesses
```typescript
const results = await prisma.business.findMany({
  where: {
    status: 'APPROVED',
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { briefDescription: { contains: searchTerm, mode: 'insensitive' } },
      { fullDescription: { contains: searchTerm, mode: 'insensitive' } }
    ]
  },
  include: {
    category: true
  }
});
```

---

## Business Registration Flow

1. **User Creates Account**
   - User registers with email/password
   - Role automatically set to BUSINESS

2. **Business Submits Profile**
   - Fill in all business information
   - Upload logo and media files
   - Status set to PENDING

3. **Admin Reviews**
   - Admin logs in to admin panel
   - Reviews pending businesses
   - Approves or rejects with reason

4. **Business Goes Live**
   - If approved: Visible to public
   - If rejected: Business can edit and resubmit

5. **Investors Express Interest**
   - Browse businesses (no login required)
   - Submit interest form
   - Business receives lead

---

## Security Considerations

### 1. Authentication
- Use BetterAuth for secure authentication
- Password hashing with bcrypt
- JWT tokens for session management

### 2. File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Use secure cloud storage (AWS S3, etc.)
- Generate unique filenames

### 3. Input Validation
- Validate all inputs on server-side
- Use Prisma's type safety
- Sanitize user inputs to prevent XSS
- Implement rate limiting on interest submissions

### 4. Access Control
- Businesses can only edit their own profiles
- Admins can view/edit all businesses
- Public can only view approved businesses

### 5. Data Privacy
- Don't expose sensitive business data
- Respect GDPR/privacy laws
- Allow businesses to delete their accounts

---

## API Endpoints Overview

Based on the schema, here are the recommended endpoints:

### Public APIs (No Auth Required)
```
GET  /api/businesses           # List approved businesses with filters
GET  /api/businesses/:id       # Get business details
GET  /api/categories           # List all categories
POST /api/interest             # Submit interest form
```

### Business APIs (Auth Required)
```
POST /api/auth/register        # Register new business
POST /api/auth/login           # Login
GET  /api/business/me          # Get own business profile
PUT  /api/business/me          # Update own business
POST /api/business/media       # Upload media
GET  /api/business/interests   # Get interest submissions
```

### Admin APIs (Auth Required, Admin Role)
```
POST /api/admin/login          # Admin login
GET  /api/admin/businesses     # Get all businesses
PUT  /api/admin/businesses/:id/approve   # Approve business
PUT  /api/admin/businesses/:id/reject    # Reject business
GET  /api/admin/analytics      # Platform statistics
```

---

## Future Enhancements

### Phase 2 Possible Features
1. **Investor Accounts**
   - Optional investor registration
   - Save favorite businesses
   - Track interest history

2. **Advanced Search**
   - Full-text search
   - Multiple filters combination
   - AI-powered recommendations

3. **Communication**
   - Direct messaging
   - In-app notifications
   - Email campaigns

4. **Analytics**
   - Business dashboard
   - View tracking
   - Engagement metrics

5. **Payment Integration**
   - Registration fee payment
   - Subscription tiers
   - Featured listings payment

---

## Maintenance

### Regular Tasks
1. Monitor database performance
2. Clean up orphaned media files
3. Review and moderate business content
4. Update categories if needed
5. Backup database regularly

### Backup Strategy
1. Daily automated backups
2. Weekly off-site backups
3. Test restore procedures monthly
4. Keep backups for at least 90 days

---

**Last Updated:** 2025-12-29
**Schema Version:** 2.0.0 (Simplified)
