# Guest User Role - Web Application

## Role Overview
**Guest User** is an unauthenticated visitor who can browse public listings and view information without creating an account. Authentication is required only for booking.

## Core Responsibilities
- Browse public listings
- View listing details
- Check availability
- Access shared content

---

## Functionalities

### 1. Public Listing Browse (DOM-001)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Browse public listings
- View listing catalog
- Search listings
- View listing details (public info)

#### API Endpoints
- `GET /listings` - Browse listings (public)
- `GET /listings/:id` - View listing details (public)
- `GET /listings/:slug` - View by slug (public)

#### Database Access
- `domain.listings` - Read (public listings only)

---

### 2. Category Browsing (DOM-009)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Browse categories
- Filter by category
- View category hierarchies

#### API Endpoints
- `GET /categories` - List categories (public)

#### Database Access
- `domain.listing_categories` - Read (public)

---

### 3. Media Viewing (DOM-008)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- View listing images
- Browse media galleries
- View public media

#### API Endpoints
- `GET /listings/:id/media` - View media (public)

#### Database Access
- `domain.listing_media` - Read (public)

---

### 4. Availability Check (DOM-003)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Check listing availability
- View calendar
- See available time slots

#### API Endpoints
- `GET /listings/:id/availability` - Check availability (public)

#### Database Access
- `domain.availability_rules` - Read (public)
- `domain.allocations` - Read (availability check)

---

### 5. Pricing Information (DOM-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View listing prices
- Get price estimates
- See pricing tiers

#### API Endpoints
- `GET /bookings/pricing` - Get pricing (public)

#### Database Access
- `domain.pricing_rules` - Read (public)

---

### 6. Shareable Links (TND-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Access shared listings
- View embedded content
- Browse via share links

#### API Endpoints
- `GET /share/:token` - Access shared content

#### Database Access
- `domain.shareable_links` - Read access
- `domain.listings` - Read (via share link)

---

### 7. Event Discovery (TND-002)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Browse public events
- View event details
- Check event schedules

#### API Endpoints
- `GET /listings?listingType=EVENT` - Browse events (public)

#### Database Access
- `domain.listing_event_details` - Read (public)

---

### 8. Widget Access (TND-007)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- View embedded widgets
- Access widget listings
- Interact with embedded content

#### API Endpoints
- `GET /widgets/listings` - Widget listings
- `GET /widgets/embed.js` - Embed script

---

## Access Restrictions
- **Authentication:** Not required
- **Data Access:** Read-only public data
- **Booking:** Must authenticate to create bookings
- **Security Level:** Public access

## Transition to End User
To create bookings or manage reservations, Guest Users must:
1. Create an account or login (PLAT-005)
2. Become an authenticated End User
3. Gain access to booking creation and management

## Related Roles
- **End User:** Authenticated user with booking capabilities (upgrade path)
