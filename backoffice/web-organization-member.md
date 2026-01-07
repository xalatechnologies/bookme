# Organization Member Role - Web Application

## Role Overview
**Organization Member** is an authenticated user who belongs to an organization and may have limited access to view or manage organization-related content on the web application.

## Core Responsibilities
- View organization listings
- Access member-only content
- Participate in organization activities
- View organization bookings (if permitted)

---

## Functionalities

### 1. Organization Listings (DOM-001)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View organization's listings
- Access member-only listings
- See internal listing details
- Browse organization catalog

#### API Endpoints
- `GET /listings?organizationId=:id` - Organization listings
- `GET /listings/:id` - View listing (member access)

#### Database Access
- `domain.listings` - Read (organization scope)
- `domain.listing_media` - Read (organization scope)

---

### 2. Member Bookings (DOM-005)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Create bookings for organization resources
- View own bookings
- Access member pricing (if applicable)
- Book internal resources

#### API Endpoints
- `POST /bookings` - Create booking (member)
- `GET /users/me/bookings` - View own bookings

#### Database Access
- `domain.bookings` - Create/Read (own bookings)
- `domain.booking_items` - Create/Read (own bookings)

---

### 3. Organization Events (TND-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View organization events
- Register for member events
- Access event details
- See event schedules

#### API Endpoints
- `GET /listings?listingType=EVENT&organizationId=:id` - Organization events
- `POST /bookings` - Register for event

#### Database Access
- `domain.listing_event_details` - Read (organization scope)

---

### 4. Membership Info (PLAT-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View membership details
- See membership status
- Access member benefits
- View organization info

#### API Endpoints
- `GET /organizations/:id/membership` - View membership
- `GET /organizations/:id` - Organization details

#### Database Access
- `platform.memberships` - Read (own membership)
- `platform.organizations` - Read (member access)

---

### 5. Availability Access (DOM-003)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Check member-only availability
- View extended availability
- Access priority booking slots
- See member calendars

#### API Endpoints
- `GET /listings/:id/availability` - Check availability (member)

#### Database Access
- `domain.availability_rules` - Read (member access)
- `domain.allocations` - Read (member view)

---

### 6. Member Pricing (DOM-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View member pricing
- Access member discounts
- Get member quotes
- See special rates

#### API Endpoints
- `GET /bookings/pricing` - Calculate pricing (member rates)

#### Database Access
- `domain.pricing_rules` - Read (member pricing)
- `domain.discount_codes` - Access (member codes)

---

### 7. Internal Resources
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Access internal resources
- View member-only content
- Download organization materials
- Access shared documents

---

## Access Restrictions
- **Authentication:** Required
- **Organization Scope:** Single organization membership
- **Data Access:** Read organization data, CRUD own bookings
- **Security Level:** Medium - member authentication

## Related Roles
- **End User:** Base user role (parent role)
- **Organization Admin:** Organization management (elevated role)
- **Guest User:** Public access (downgrade when logged out)
