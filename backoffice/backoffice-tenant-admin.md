# Tenant Admin Role - Backoffice

## Role Overview
**Tenant Admin** manages a single tenant's operations, including organizations, users, listings, and bookings within their tenant boundary.

## Core Responsibilities
- Manage organizations within tenant
- Configure tenant-specific settings
- Oversee all bookings and listings
- Manage tenant users and permissions

---

## Functionalities

### 1. Organization Management (PLAT-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Create and manage organizations within tenant
- Configure organization settings
- Manage organization memberships
- Monitor organization activity

#### API Endpoints
- `GET /organizations` - List tenant organizations
- `POST /organizations` - Create organization
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Remove organization

#### Database Access
- `platform.organizations` - CRUD (tenant-scoped)
- `platform.memberships` - CRUD (tenant-scoped)

---

### 2. User Management (PLAT-003)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Manage all users within tenant
- Assign roles and permissions
- Handle user access requests
- Monitor user activity

#### API Endpoints
- `GET /users` - List tenant users
- `GET /users/:id` - View user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Deactivate user

#### Database Access
- `platform.users` - CRUD (tenant-scoped)
- `platform.user_roles` - CRUD (tenant-scoped)

---

### 3. Listing Management (DOM-001, DOM-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Manage all listings within tenant
- Configure listing types and booking models
- Approve/reject listing submissions
- Monitor listing performance

#### API Endpoints
- `GET /listings` - List all tenant listings
- `GET /listings/:id` - View listing details
- `PUT /listings/:id` - Update listing
- `DELETE /listings/:id` - Remove listing

#### Database Access
- `domain.listings` - CRUD (tenant-scoped)
- `domain.listing_categories` - CRUD (tenant-scoped)

---

### 4. Booking Management (DOM-005, DOM-006)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View all bookings within tenant
- Manage booking status workflow
- Handle booking disputes
- Generate booking reports

#### API Endpoints
- `GET /bookings` - List all tenant bookings
- `GET /bookings/:id` - View booking details
- `PUT /bookings/:id/status` - Update booking status
- `PUT /bookings/:id` - Edit booking (TND-003)

#### Database Access
- `domain.bookings` - CRUD (tenant-scoped)
- `domain.booking_items` - CRUD (tenant-scoped)
- `domain.booking_status_history` - Read access

---

### 5. Availability & Pricing Rules (DOM-003, DOM-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Configure availability rules for listings
- Set pricing rules and strategies
- Manage blackout periods
- Monitor allocation conflicts

#### API Endpoints
- `GET /listings/:id/availability` - View availability
- `PUT /listings/:id/availability` - Update rules
- `GET /bookings/pricing` - View pricing rules

#### Database Access
- `domain.availability_rules` - CRUD (tenant-scoped)
- `domain.pricing_rules` - CRUD (tenant-scoped)
- `domain.blackouts` - CRUD (tenant-scoped)

---

### 6. Event Administration (TND-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Manage event listings
- Configure event-specific details
- Handle event bookings
- Monitor event capacity

#### API Endpoints
- `GET /listings?listingType=EVENT` - List events
- `PUT /listings/:id/event-details` - Update event info

#### Database Access
- `domain.listing_event_details` - CRUD (tenant-scoped)

---

### 7. Media Management (DOM-008)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Manage listing media assets
- Upload and organize images
- Configure media display order
- Remove inappropriate content

#### API Endpoints
- `GET /listings/:id/media` - View media
- `POST /listings/:id/media` - Upload media
- `DELETE /listings/:id/media/:mediaId` - Remove media

#### Database Access
- `domain.listing_media` - CRUD (tenant-scoped)

---

### 8. Categories & Filters (DOM-009)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Manage listing categories
- Configure category mappings
- Create custom filters
- Organize category hierarchy

#### API Endpoints
- `GET /categories` - List categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category

#### Database Access
- `domain.listing_categories` - CRUD (tenant-scoped)
- `domain.listing_category_mappings` - CRUD (tenant-scoped)

---

### 9. Reporting & Analytics (TND-005)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Generate tenant-wide reports
- Monitor booking trends
- Track revenue and utilization
- Export data for analysis

#### API Endpoints
- `GET /reports` - Access tenant reports
- `GET /reports/bookings` - Booking analytics
- `GET /reports/revenue` - Revenue reports

#### Database Access
- `domain.booking_items` - Read access (tenant-scoped)

---

### 10. Discount Management (DOM-011)
**Priority:** P2 | **Status:** Implemented

#### Capabilities
- Create and manage discount codes
- Configure discount rules
- Monitor discount usage
- Track promotional campaigns

#### Database Access
- `domain.discount_codes` - CRUD (tenant-scoped)

---

### 11. Audit & Compliance (PLAT-008, TND-008)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- View tenant audit logs
- Monitor user actions
- Track booking changes
- Generate compliance reports

#### Database Access
- `platform.audit_events` - Read (tenant-scoped)
- `domain.booking_status_history` - Read (tenant-scoped)

---

## Access Restrictions
- **Tenant Scope:** Single tenant only
- **Data Access:** Full CRUD within tenant boundary
- **Security Level:** High - requires MFA

## Related Roles
- **Super Admin:** Platform-wide management (parent role)
- **Organization Admin:** Organization-specific management (child role)
- **Listing Manager:** Listing-specific management (child role)
