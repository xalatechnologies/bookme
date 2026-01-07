# Booking Manager Role - Backoffice

## Role Overview
**Booking Manager** handles booking operations, including creation, status management, and customer communication. This role ensures smooth booking workflows and customer satisfaction.

## Core Responsibilities
- Manage booking lifecycle
- Process booking requests
- Handle booking modifications
- Resolve booking conflicts

---

## Functionalities

### 1. Booking Management (DOM-005, DOM-006)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View all organization bookings
- Create manual bookings
- Update booking status
- Process booking workflow
- Handle cancellations

#### API Endpoints
- `GET /bookings` - List bookings
- `GET /bookings/:id` - View booking details
- `POST /bookings` - Create booking
- `PUT /bookings/:id/status` - Update status

#### Database Access
- `domain.bookings` - CRUD (organization scope)
- `domain.booking_items` - CRUD (organization scope)
- `domain.booking_status_history` - Read access

---

### 2. Booking Editing (TND-003)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Modify booking details
- Update customer information
- Change booking dates/times
- Adjust booking items
- Add notes and comments

#### API Endpoints
- `PUT /bookings/:id` - Edit booking
- `PUT /bookings/:id/items` - Update booking items

#### Database Access
- `domain.bookings` - Update (organization scope)
- `domain.booking_items` - Update (organization scope)

---

### 3. Status Workflow (DOM-006)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Transition booking through workflow states
- Approve/reject booking requests
- Confirm bookings
- Process completions
- Handle cancellations

#### Workflow States
- `PENDING` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED`
- `PENDING` → `REJECTED`
- `ANY_STATE` → `CANCELLED`

#### API Endpoints
- `PUT /bookings/:id/status` - Update status
- `GET /bookings/:id/history` - View status history

#### Database Access
- `domain.bookings` - Update status
- `domain.booking_status_history` - Read/Create

---

### 4. Allocation Management (DOM-007)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View resource allocations
- Check for conflicts
- Resolve double-bookings
- Monitor capacity

#### API Endpoints
- `GET /listings/:id/availability` - Check availability
- `GET /allocations` - View allocations

#### Database Access
- `domain.allocations` - Read (organization scope)

---

### 5. Pricing Calculation (DOM-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Calculate booking prices
- Apply pricing rules
- Handle discounts
- Generate price quotes

#### API Endpoints
- `GET /bookings/pricing` - Calculate pricing
- `POST /bookings/quote` - Generate quote

#### Database Access
- `domain.pricing_rules` - Read access
- `domain.discount_codes` - Read/Apply

---

### 6. Recurring Bookings (DOM-010)
**Priority:** P2 | **Status:** Implemented

#### Capabilities
- Create recurring booking series
- Manage recurring patterns
- Handle exceptions
- Cancel recurring series

#### Database Access
- `domain.recurring_bookings` - CRUD (organization scope)
- `domain.bookings` - Create (from recurring)

---

### 7. Discount Application (DOM-011)
**Priority:** P2 | **Status:** Implemented

#### Capabilities
- Apply discount codes to bookings
- Validate discount eligibility
- Track discount usage
- Override pricing

#### Database Access
- `domain.discount_codes` - Read/Validate
- `domain.bookings` - Update with discount

---

### 8. Booking Reports (TND-005)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Generate booking reports
- Track booking metrics
- Monitor revenue
- Export booking data

#### API Endpoints
- `GET /reports/bookings` - Booking reports
- `GET /reports/revenue` - Revenue reports

#### Database Access
- `domain.booking_items` - Read (organization scope)

---

### 9. Customer Communication
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Send booking confirmations
- Notify status changes
- Handle customer inquiries
- Send reminders

#### Integration Points
- Email service integration
- SMS notification integration
- In-app notifications

---

### 10. Audit Trail (TND-008)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View booking change history
- Track status transitions
- Monitor user actions
- Generate audit reports

#### Database Access
- `domain.booking_status_history` - Read access
- `platform.audit_events` - Read (booking-related)

---

## Access Restrictions
- **Tenant Scope:** Single tenant
- **Organization Scope:** Single organization
- **Data Access:** CRUD on organization bookings
- **Security Level:** Medium - standard authentication

## Related Roles
- **Organization Admin:** Organization management (parent role)
- **Listing Manager:** Listing management (peer role)
- **Customer Support:** Support-focused role (peer role)
