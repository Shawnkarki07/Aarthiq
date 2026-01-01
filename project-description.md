
Investment Platform - Developer Documentation
Project Overview
We are developing an investment discovery platform that connects businesses seeking investment with potential investors in Nepal. The platform serves as a neutral marketplace where businesses can showcase their profiles, and interested investors can explore opportunities and express their interest.
Key Principles:
The platform does NOT promote or endorse any specific business
The platform does NOT influence investment decisions
We provide a transparent showcase environment where businesses display their information
We facilitate initial connections between businesses and interested parties
Business Model: Revenue is generated through business registration fees on the platform.
Scope
In Scope
For Businesses:
Business registration and profile creation
Upload investment materials (slides, videos, brochures, documents)
Display comprehensive company information
Manage their listing details
Receive lead information from interested investors
For Public Users (Investors):
Browse businesses without authentication (public access)
Filter and search businesses by multiple criteria
View detailed business profiles
Submit interest forms for businesses they want to connect with
Access investment materials (slides, videos, brochures)
For Platform Administrators:
Approve/reject business registrations
Manage business listings
Monitor platform activity
Content moderation
Out of Scope (Phase 1)
Direct messaging between businesses and investors
Payment processing for investments
Investment transaction tracking
User authentication for public viewers
Advanced analytics dashboard
Modules to be Developed
1. Business Registration Module
Purpose: Allow businesses to register and create their profiles
Features:
Multi-step registration form
Business information fields:
Company name, registration number
Business category (Tech, Hydropower, Fintech, Edtech, Manufacturing, etc.)
Paid-up capital
Investment capacity sought
Company description
Contact information
Location details
File upload system for:
Investment pitch decks (PDF/PPT)
Videos (MP4 or YouTube links)
Brochures (PDF)
Company documents
Registration fee payment integration (if applicable)
Submission confirmation
Technical Considerations:
Form validation
File size limits and format restrictions
Secure file storage
Registration status tracking (pending, approved, rejected)
2. Business Listing & Discovery Module
Purpose: Display all registered businesses with filtering and search capabilities
Features:
Card-based grid layout of businesses
Category-based browsing:
Tech Company
Hydropower
Fintech
Edtech
Manufacturing
Others (customizable)
Advanced filtering:
Paid-up capital range
Investment capacity range
Location
Business category
Date registered (newest first)
Search functionality (by company name, keywords)
Sorting options (alphabetical, capital, newest)
Pagination or infinite scroll
Business card preview showing:
Company logo
Company name
Category
Brief description
Investment range
Technical Considerations:
Efficient database queries for filtering
Caching for performance
Responsive grid layout
Image optimization
3. Business Detail Page Module
Purpose: Show comprehensive information about a specific business
Features:
Complete business profile display:
Full company description
Detailed financials
Investment opportunity details
Contact information
Social media links
Media gallery:
Investment presentation slides viewer
Embedded video player
Downloadable brochures
Additional documents
Interest submission form (Google Form style):
Name (required)
Phone number (required)
Email (required)
Remarks/Message (optional)
Submit button
Related businesses section (same category)
Share functionality (social media)
Technical Considerations:
Document viewer integration
Video embedding (YouTube/Vimeo or native)
Form validation and submission
Lead notification to business


4. Interest Management Module
Purpose: Capture and manage investor interest submissions
Features:
Form submission handling
Store lead information in database
Send confirmation email to investor
Lead dashboard for businesses to view submissions
Lead export functionality (CSV)
Technical Considerations:
Email service integration
Data privacy compliance
Spam prevention (basic CAPTCHA or rate limiting)
5. Admin Panel Module
Purpose: Platform management and content moderation
Features:
Admin authentication and authorization
Business registration approval workflow:
View pending registrations
Review business details
Approve or reject with reason
Business listing management:
Edit business information
Deactivate/activate listings
Delete listings
Category management (add/edit/delete categories)
Basic analytics:
Total businesses registered
Total interest submissions
Category distribution
User management (admin users)
Technical Considerations:
Role-based access control
Audit logs for admin actions
Secure authentication (JWT or sessions)
6. Public Homepage & Navigation
Purpose: Landing page and main navigation structure
Features:
Hero section with platform value proposition
Featured businesses carousel
Browse by category section
Statistics counter (total businesses, categories, etc.)
Search bar
Header navigation:
Home
Browse Businesses
Categories
For Businesses (registration)
About Us
Contact
Footer with links and information
Responsive mobile navigation
Technical Considerations:
SEO optimization
Fast loading time
Responsive design for all devices
Timeline: 20 Days
Week 1 (Days 1-7)
Days 1-2: Setup & Planning
Development environment setup
Database schema design
API architecture planning
Figma design review and component mapping
Repository setup and branching strategy
Days 3-5: Core Backend Development
Database setup (PostgreSQL with DBeaver)
Business registration API
Business listing API with filtering
File upload service setup
Authentication system for admin
Days 6-7: Admin Panel Backend
Admin authentication APIs
Business approval workflow APIs
Admin management endpoint
Week 2 (Days 8-14)
Days 8-10: Frontend Core Pages
Homepage development
Business listing page with filters
Business detail page layout
Component library setup (Mantine components)
Days 11-12: Business Registration Flow
Multi-step registration form
File upload integration
Form validation and submission
Days 13-14: Admin Panel Frontend
Admin login page
Business approval interface
Management dashboard
Week 3 (Days 15-20)
Days 15-16: Interest Form & Integration
Interest submission form
Email notification system
Lead management for businesses
Days 17-18: Testing & Bug Fixes
Functional testing of all modules
Cross-browser testing
Mobile responsiveness testing
Bug fixes and refinements
Days 19: Deployment Setup
Docker containerization
Caddy web server configuration
Contabo server setup
SSL certificate setup
Environment configuration
Day 20: Final Deployment & Handover
Production deployment
Final testing on production
Documentation handover
Training session (if needed)
Tech Stack
Frontend
Framework: JavaScript with Tanstack (TanStack Query for data fetching)
UI Library: Mantine Components (as per Figma design)
Routing: TanStack Router (or React Router)
State Management: TanStack Query + React Context (if needed)
Form Handling: React Hook Form or Mantine Form
Backend
Runtime: Node.js
Authentication: BetterAuth
Framework: Express.js (recommended)
Authentication: JWT (JSON Web Tokens)
File Upload: Multer
Email Service: Nodemailer (with SMTP)
Validation: Joi or Zod
API Documentation: Swagger/OpenAPI (optional but recommended)
Database
Database: PostgreSQL
ORM/Query Builder: Prisma
Management Tool: DBeaver
Migrations: Prisma Migrate
Deployment & DevOps
Containerization: Docker (with Docker Compose)
Web Server: Caddy (automatic HTTPS)
Hosting: Contabo Server
Version Control: GitHub
CI/CD: GitHub Actions (optional for automated deployment)
Environment Management: dotenv
Development Tools
Design: Figma (Mantine component library)
API Testing: Postman or Thunder Client
Code Quality: ESLint, Prettier
Git Workflow: Feature branching with pull requests
Database Schema (Preliminary)
Tables
businesses
id (primary key)
name
registration_number
category_id (foreign key)
paid_up_capital
investment_capacity
description
location
contact_email
contact_phone
website
status (pending, approved, rejected)
created_at
updated_at
categories
id (primary key)
name
slug
description
business_media
id (primary key)
business_id (foreign key)
media_type (video, document, image, brochure)
file_url
file_name
uploaded_at
interest_submissions
id (primary key)
business_id (foreign key)
investor_name
phone_number
email
remarks
submitted_at
admins
id (primary key)
username
email
password_hash
role
created_at


API Endpoints (Overview)
Public APIs
GET /api/businesses - List businesses with filters
GET /api/businesses/:id - Get business details
GET /api/categories - List all categories
POST /api/interest - Submit interest form
POST /api/business-registration - Register new business
Admin APIs (Protected)
POST /api/admin/login - Admin authentication
GET /api/admin/businesses/pending - Get pending registrations
PUT /api/admin/businesses/:id/approve - Approve business
PUT /api/admin/businesses/:id/reject - Reject business
GET /api/admin/analytics - Get platform analytics
Development Guidelines
Code Standards
Follow consistent naming conventions
Write modular, reusable components
Comment complex logic
Use environment variables for configuration
Never commit sensitive data (API keys, passwords)
Git Workflow
Create feature branches from develop
Branch naming: feature/module-name or fix/bug-description
Commit messages: Clear and descriptive
Pull requests required for merging to develop
main branch only for production-ready code
Testing Checklist
All forms validate correctly
File uploads work with size limits
Filtering and search return correct results
Interest form sends emails properly
Admin approval workflow functions correctly
Responsive design works on mobile, tablet, desktop
Cross-browser compatibility (Chrome, Firefox, Safari)
Performance optimization (image compression, lazy loading)
Security Considerations
Sanitize all user inputs to prevent SQL injection
Implement rate limiting on APIs
Secure file upload validation (file type, size)
Use HTTPS (handled by Caddy)
Protect admin routes with authentication
Hash passwords with bcrypt
Implement CORS properly
Add basic CAPTCHA to interest form to prevent spam
Deployment Checklist
Environment variables configured
Database migrations run successfully
Docker containers built and tested
Caddy configuration set up with SSL
Static files served correctly
Email service configured and tested
Backup strategy implemented
Monitoring setup (error logging)
Documentation updated with deployment steps
Post-Launch Considerations
Immediate
Monitor error logs daily
Gather user feedback
Fix critical bugs promptly
Future Enhancements (Phase 2)
User authentication for investors
Advanced analytics dashboard
Direct messaging system
Investment tracking
Mobile applications
Multi-language support (Nepali/English)
Advanced search with AI recommendations

