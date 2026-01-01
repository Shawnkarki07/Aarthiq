

Investment Platform – UI/UX & Functional Documentation

1. Purpose of This Document
This document captures the agreed UI/UX feedback, functional requirements, and system flows discussed with the client. It is intended for designers, frontend developers, backend developers, and QA to ensure a consistent understanding of the platform behavior.
The platform is a neutral business discovery and investment showcase platform. It does not promote, recommend, or influence investments.

2. Home Page Requirements
2.1 Hero Section
Objective: Create an emotional connection around financial freedom and early-stage opportunity.
Components:
Full-width hero image (aspirational, finance + growth theme)
Overlay text
Primary Tagline (suggested):
Unlock Early Access to High-Growth Companies Before They Go Public
Supporting Text (suggested):
Explore top unlisted companies and build long-term wealth through informed decisions.

2.2 Business Listings on Home Page
Requirements:
All listed businesses must be visible on the home page
Layout: 2 business cards per row
Scrollable vertically
Cards should be visually engaging and clickable
Each Business Card Displays:
Business logo
Business name
Sector
Short tagline
Location
Parameters

2.3 Explore Our Sectors Section
Title: Explore Our Sectors
Sectors to Display:
Tech Company
Hydropower
Fintech
EdTech
Manufacturing
Tourism & Hospitality
Agriculture
Real Estate
Healthcare
Food & Beverage
Retail
Others
Each sector should be clickable and filter the business listing accordingly.

2.4 Primary Call-to-Action (CTA)
Text:
Ready to Find Your Next Investment?
Button:
Browse Businesses

2.5 List Your Business CTA
CTA Button: List Your Business
On Click: Opens a modal / form
Form Fields:
Business Name
Email Address
Phone Number
Submission Message (suggested):
Thank you for your interest. Our team will contact you shortly with the next steps.
2.6 Footer

3. Browse Businesses Page
Current design approved
Filter Category according sectors, parameters wise
No changes required in this phase

4. Business Detail Page
4.1 Header Section
Displays:
Business Logo
Business Name
Location
Business Sector
Main Business Tagline

4.2 Key Investment Parameters (Highlighted Section)
These parameters must be highly visible, readable, and interactive.
Each parameter should be displayed as a clickable card or pill that expands (pop-up / modal) on click.
Suggested Parameter Names:
Minimum Investment Units 
Maximum Investment Units
Price per Unit
Expected Return Options
(IPO Exit, Dividend)
Estimated Market Valuation
Team Size
Time Horizon for IPO
Valuation Disclaimer (mandatory):
Estimated valuation is based on information provided by the business. The platform does not influence investment decisions.
Team Size Options:
1–5 Employees
6–10 Employees
11–25 Employees
26–50 Employees
51–100 Employees
100+ Employees

4.3 Business Overview Section
Flexible Text Area (No Forced Structure):
Businesses may include:
About the Business
Vision
Mission
Growth plans
Platform will not enforce content format.

4.4 Materials & Media Section
Upload Types (Selectable via Dropdown):
Pitch Deck (PDF)
Company Website (External Link)
Brochure
Gallery (Images)
Youtube videos links
Other Materials (PDF, PNG, JPG)
Visibility Rule:
Materials are visible to the public only after admin approval

4.5 Contact Information Section
Displays:
Business Email
Business Phone Number
Location

4.6 Sidebar – Quick Info
Displays:
Registration Number
Business Type
Year Established
Number of Employees

4.7 Sidebar – Investment Interest Form
Title: Interested in This Business?
Fields:
Full Name *
Email Address *
Phone Number * (+977 format)
Message (Investment interest details)
Consent:
I agree to the Terms & Conditions and Privacy Policy
CTA Button: Submit Interest
Privacy Note:
Your information is kept private and shared only with the business.

5. Business Onboarding Flow
Step 1: Initial Interest Submission
Business submits basic form:
Business Name
Email
Phone Number
Message:
Your request has been submitted and is under verification. You will be notified once approved.

Step 2: Business Account Creation
Admin shares a secure onboarding link
Business creates:
Username
Password

Step 3: Business Profile Completion
Business fills:
All business details
Investment parameters
Materials & media uploads

Step 4: Admin Review & Approval
Business profile status: Pending Verification
Upon approval:
Business becomes publicly visible
Notification sent to business

6. Business Dashboard
Capabilities:
Edit all business information
Upload / update materials
View received investment interests
Restriction:
Business cannot self-delete profile
Removal requires contacting admin

7. Admin Dashboard
Admin Features:
View total businesses
View pending approvals
Approve / reject business listings
Delete business from platform
Basic platform metrics

8. System Messages (Suggested)
Submission Success:
Your submission has been received and is under review.
Approval Notification:
Your business has been approved and is now live on the platform.

9. Compliance & Neutrality Statement
Platform does not provide investment advice
All displayed data is provided by businesses
Investment decisions are solely the responsibility of users





Color Palette
Primary Color:
Forest Green: #3D8B5F (used in logo, headings, and CTA buttons)
Secondary Colors (Suggested):
Light Mint Green: #E8F5E9
Warm Cream/Beige: #F5F1E8 (neutral background for main content)
Dark Navy/Charcoal: #2C3E50 (body text)
White: #FFFFFF (navigation background, cards)
Accent Colors:
Darker Green: #2E6B47 (for hover states on buttons)
Medium Gray: #666666 (secondary text)
Light Gray: #F8F8F8 (section backgrounds)
Typography
Headings:
Font Family: Sans-serif (appears to be a modern font like Circular, Avenir, or similar)
Heading Style: Bold, clean, medium weight
Body Text:
Font Family: Sans-serif (matching or complementary to headings)
Color: Dark gray/charcoal
Line spacing: Comfortable, readable spacing for long-form content
Button Style
Primary CTA Button:
Background: Forest green (#3D8B5F)
Text: White
Shape: Rounded corners (medium border-radius)
Style: Solid fill
Hover: Likely darker green
