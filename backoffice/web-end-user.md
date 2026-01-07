# End User Role - Web Application

## Role Overview
**End User** is a customer who browses listings, makes bookings, and manages their own reservations through the public web application.

## Core Responsibilities
- Browse and search listings
- Create bookings
- Manage personal bookings
- View booking history

---

## Functionalities

### 1. Listing Discovery (DOM-001, DOM-009)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Browse listing catalog
- Search listings by criteria
- Filter by categories
- View listing details
- See listing media

#### API Endpoints
- `GET /listings` - Browse listings
- `GET /listings/:id` - View listing details
- `GET /listings/:slug` - View by slug
- `GET /categories` - Browse categories

#### Database Access
- `domain.listings` - Read (public listings)
- `domain.listing_categories` - Read access
- `domain.listing_media` - Read access

---

### 2. Availability Check (DOM-003, TND-001)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View listing availability
- Check date/time slots
- See real-time availability
- View calendar

#### API Endpoints
- `GET /listings/:id/availability` - Check availability

#### Database Access
- `domain.availability_rules` - Read access
- `domain.allocations` - Read (availability check)
- `domain.blackouts` - Read access

---

### 3. Booking Creation (DOM-005)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Create new bookings
- Select dates and times
- Add booking details
- Provide customer information
- Submit booking requests

#### API Endpoints
- `POST /bookings` - Create booking
- `GET /bookings/pricing` - Get price quote

#### Database Access
- `domain.bookings` - Create (own bookings)
- `domain.booking_items` - Create (own bookings)

---

### 4. Pricing & Quotes (DOM-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View listing prices
- Get price calculations
- Apply discount codes
- See total cost breakdown

#### API Endpoints
- `GET /bookings/pricing` - Calculate pricing
- `POST /bookings/quote` - Get detailed quote

#### Database Access
- `domain.pricing_rules` - Read access
- `domain.discount_codes` - Validate

---

### 5. My Bookings (DOM-005, DOM-006)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View own bookings
- Check booking status
- View booking details
- Track booking history

#### API Endpoints
- `GET /users/me/bookings` - List my bookings
- `GET /bookings/:id` - View booking (if owner)

#### Database Access
- `domain.bookings` - Read (own bookings)
- `domain.booking_items` - Read (own bookings)
- `domain.booking_status_history` - Read (own bookings)

---

### 6. Booking Modifications
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Request booking changes
- Cancel bookings
- View cancellation policies

#### API Endpoints
- `PUT /bookings/:id/cancel` - Cancel booking
- `POST /bookings/:id/change-request` - Request modification

#### Database Access
- `domain.bookings` - Update status (own bookings)

---

### 7. Shareable Links (TND-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Access listings via share links
- Book through shared links
- View embedded listings

#### API Endpoints
- `GET /share/:token` - Access shared listing

#### Database Access
- `domain.shareable_links` - Read access
- `domain.listings` - Read (via share link)

---

### 8. Event Browsing (TND-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Browse events
- View event details
- Check event capacity
- Register for events

#### API Endpoints
- `GET /listings?listingType=EVENT` - Browse events
- `GET /listings/:id` - View event details

#### Database Access
- `domain.listing_event_details` - Read access

---

### 9. Discount Codes (DOM-011)
**Priority:** P2 | **Status:** Implemented

#### Capabilities
- Apply discount codes
- Validate code eligibility
- See discount amount
- Use promotional offers

#### API Endpoints
- `POST /bookings/validate-discount` - Validate code

#### Database Access
- `domain.discount_codes` - Read/Validate

---

### 10. User Profile (PLAT-003)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View own profile
- Update personal information
- Manage preferences
- View booking history

#### API Endpoints
- `GET /users/me` - View profile
- `PUT /users/me` - Update profile

#### Database Access
- `platform.users` - Read/Update (own profile)

---

### 11. Authentication (PLAT-005)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Login with OAuth
- Logout
- Manage sessions
- Password reset

#### API Endpoints
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/session` - Check session

#### Database Access
- `platform.users` - Read (authentication)
- `public.sessions` - Create/Read/Delete (own session)

---

## Access Restrictions
- **Tenant Scope:** Public access (multi-tenant)
- **Data Access:** Read public data, CRUD own bookings
- **Security Level:** Low - standard authentication for booking

## Related Roles
- **Guest User:** Unauthenticated browsing (subset of End User)
- **Organization Member:** May have additional access (extended role)
