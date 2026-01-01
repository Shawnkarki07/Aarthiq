# Capital Bridge Nepal - Postman API Testing Guide

## Base URL
```
http://localhost:5000
```

## Complete Testing Flow

---

## 1. PUBLIC APIS (No Authentication Required)

### 1.1 Get All Approved Businesses
**Purpose:** Browse all businesses available for investment

```
GET /api/businesses
```

**Query Parameters (Optional):**
```
?categoryId=<uuid>      # Filter by category
&page=1                 # Page number
&limit=20              # Items per page
```

**Example Request:**
```
GET http://localhost:5000/api/businesses?page=1&limit=10
```

**Expected Response:**
```json
{
  "businesses": [
    {
      "id": "uuid",
      "name": "Tech Startup Nepal",
      "registrationNumber": "ABC123",
      "category": {
        "id": 1,
        "name": "Technology",
        "slug": "technology"
      },
      "businessType": "Pvt. Ltd.",
      "location": "Kathmandu",
      "investmentCapacityMin": "500000.00",
      "investmentCapacityMax": "2000000.00",
      "briefDescription": "...",
      "logoUrl": "...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 1.2 Get Business Detail by ID
**Purpose:** View detailed information about a specific business

```
GET /api/businesses/:id
```

**Example Request:**
```
GET http://localhost:5000/api/businesses/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response:**
```json
{
  "business": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Startup Nepal",
    "registrationNumber": "ABC123",
    "category": {
      "id": 1,
      "name": "Technology",
      "slug": "technology"
    },
    "businessType": "Pvt. Ltd.",
    "yearEstablished": 2020,
    "location": "Kathmandu",
    "teamSize": "10-50 employees",
    "paidUpCapital": "1000000.00",
    "investmentCapacityMin": "500000.00",
    "investmentCapacityMax": "2000000.00",
    "pricePerUnit": "100.00",
    "expectedReturnOptions": "IPO Exit, Dividend",
    "estimatedMarketValuation": "5000000.00",
    "ipoTimeHorizon": "3-5 years",
    "briefDescription": "Leading tech startup in Nepal",
    "fullDescription": "Detailed description...",
    "vision": "Our vision...",
    "mission": "Our mission...",
    "growthPlans": "Growth plans...",
    "contactEmail": "contact@techstartup.com",
    "contactPhone": "+977-1234567890",
    "website": "https://techstartup.com",
    "facebookUrl": "https://facebook.com/techstartup",
    "linkedinUrl": "https://linkedin.com/company/techstartup",
    "twitterUrl": "https://twitter.com/techstartup",
    "logoUrl": "https://example.com/logo.png",
    "viewCount": 145,
    "isFeatured": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 1.3 Submit Interest Form
**Purpose:** Investor submits interest to connect with a business

```
POST /api/interests
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "investorName": "John Doe",
  "phoneNumber": "+977-9812345678",
  "email": "john.doe@example.com",
  "remarks": "I'm interested in learning more about investment opportunities in your company."
}
```

**Expected Response:**
```json
{
  "message": "Interest submitted successfully",
  "interest": {
    "id": "uuid",
    "businessName": "Tech Startup Nepal",
    "submittedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

**Validation Errors (if any):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## 2. BUSINESS ONBOARDING FLOW

### 2.1 Submit Initial Onboarding Request
**Purpose:** Business submits initial inquiry to list on platform

```
POST /api/onboarding/request
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessName": "New Tech Company",
  "email": "info@newtechcompany.com",
  "phoneNumber": "+977-9812345678",
  "message": "We are a tech company looking to raise investment through your platform."
}
```

**Expected Response:**
```json
{
  "message": "Onboarding request submitted successfully",
  "request": {
    "id": "uuid",
    "businessName": "New Tech Company",
    "email": "info@newtechcompany.com",
    "status": "PENDING",
    "submittedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

---

## 3. ADMIN PANEL FLOW

### 3.1 Admin Login
**Purpose:** Admin authenticates to access admin panel

```
POST /api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@capitalbridge.com",
  "password": "Admin@123"
}
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "admin@capitalbridge.com",
    "role": "ADMIN",
    "username": "Admin"
  }
}
```

**Note:** Save the user ID, email, and role for subsequent requests.

---

### 3.2 List Pending Onboarding Requests
**Purpose:** Admin views businesses awaiting approval to register

```
GET /api/onboarding/requests?status=PENDING&page=1&limit=20
```

**Headers:**
```
Authorization: <userId>|<email>|ADMIN
```

**Example:**
```
Authorization: 123e4567-e89b-12d3-a456-426614174000|admin@capitalbridge.com|ADMIN
```

**Expected Response:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "businessName": "New Tech Company",
      "email": "info@newtechcompany.com",
      "phoneNumber": "+977-9812345678",
      "message": "We are a tech company...",
      "status": "PENDING",
      "submittedAt": "2024-01-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3.3 Approve Onboarding Request
**Purpose:** Admin approves request and generates registration token

```
PUT /api/onboarding/:id/approve
```

**Headers:**
```
Authorization: <userId>|<email>|ADMIN
Content-Type: application/json
```

**Example Request:**
```
PUT http://localhost:5000/api/onboarding/550e8400-e29b-41d4-a716-446655440000/approve
```

**Expected Response:**
```json
{
  "message": "Onboarding request approved",
  "request": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "businessName": "New Tech Company",
    "status": "APPROVED",
    "onboardingToken": "abc123xyz789token",
    "tokenExpiresAt": "2024-01-23T10:00:00.000Z"
  }
}
```

**Note:** An email is sent to the business with the registration link containing the token.

---

### 3.4 Reject Onboarding Request
**Purpose:** Admin rejects request with reason

```
PUT /api/onboarding/:id/reject
```

**Headers:**
```
Authorization: <userId>|<email>|ADMIN
Content-Type: application/json
```

**Request Body:**
```json
{
  "rejectionReason": "Business does not meet our criteria for listing on the platform."
}
```

**Expected Response:**
```json
{
  "message": "Onboarding request rejected",
  "request": {
    "id": "uuid",
    "businessName": "New Tech Company",
    "status": "REJECTED",
    "rejectionReason": "Business does not meet our criteria..."
  }
}
```

---

## 4. BUSINESS REGISTRATION FLOW

### 4.1 Validate Registration Token
**Purpose:** Business validates their registration token before filling form

```
GET /api/onboarding/validate-token?token=abc123xyz789token
```

**Expected Response:**
```json
{
  "isValid": true,
  "businessName": "New Tech Company",
  "email": "info@newtechcompany.com",
  "phoneNumber": "+977-9812345678"
}
```

**Error Response (if token invalid/expired):**
```json
{
  "error": "Token has expired"
}
```

---

### 4.2 Complete Business Registration
**Purpose:** Business completes full registration form with token

```
POST /api/onboarding/register
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "abc123xyz789token",
  "password": "SecurePassword@123",
  "businessData": {
    "name": "New Tech Company",
    "registrationNumber": "REG123456",
    "categoryId": 1,
    "businessType": "Pvt. Ltd.",
    "yearEstablished": 2020,
    "location": "Kathmandu",
    "teamSize": "10-50 employees",
    "paidUpCapital": 1000000,
    "investmentCapacityMin": 500000,
    "investmentCapacityMax": 2000000,
    "pricePerUnit": 100,
    "expectedReturnOptions": "IPO Exit, Dividend",
    "estimatedMarketValuation": 5000000,
    "ipoTimeHorizon": "3-5 years",
    "briefDescription": "Leading tech startup in Nepal focusing on innovative solutions",
    "fullDescription": "Detailed description of the company, its products, services, and market position...",
    "vision": "Our vision is to...",
    "mission": "Our mission is to...",
    "growthPlans": "Our growth plans include...",
    "contactEmail": "contact@newtechcompany.com",
    "contactPhone": "+977-1-4567890",
    "website": "https://newtechcompany.com",
    "facebookUrl": "https://facebook.com/newtechcompany",
    "linkedinUrl": "https://linkedin.com/company/newtechcompany",
    "twitterUrl": "https://twitter.com/newtechcompany"
  }
}
```

**Expected Response:**
```json
{
  "message": "Registration completed successfully",
  "user": {
    "id": "uuid",
    "email": "info@newtechcompany.com",
    "role": "BUSINESS"
  },
  "business": {
    "id": "uuid",
    "name": "New Tech Company",
    "status": "PENDING",
    "createdAt": "2024-01-20T11:00:00.000Z"
  }
}
```

**Note:** Business profile is created with status PENDING, awaiting admin approval.

---

## 5. ADMIN APPROVAL OF BUSINESS PROFILE

### 5.1 List Pending Business Profiles
**Purpose:** Admin views businesses awaiting final approval

```
GET /api/businesses/pending?page=1&limit=20
```

**Headers:**
```
Authorization: <userId>|<email>|ADMIN
```

**Expected Response:**
```json
{
  "businesses": [
    {
      "id": "uuid",
      "name": "New Tech Company",
      "registrationNumber": "REG123456",
      "businessLogin": {
        "id": "uuid",
        "email": "info@newtechcompany.com"
      },
      "category": {
        "id": 1,
        "name": "Technology",
        "slug": "technology"
      },
      "businessType": "Pvt. Ltd.",
      "status": "PENDING",
      "createdAt": "2024-01-20T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### 5.2 Approve Business Profile
**Purpose:** Admin approves business profile - goes live on platform

```
PUT /api/businesses/:id/approve
```

**Headers:**
```
Authorization: <userId>|<email>|ADMIN
Content-Type: application/json
```

**Example Request:**
```
PUT http://localhost:5000/api/businesses/550e8400-e29b-41d4-a716-446655440000/approve
```

**Expected Response:**
```json
{
  "message": "Business approved successfully",
  "business": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Tech Company",
    "status": "APPROVED"
  }
}
```

**Note:** Business is now visible on public listings and detail pages.

---

### 5.3 Reject Business Profile
**Purpose:** Admin rejects business profile with reason

```
PUT /api/businesses/:id/reject
```

**Headers:**
```
Authorization: <userId>|<email>|ADMIN
Content-Type: application/json
```

**Request Body:**
```json
{
  "rejectionReason": "Incomplete documentation provided. Please upload company registration certificate and financial statements."
}
```

**Expected Response:**
```json
{
  "message": "Business rejected",
  "business": {
    "id": "uuid",
    "name": "New Tech Company",
    "status": "REJECTED",
    "rejectionReason": "Incomplete documentation provided..."
  }
}
```

---

## 6. BUSINESS DASHBOARD FLOW

### 6.1 Business Login
**Purpose:** Business user authenticates to access dashboard

```
POST /api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "info@newtechcompany.com",
  "password": "SecurePassword@123"
}
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "info@newtechcompany.com",
    "role": "BUSINESS",
    "username": "New Tech Company"
  }
}
```

**Note:** Save the user ID, email, and role for subsequent requests.

---

### 6.2 Get Own Business Profile
**Purpose:** Business views their own profile

```
GET /api/business/profile
```

**Headers:**
```
Authorization: <userId>|<email>|BUSINESS
```

**Example:**
```
Authorization: 123e4567-e89b-12d3-a456-426614174001|info@newtechcompany.com|BUSINESS
```

**Expected Response:**
```json
{
  "business": {
    "id": "uuid",
    "name": "New Tech Company",
    "registrationNumber": "REG123456",
    "category": {
      "id": 1,
      "name": "Technology",
      "slug": "technology"
    },
    "businessType": "Pvt. Ltd.",
    "yearEstablished": 2020,
    "location": "Kathmandu",
    "status": "APPROVED",
    "rejectionReason": null,
    "viewCount": 145,
    "isFeatured": false,
    // ... all other business fields
  }
}
```

---

### 6.3 Update Own Business Profile
**Purpose:** Business updates their profile information

```
PUT /api/business/profile
```

**Headers:**
```
Authorization: <userId>|<email>|BUSINESS
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "briefDescription": "Updated brief description of our company",
  "fullDescription": "Updated detailed description...",
  "investmentCapacityMax": 3000000,
  "website": "https://newtechcompany.com",
  "growthPlans": "Updated growth plans for 2024..."
}
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully",
  "business": {
    "id": "uuid",
    "name": "New Tech Company",
    "status": "APPROVED",
    "updatedAt": "2024-01-21T10:00:00.000Z"
  }
}
```

---

### 6.4 Get Interest Submissions
**Purpose:** Business views investor inquiries for their company

```
GET /api/business/interests?page=1&limit=20
```

**Headers:**
```
Authorization: <userId>|<email>|BUSINESS
```

**Expected Response:**
```json
{
  "interests": [
    {
      "id": "uuid",
      "businessId": "uuid",
      "investorName": "John Doe",
      "phoneNumber": "+977-9812345678",
      "email": "john.doe@example.com",
      "remarks": "I'm interested in learning more about investment opportunities...",
      "submittedAt": "2024-01-20T15:30:00.000Z"
    },
    {
      "id": "uuid",
      "businessId": "uuid",
      "investorName": "Jane Smith",
      "phoneNumber": "+977-9876543210",
      "email": "jane.smith@example.com",
      "remarks": "Looking for tech investments in Nepal",
      "submittedAt": "2024-01-19T14:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

---

## TESTING SEQUENCE RECOMMENDATIONS

### Flow 1: Complete Business Onboarding Journey
1. Submit onboarding request (Public)
2. Admin login
3. Admin views pending requests
4. Admin approves request (generates token)
5. Validate token
6. Complete registration
7. Admin views pending business profiles
8. Admin approves business profile
9. Verify business appears in public listings

### Flow 2: Investor Interest Journey
1. Get all approved businesses
2. Get specific business detail
3. Submit interest form
4. Business login
5. Business views received interests

### Flow 3: Business Profile Management
1. Business login
2. Get own profile
3. Update profile
4. Verify changes

---

## ERROR RESPONSES

### Authentication Errors
```json
{
  "error": "Authentication required"
}
```

### Authorization Errors
```json
{
  "error": "Insufficient permissions"
}
```

### Validation Errors
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Not Found Errors
```json
{
  "error": "Business not found"
}
```

### Bad Request Errors
```json
{
  "error": "Business already approved"
}
```

---

## NOTES

1. **Authentication Header Format:**
   - Format: `<userId>|<email>|<role>`
   - Example: `123e4567-e89b-12d3-a456-426614174000|admin@capitalbridge.com|ADMIN`

2. **UUID Format:**
   - All IDs use UUID v4 format
   - Example: `550e8400-e29b-41d4-a716-446655440000`

3. **Pagination:**
   - Default page: 1
   - Default limit: 20
   - Use query parameters: `?page=1&limit=10`

4. **Token Expiration:**
   - Registration tokens expire after 72 hours
   - Token can only be used once

5. **Status Flow:**
   - Onboarding: PENDING → APPROVED/REJECTED
   - Business: PENDING → APPROVED/REJECTED

6. **Email Notifications:**
   - Onboarding approval: Email with registration link
   - Business approval: Approval email
   - Business rejection: Rejection email with reason
   - Interest submission: Confirmation to investor

---

## ENVIRONMENT SETUP

```env
PORT=5000
DATABASE_URL=<your-postgres-connection-string>
TOKEN_EXPIRATION_HOURS=72
```

---

## POSTMAN COLLECTION SETUP

1. Create environment variables:
   - `base_url`: http://localhost:5000
   - `admin_auth`: (save after admin login)
   - `business_auth`: (save after business login)
   - `business_id`: (save for testing)
   - `token`: (save registration token)

2. Use variables in requests:
   - URL: `{{base_url}}/api/businesses`
   - Header: `Authorization: {{admin_auth}}`

---

## QUICK TEST COMMANDS

**Test API is running:**
```
GET http://localhost:5000/
```

**Test database connection:**
```
GET http://localhost:5000/api/businesses
```

Should return empty array if no businesses exist yet.
