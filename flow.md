┌─────────────────────────────────────────────────────────────────┐
│                    CAPITAL BRIDGE NEPAL PLATFORM                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   ┌─────────┐         ┌─────────┐          ┌─────────┐
   │ PUBLIC  │         │BUSINESS │          │  ADMIN  │
   │  SIDE   │         │  SIDE   │          │  PANEL  │
   └─────────┘         └─────────┘          └─────────┘
        ↓                     ↓                     ↓
   ┌─────────┐         ┌─────────┐          ┌─────────┐
   │Homepage │         │Register │          │Dashboard│
   │Browse   │         │Login    │          │Approve  │
   │Business │         │Dashboard│          │Manage   │
   │Detail   │         │Edit     │          │Monitor  │
   │Interest │         │Inquiries│          │Reports  │
   └─────────┘         └─────────┘          └─────────┘
        ↓                     ↓                     ↓
        └─────────────────────┴─────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │   BACKEND API    │
                    │   Node.js        │
                    └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   Database       │
                    └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  File Storage    │
                    │  (Images/PDFs)   │
                    └──────────────────┘


                    START: User lands on homepage
        ↓
┌───────────────────┐
│  VIEW HOMEPAGE    │
│  - Hero section   │
│  - All businesses │
│  - Sectors        │
└───────────────────┘
        ↓
        ├─────→ [Browse Businesses Page]
        │              ↓
        │       ┌──────────────┐
        │       │ Apply filters│
        │       │ Search/Sort  │
        │       └──────────────┘
        │              ↓
        └──────→ [Click on Business Card]
                       ↓
              ┌────────────────────┐
              │ BUSINESS DETAIL    │
              │ - View parameters  │
              │ - Read about       │
              │ - Check materials  │
              └────────────────────┘
                       ↓
                ┌──────┴──────┐
                ↓             ↓
         [Not Interested]  [Interested]
                              ↓
                     ┌─────────────────┐
                     │ FILL INTEREST   │
                     │ FORM            │
                     │ - Name          │
                     │ - Email         │
                     │ - Phone         │
                     │ - Message       │
                     └─────────────────┘
                              ↓
                     ┌─────────────────┐
                     │ SUBMIT INTEREST │
                     └─────────────────┘
                              ↓
                     ┌─────────────────┐
                     │ SUCCESS MESSAGE │
                     │ Reference ID    │
                     └─────────────────┘
                              ↓
                     [Wait for Business to Contact]
                              ↓
                           END



                           START: Business wants to list
        ↓
┌───────────────────────┐
│ HOMEPAGE              │
│ Click "List Business" │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ MODAL FORM OPENS      │
│ - Business name       │
│ - Email               │
│ - Phone               │
│ - Message (optional)  │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ SUBMIT INQUIRY        │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ SUCCESS MESSAGE       │
│ "Team will contact"   │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ ADMIN REVIEWS         │
│ (Backend Process)     │
└───────────────────────┘
        ↓
   ┌────┴────┐
   ↓         ↓
[Rejected] [Approved]
   ↓         ↓
  END   [Admin sends email with registration link]
             ↓
┌──────────────────────────┐
│ CLICK REGISTRATION LINK  │
│ (Unique URL with token)  │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│ FULL REGISTRATION FORM   │
│ Step 1: Create account   │
│ Step 2: Basic info       │
│ Step 3: Investment       │
│ Step 4: About content    │
│ Step 5: Upload files     │
│ Step 6: Contact info     │
│ Step 7: Documents        │
│ Step 8: Review & submit  │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│ SUBMIT REGISTRATION      │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│ SUCCESS PAGE             │
│ - Registration ID        │
│ - Status: Pending        │
│ - Login credentials      │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│ ADMIN APPROVAL PROCESS   │
│ (Wait 2-3 days)          │
└──────────────────────────┘
        ↓
   ┌────┴────┐
   ↓         ↓
[Rejected] [Approved]
   ↓         ↓
[Email]   [Email: "You're live!"]
   ↓         ↓
  END        ↓
      ┌──────────────────┐
      │ LOGIN TO         │
      │ BUSINESS         │
      │ DASHBOARD        │
      └──────────────────┘
             ↓
      ┌──────────────────┐
      │ DASHBOARD MENU   │
      │ - View profile   │
      │ - Edit profile   │
      │ - View inquiries │
      │ - Manage media   │
      │ - Analytics      │
      │ - Settings       │
      └──────────────────┘
             ↓
          [Active Business on Platform]
             ↓
            END


            START: Admin logs in
        ↓
┌──────────────────────┐
│ ADMIN LOGIN PAGE     │
│ - Username           │
│ - Password           │
└──────────────────────┘
        ↓
┌──────────────────────┐
│ ADMIN DASHBOARD      │
│ - Total businesses   │
│ - Pending approvals  │
│ - New inquiries      │
│ - Interest stats     │
└──────────────────────┘
        ↓
        ├─────→ [Manage New Inquiries]
        │              ↓
        │       ┌──────────────────┐
        │       │ View inquiry     │
        │       │ Contact business │
        │       │ Send reg link    │
        │       └──────────────────┘
        │
        ├─────→ [Pending Approvals]
        │              ↓
        │       ┌──────────────────┐
        │       │ Review business  │
        │       │ Check documents  │
        │       │ Verify info      │
        │       └──────────────────┘
        │              ↓
        │         ┌────┴────┐
        │         ↓         ↓
        │    [Approve]  [Reject]
        │         ↓         ↓
        │    [Email]   [Email with reason]
        │         ↓         ↓
        │    [Business goes live]  [Business can edit]
        │
        ├─────→ [Manage Active Businesses]
        │              ↓
        │       ┌──────────────────┐
        │       │ View/Edit        │
        │       │ Deactivate       │
        │       │ Delete           │
        │       └──────────────────┘
        │
        ├─────→ [Removal Requests]
        │              ↓
        │       ┌──────────────────┐
        │       │ Review request   │
        │       │ Approve/Deny     │
        │       └──────────────────┘
        │
        └─────→ [View All Inquiries]
                       ↓
                ┌──────────────────┐
                │ Monitor activity │
                │ Export data      │
                └──────────────────┘
                       ↓
                    [Logout]
                       ↓
                      END



                      ┌─────────────────┐
│ User clicks     │
│ "List Business" │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Modal form      │
│ (3 fields)      │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Submit inquiry  │
│ Save to DB      │
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
[Email to   [Email to
 Admin]      Business]
    ↓         ↓
┌─────────────────┐
│ Admin reviews   │
│ in dashboard    │
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
[Not Qualified]  [Qualified]
    ↓              ↓
   END    ┌───────────────┐
          │ Admin sends   │
          │ unique link   │
          └───────┬───────┘
                  ↓
          ┌───────────────┐
          │ Business      │
          │ clicks link   │
          └───────┬───────┘
                  ↓
          ┌───────────────┐
          │ Validate      │
          │ token         │
          └───────┬───────┘
                  ↓
            ┌─────┴─────┐
            ↓           ↓
      [Token       [Token valid]
       expired]          ↓
            ↓     ┌─────────────┐
          [Show   │ Show full   │
           error] │ reg form    │
            ↓     └──────┬──────┘
           END           ↓
                  ┌─────────────┐
                  │ Business    │
                  │ fills form  │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ Submit      │
                  │ Status:     │
                  │ Pending     │
                  └──────┬──────┘
                         ↓
                  ┌─────────────┐
                  │ Admin       │
                  │ reviews     │
                  └──────┬──────┘
                         ↓
                    ┌────┴────┐
                    ↓         ↓
              [Approve]    [Reject]
                    ↓         ↓
              [Status:    [Status:
               Active]     Rejected]
                    ↓         ↓
              [Business   [Email with
               goes live]  reason]
                    ↓         ↓
                   END       END


                   ┌─────────────────┐
│ User on         │
│ business detail │
│ page            │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Sees interest   │
│ form (sidebar)  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Fills form:     │
│ - Name          │
│ - Email         │
│ - Phone         │
│ - Message       │
│ - T&C checkbox  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Validate form   │
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
[Errors]   [Valid]
    ↓         ↓
[Show       ┌─────────────┐
 errors]    │ Submit to   │
    ↓       │ backend     │
  [Retry]   └──────┬──────┘
             ↓
       ┌─────────────┐
       │ Save to DB  │
       │ Generate ID │
       └──────┬──────┘
              ↓
         ┌────┴────┐
         ↓         ↓
    [Email to   [Email to
     Business]   Investor]
         ↓         ↓
    ┌─────────────────┐
    │ Show success    │
    │ message to user │
    │ Reference ID    │
    └────────┬────────┘
             ↓
            END
             
[Business sees inquiry in dashboard]
             ↓
    ┌─────────────────┐
    │ Business        │
    │ contacts        │
    │ investor        │
    └────────┬────────┘
             ↓
            END


            ┌─────────────────┐
│ Business logs   │
│ into dashboard  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Navigate to     │
│ "My Profile"    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ View current    │
│ profile data    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Click "Edit"    │
│ button          │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Edit form       │
│ appears with    │
│ pre-filled data │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Modify fields   │
│ (any section)   │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Click "Save"    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Validate data   │
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
[Errors]   [Valid]
    ↓         ↓
[Show       ┌─────────────┐
 errors]    │ Update DB   │
    ↓       └──────┬──────┘
  [Retry]          ↓
            ┌─────────────┐
            │ Success     │
            │ message     │
            └──────┬──────┘
                   ↓
            ┌─────────────┐
            │ Changes     │
            │ live on     │
            │ public page │
            └──────┬──────┘
                   ↓
                  END



                  ┌─────────────────┐
│ New business    │
│ registration    │
│ submitted       │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Appears in      │
│ "Pending        │
│ Approvals"      │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Admin clicks    │
│ "Review"        │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Admin sees:     │
│ - All details   │
│ - Documents     │
│ - Uploads       │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Admin reviews   │
│ checklist       │
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
[Approve]  [Reject]
    ↓         ↓
┌─────────┐ ┌─────────┐
│ Status  │ │ Status  │
│ =Active │ │=Rejected│
└────┬────┘ └────┬────┘
     ↓           ↓
┌─────────┐ ┌─────────┐
│ Business│ │ Enter   │
│ goes    │ │ rejection│
│ live    │ │ reason  │
└────┬────┘ └────┬────┘
     ↓           ↓
┌─────────┐ ┌─────────┐
│ Send    │ │ Send    │
│ approval│ │rejection│
│ email   │ │ email   │
└────┬────┘ └────┬────┘
     ↓           ↓
┌─────────┐ ┌─────────┐
│ Business│ │ Business│
│ can     │ │ can edit│
│ login   │ │& resubmit│
└────┬────┘ └────┬────┘
     ↓           ↓
    END         END


    PUBLIC WEBSITE
├── Homepage (/)
│   ├── Hero Section
│   ├── All Businesses (scrollable)
│   ├── Explore Sectors
│   ├── CTA Section
│   └── "List Business" Modal
│
├── Browse Businesses (/businesses)
│   ├── Filter Sidebar
│   ├── Search Bar
│   ├── Business Grid (2 columns)
│   └── Pagination
│
├── Business Detail (/businesses/:id)
│   ├── Header
│   ├── Investment Parameters (expandable)
│   ├── About Section
│   ├── Materials & Media (tabs)
│   ├── Contact Info
│   ├── Quick Info (sidebar)
│   └── Interest Form (sidebar)
│
├── Categories (/categories)
│   └── Category Grid
│
├── How It Works (/how-it-works)
├── About Us (/about)
├── Contact (/contact)
├── Terms & Conditions (/terms)
└── Privacy Policy (/privacy)

BUSINESS DASHBOARD
├── Login (/business/login)
└── Dashboard (/business/dashboard)
    ├── Overview
    ├── My Profile
    │   └── Edit Profile
    ├── Investment Inquiries
    ├── Materials & Media
    │   └── Upload/Manage
    ├── Analytics (basic)
    └── Settings
        ├── Change Password
        ├── Notifications
        └── Request Removal

ADMIN PANEL
├── Login (/admin/login)
└── Dashboard (/admin/dashboard)
    ├── Overview Stats
    ├── Business Inquiries (new leads)
    │   └── Send Registration Link
    ├── Pending Approvals
    │   └── Review & Approve/Reject
    ├── Active Businesses
    │   └── Manage/Edit/Deactivate
    ├── Removal Requests
    ├── All Interest Submissions
    ├── Sector Management
    └── Admin Users


    ┌──────────────┐
│  businesses  │ ◄─┐
├──────────────┤   │
│ id (PK)      │   │
│ username     │   │
│ email        │   │
│ ...details   │   │
│ status       │   │
└──────────────┘   │
       │           │
       │ 1:N       │
       ↓           │
┌──────────────┐   │
│business_media│   │
├──────────────┤   │
│ id (PK)      │   │
│ business_id ─┼───┘
│ file_url     │
│ media_type   │
└──────────────┘

┌──────────────┐
│  businesses  │ ◄─┐
└──────────────┘   │
       │ 1:N       │
       ↓           │
┌──────────────┐   │
│  interest_   │   │
│ submissions  │   │
├──────────────┤   │
│ id (PK)      │   │
│ business_id ─┼───┘
│ investor_name│
│ email        │
│ phone        │
└──────────────┘

┌──────────────┐
│  categories  │
├──────────────┤
│ id (PK)      │
│ name         │
│ slug         │
└──────────────┘
       ↑
       │ N:1
       │
┌──────────────┐
│  businesses  │
│ category_id  │
└──────────────┘

┌──────────────┐
│   business_  │
│  inquiries   │
├──────────────┤
│ id (PK)      │
│ business_name│
│ email        │
│ status       │
│ token        │
└──────────────┘

┌──────────────┐
│   removal_   │
│  requests    │
├──────────────┤
│ id (PK)      │
│ business_id  │
│ reason       │
│ status       │
└──────────────┘

┌──────────────┐
│    admins    │
├──────────────┤
│ id (PK)      │
│ username     │
│ password_hash│
│ role         │
└──────────────┘

