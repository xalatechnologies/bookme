# Organization Admin Role - Backoffice

## Role Overview
**Organization Admin** manages a specific organization within a tenant, including its listings, bookings, members, and resources.

## Core Responsibilities
- Manage organization listings and resources
- Handle organization bookings
- Manage organization members
- Configure organization-specific settings

---

## Functionalities

### 1. Organization Settings (PLAT-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Update organization profile
- Configure organization preferences
- Manage organization branding
- View organization analytics

#### API Endpoints
- `GET /organizations/:id` - View organization
- `PUT /organizations/:id` - Update organization

#### Database Access
- `platform.organizations` - Update (own organization)
- `platform.memberships` - Read (own organization)

---

### 2. Member Management (PLAT-002, PLAT-003)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Invite members to organization
- Assign member roles
- Remove members
- Monitor member activity

#### API Endpoints
- `GET /organizations/:id/members` - List members
- `POST /organizations/:id/members` - Add member
- `DELETE /organizations/:id/members/:userId` - Remove member

#### Database Access
- `platform.memberships` - CRUD (own organization)
- `platform.users` - Read access

---

### 3. Listing Management (DOM-001, DOM-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Create and manage organization listings
- Configure listing types (SPACE, EVENT, SERVICE)
- Set booking models
- Publish/unpublish listings

#### API Endpoints
- `GET /listings?organizationId=:id` - List org listings
- `POST /listings` - Create listing
- `PUT /listings/:id` - Update listing
- `DELETE /listings/:id` - Remove listing

#### Database Access
- `domain.listings` - CRUD (own organization)
- `domain.listing_categories` - Read access

---

### 4. Availability Management (DOM-003, TND-001)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Configure availability rules
- Set blackout periods
- Manage resource calendars
- View allocation conflicts

#### API Endpoints
- `GET /listings/:id/availability` - View availability
- `PUT /listings/:id/availability` - Update rules
- `POST /listings/:id/blackouts` - Add blackout

#### Database Access
- `domain.availability_rules` - CRUD (own listings)
- `domain.blackouts` - CRUD (own listings)
- `domain.allocations` - Read (own listings)

---

### 5. Pricing Configuration (DOM-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Set pricing rules for listings
- Configure dynamic pricing
- Create seasonal pricing
- Manage pricing tiers

#### API Endpoints
- `GET /listings/:id/pricing` - View pricing
- `PUT /listings/:id/pricing` - Update pricing rules

#### Database Access
- `domain.pricing_rules` - CRUD (own listings)

---

### 6. Booking Management (DOM-005, DOM-006, TND-003)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View organization bookings
- Update booking status
- Edit booking details
- Handle booking requests

#### API Endpoints
- `GET /bookings?organizationId=:id` - List bookings
- `GET /bookings/:id` - View booking
- `PUT /bookings/:id` - Edit booking
- `PUT /bookings/:id/status` - Update status

#### Database Access
- `domain.bookings` - CRUD (own organization)
- `domain.booking_items` - CRUD (own organization)
- `domain.booking_status_history` - Read (own bookings)

---

### 7. Event Management (TND-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Create and manage events
- Configure event details
- Set event capacity
- Manage event registrations

#### API Endpoints
- `GET /listings?listingType=EVENT&organizationId=:id` - List events
- `POST /listings` - Create event
- `PUT /listings/:id/event-details` - Update event

#### Database Access
- `domain.listing_event_details` - CRUD (own events)

---

### 8. Media Management (DOM-008)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Upload listing media
- Organize images and videos
- Set featured images
- Delete media

#### API Endpoints
- `POST /listings/:id/media` - Upload media
- `DELETE /listings/:id/media/:mediaId` - Remove media
- `PUT /listings/:id/media/:mediaId` - Update media order

#### Database Access
- `domain.listing_media` - CRUD (own listings)

---

### 9. Shareable Links (TND-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Create shareable booking links
- Generate embed codes
- Configure link permissions
- Track link usage

#### API Endpoints
- `POST /listings/:id/share` - Create share link
- `GET /share/:token` - Access shared listing

#### Database Access
- `domain.shareable_links` - CRUD (own listings)

---

### 10. Reporting (TND-005)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- View organization reports
- Track booking statistics
- Monitor revenue
- Export booking data

#### API Endpoints
- `GET /reports?organizationId=:id` - Organization reports
- `GET /reports/bookings?organizationId=:id` - Booking reports

#### Database Access
- `domain.booking_items` - Read (own organization)

---

### 11. Discount Codes (DOM-011)
**Priority:** P2 | **Status:** Implemented

#### Capabilities
- Create discount codes
- Configure discount rules
- Monitor code usage
- Deactivate codes

#### Database Access
- `domain.discount_codes` - CRUD (own organization)

---

### 12. Recurring Bookings (DOM-010)
**Priority:** P2 | **Status:** Implemented

#### Capabilities
- Set up recurring bookings
- Manage recurring patterns
- Handle recurring exceptions
- Cancel recurring series

#### Database Access
- `domain.recurring_bookings` - CRUD (own organization)

---

## Access Restrictions
- **Tenant Scope:** Single tenant
- **Organization Scope:** Single organization only
- **Data Access:** Full CRUD within organization boundary
- **Security Level:** Medium - standard authentication

## Related Roles
- **Tenant Admin:** Tenant-wide management (parent role)
- **Listing Manager:** Listing-specific management (child role)
- **Booking Manager:** Booking-specific management (peer role)
