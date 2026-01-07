# Listing Manager Role - Backoffice

## Role Overview
**Listing Manager** focuses on creating and managing listings, including availability, pricing, and media. This role is responsible for maintaining accurate and attractive listing information.

## Core Responsibilities
- Create and update listings
- Manage availability and pricing
- Upload and organize media
- Monitor listing performance

---

## Functionalities

### 1. Listing CRUD (DOM-001, DOM-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Create new listings
- Update listing details
- Configure listing types (SPACE, EVENT, SERVICE)
- Set booking models
- Publish/unpublish listings

#### API Endpoints
- `GET /listings` - List accessible listings
- `GET /listings/:id` - View listing details
- `POST /listings` - Create listing
- `PUT /listings/:id` - Update listing

#### Database Access
- `domain.listings` - CRUD (assigned listings)
- `domain.listing_categories` - Read access

---

### 2. Availability Management (DOM-003, TND-001)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Configure availability rules
- Set operating hours
- Create blackout periods
- View booking calendar
- Manage resource allocation

#### API Endpoints
- `GET /listings/:id/availability` - View availability
- `PUT /listings/:id/availability` - Update availability rules
- `POST /listings/:id/blackouts` - Add blackout period

#### Database Access
- `domain.availability_rules` - CRUD (assigned listings)
- `domain.blackouts` - CRUD (assigned listings)
- `domain.allocations` - Read (assigned listings)

---

### 3. Pricing Configuration (DOM-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Set base pricing
- Configure pricing rules
- Create seasonal pricing
- Set up dynamic pricing
- Manage pricing tiers

#### API Endpoints
- `GET /listings/:id/pricing` - View pricing configuration
- `PUT /listings/:id/pricing` - Update pricing rules
- `GET /bookings/pricing` - Calculate pricing

#### Database Access
- `domain.pricing_rules` - CRUD (assigned listings)

---

### 4. Media Management (DOM-008)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Upload images and videos
- Organize media gallery
- Set featured images
- Add media descriptions
- Delete media

#### API Endpoints
- `GET /listings/:id/media` - View media
- `POST /listings/:id/media` - Upload media
- `PUT /listings/:id/media/:mediaId` - Update media
- `DELETE /listings/:id/media/:mediaId` - Remove media

#### Database Access
- `domain.listing_media` - CRUD (assigned listings)

---

### 5. Category Management (DOM-009)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Assign listings to categories
- View available categories
- Manage category mappings
- Configure filters

#### API Endpoints
- `GET /categories` - List categories
- `PUT /listings/:id/categories` - Update category assignments

#### Database Access
- `domain.listing_categories` - Read access
- `domain.listing_category_mappings` - CRUD (assigned listings)

---

### 6. Event Details (TND-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Configure event-specific information
- Set event capacity
- Manage event schedules
- Update event status

#### API Endpoints
- `GET /listings/:id/event-details` - View event details
- `PUT /listings/:id/event-details` - Update event information

#### Database Access
- `domain.listing_event_details` - CRUD (assigned event listings)

---

### 7. Shareable Links (TND-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Generate shareable booking links
- Create embed codes
- Configure link settings
- Monitor link usage

#### API Endpoints
- `POST /listings/:id/share` - Create share link
- `GET /listings/:id/share` - View share links
- `DELETE /listings/:id/share/:token` - Revoke link

#### Database Access
- `domain.shareable_links` - CRUD (assigned listings)

---

### 8. Listing Analytics (TND-005)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- View listing performance metrics
- Track booking rates
- Monitor availability utilization
- Generate listing reports

#### API Endpoints
- `GET /reports/listings/:id` - Listing analytics
- `GET /reports/listings/:id/bookings` - Booking statistics

#### Database Access
- `domain.booking_items` - Read (assigned listings)

---

### 9. Discount Codes (DOM-011)
**Priority:** P2 | **Status:** Implemented

#### Capabilities
- Create listing-specific discount codes
- Configure discount rules
- Set validity periods
- Monitor code usage

#### Database Access
- `domain.discount_codes` - CRUD (assigned listings)

---

## Access Restrictions
- **Tenant Scope:** Single tenant
- **Organization Scope:** Single organization
- **Listing Scope:** Assigned listings only
- **Data Access:** CRUD on assigned listings
- **Security Level:** Medium - standard authentication

## Related Roles
- **Organization Admin:** Organization management (parent role)
- **Booking Manager:** Booking management (peer role)
- **Content Editor:** Media-focused role (peer role)
