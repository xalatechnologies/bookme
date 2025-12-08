# Entity Model Documentation

**Version**: 1.0.0  
**Last Updated**: 2024-12-08  
**Status**: Production Ready

---

## Overview

This document describes the core entities in the BookMe facility booking system, their relationships, and typical usage patterns. The system follows a multi-tenant architecture where each organization (municipality/organization) has its own isolated data space.

---

## Core Entities

### 1. Organizations

**Purpose**: Represents municipalities, companies, or institutions that manage facilities.

**Key Fields**:
- `id` (UUID) - Primary key
- `name` (TEXT) - Organization name
- `slug` (TEXT) - URL-friendly identifier
- `description` (TEXT) - Organization description
- `contact_email` (TEXT) - Contact email
- `contact_phone` (TEXT) - Contact phone
- `address` (TEXT) - Physical address
- `postal_code` (TEXT) - Postal code
- `city` (TEXT) - City
- `country` (TEXT) - Country
- `logo_url` (TEXT) - Organization logo
- `status` (TEXT) - active/inactive
- `settings` (JSONB) - Organization-specific settings
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Has many: `memberships`, `facilities`, `users` (through memberships)
- Belongs to: None

**Typical Usage**:
- Organization administrators manage facilities and users
- Staff members operate within their organization's scope
- Users belong to one or more organizations

---

### 2. Profiles

**Purpose**: User profile information extending the authentication system.

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `display_name` (TEXT) - User's display name
- `first_name` (TEXT) - First name
- `last_name` (TEXT) - Last name
- `email` (TEXT) - Email address
- `phone` (TEXT) - Phone number
- `default_org` (UUID) - Default organization
- `language` (TEXT) - Preferred language
- `timezone` (TEXT) - User's timezone
- `avatar_url` (TEXT) - Avatar image URL
- `bio` (TEXT) - Short biography
- `preferences` (JSONB) - User preferences
- `last_login_at` (TIMESTAMP) - Last login timestamp
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `auth.users`, `organizations` (default_org)
- Has many: `memberships`, `bookings`, `reviews`, `notifications`

**Typical Usage**:
- Storing user profile information
- Managing user preferences
- Tracking login activity
- Connecting users to organizations

---

### 3. Memberships

**Purpose**: Links users to organizations with role-based access control.

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `org_id` (UUID) - Foreign key to organizations
- `role` (TEXT) - user/staff/admin/owner
- `status` (TEXT) - active/inactive/pending
- `joined_at` (TIMESTAMP) - Join date
- `invited_by` (UUID) - Who invited the user
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `profiles` (user_id), `organizations` (org_id)

**Typical Usage**:
- Managing user roles within organizations
- Controlling access to organization resources
- Tracking user membership history

**Roles**:
- `user`: Regular customer who can book facilities
- `staff`: Organization staff who can manage bookings and facilities
- `admin`: Organization administrator with full management rights
- `owner`: Organization owner with ultimate authority

---

### 4. Facilities

**Purpose**: Represents bookable spaces like conference rooms, auditoriums, sports facilities.

**Key Fields**:
- `id` (UUID) - Primary key
- `org_id` (UUID) - Foreign key to organizations
- `name` (TEXT) - Facility name
- `slug` (TEXT) - URL-friendly identifier
- `description` (TEXT) - Detailed description
- `facility_type` (TEXT) - Type classification (conference_room, auditorium, etc.)
- `status` (TEXT) - published/draft/archived
- `address` (TEXT) - Address
- `postal_code` (TEXT) - Postal code
- `city` (TEXT) - City
- `country` (TEXT) - Country
- `location` (GEOMETRY) - Geographic coordinates
- `capacity` (INTEGER) - Maximum capacity
- `images` (TEXT[]) - Image URLs
- `contact_email` (TEXT) - Contact email
- `contact_phone` (TEXT) - Contact phone
- `amenities` (JSONB) - Available amenities
- `accessibility_features` (TEXT[]) - Accessibility features
- `area_description` (TEXT) - Area description
- `rating` (NUMERIC) - Average rating
- `review_count` (INTEGER) - Number of reviews
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `organizations` (org_id)
- Has many: `zones`, `bookings`, `availability_rules`, `blackouts`, `reviews`, `pricing_rules`

**Typical Usage**:
- Creating and managing bookable facilities
- Setting availability and pricing rules
- Displaying facility information to users

---

### 5. Zones

**Purpose**: Sub-divisions within facilities (e.g., meeting rooms within a conference center).

**Key Fields**:
- `id` (UUID) - Primary key
- `facility_id` (UUID) - Foreign key to facilities
- `name` (TEXT) - Zone name
- `description` (TEXT) - Description
- `capacity` (INTEGER) - Maximum capacity
- `price_per_hour_cents` (INTEGER) - Hourly rate in cents
- `area_sqm` (INTEGER) - Area in square meters
- `amenities` (JSONB) - Zone-specific amenities
- `status` (TEXT) - active/inactive
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `facilities` (facility_id)
- Has many: `bookings`

**Typical Usage**:
- Breaking down large facilities into bookable units
- Setting different pricing for different areas
- Managing capacity at granular level

---

### 6. Bookings

**Purpose**: Records of facility reservations made by users.

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `org_id` (UUID) - Foreign key to organizations
- `facility_id` (UUID) - Foreign key to facilities
- `zone_id` (UUID) - Foreign key to zones (nullable)
- `title` (TEXT) - Booking title
- `description` (TEXT) - Booking description
- `starts_at` (TIMESTAMP) - Start time
- `ends_at` (TIMESTAMP) - End time
- `duration_minutes` (INTEGER) - Duration in minutes
- `status` (TEXT) - pending/paid/completed/cancelled/rejected
- `total_price_cents` (INTEGER) - Total price in cents
- `currency` (TEXT) - Currency code
- `attendees` (INTEGER) - Number of attendees
- `special_requests` (TEXT) - Special requests
- `cancellation_reason` (TEXT) - Reason for cancellation
- `approval_notes` (TEXT) - Notes for approval
- `metadata` (JSONB) - Additional metadata
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `profiles` (user_id), `organizations` (org_id), `facilities` (facility_id), `zones` (zone_id)
- Has many: `payments`, `reviews`

**Typical Usage**:
- Creating and managing facility bookings
- Tracking booking lifecycle (pending → paid → completed)
- Processing payments and cancellations

---

### 7. Recurring Bookings

**Purpose**: Template for recurring booking patterns.

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `org_id` (UUID) - Foreign key to organizations
- `facility_id` (UUID) - Foreign key to facilities
- `zone_id` (UUID) - Foreign key to zones (nullable)
- `title` (TEXT) - Booking title
- `description` (TEXT) - Booking description
- `pattern` (TEXT) - daily/weekly/monthly/custom
- `frequency` (INTEGER) - Repeat frequency
- `days_of_week` (INTEGER[]) - Days of week for weekly pattern
- `start_date` (DATE) - Pattern start date
- `end_date` (DATE) - Pattern end date
- `start_time` (TIME) - Daily start time
- `end_time` (TIME) - Daily end time
- `duration_minutes` (INTEGER) - Duration in minutes
- `status` (TEXT) - active/paused/cancelled
- `total_price_cents` (INTEGER) - Total price in cents
- `currency` (TEXT) - Currency code
- `attendees` (INTEGER) - Number of attendees
- `special_requests` (TEXT) - Special requests
- `metadata` (JSONB) - Additional metadata
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `profiles` (user_id), `organizations` (org_id), `facilities` (facility_id), `zones` (zone_id)
- Has many: Individual `bookings` generated from pattern

**Typical Usage**:
- Creating regularly occurring bookings
- Managing recurring booking patterns
- Generating individual bookings from templates

---

### 8. Amenities

**Purpose**: Master list of facility amenities.

**Key Fields**:
- `id` (UUID) - Primary key
- `name` (TEXT) - Amenity name
- `category` (TEXT) - Amenity category
- `icon` (TEXT) - Icon identifier
- `description` (TEXT) - Description
- `is_active` (BOOLEAN) - Active status
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Has many: `facility_amenities` (junction table)

**Typical Usage**:
- Maintaining standardized amenity list
- Categorizing facility features
- Providing searchable amenities

---

### 9. Facility Rules

**Purpose**: Rules governing facility usage.

**Key Fields**:
- `id` (UUID) - Primary key
- `facility_id` (UUID) - Foreign key to facilities
- `rule_type` (TEXT) - cancellation/booking/usage
- `name` (TEXT) - Rule name
- `description` (TEXT) - Rule description
- `parameters` (JSONB) - Rule parameters
- `priority` (INTEGER) - Rule priority
- `is_active` (BOOLEAN) - Active status
- `effective_from` (DATE) - Effective date
- `effective_to` (DATE) - Expiry date
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `facilities` (facility_id)

**Typical Usage**:
- Setting cancellation policies
- Defining booking restrictions
- Managing usage rules

---

### 10. Notifications

**Purpose**: System notifications for users.

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `type` (TEXT) - notification type
- `title` (TEXT) - Notification title
- `message` (TEXT) - Notification message
- `data` (JSONB) - Additional data
- `is_read` (BOOLEAN) - Read status
- `read_at` (TIMESTAMP) - Read timestamp
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `profiles` (user_id)

**Typical Usage**:
- Sending booking confirmations
- Notifying about upcoming events
- Alerting about system changes

---

### 11. Messages

**Purpose**: Communication between users and support.

**Key Fields**:
- `id` (UUID) - Primary key
- `sender_id` (UUID) - Foreign key to auth.users
- `recipient_id` (UUID) - Foreign key to auth.users
- `subject` (TEXT) - Message subject
- `content` (TEXT) - Message content
- `status` (TEXT) - sent/read/archived/deleted
- `thread_id` (UUID) - Conversation thread
- `parent_id` (UUID) - Parent message (for replies)
- `is_system_message` (BOOLEAN) - System-generated flag
- `attachments` (JSONB) - File attachments
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `profiles` (sender_id, recipient_id)

**Typical Usage**:
- User-to-user messaging
- Support ticket communication
- Booking-related discussions

---

### 12. Reviews

**Purpose**: User reviews and ratings for facilities.

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `facility_id` (UUID) - Foreign key to facilities
- `booking_id` (UUID) - Foreign key to bookings
- `rating` (INTEGER) - Rating (1-5)
- `title` (TEXT) - Review title
- `comment` (TEXT) - Review comment
- `pros` (TEXT[]) - Positive aspects
- `cons` (TEXT[]) - Negative aspects
- `is_verified` (BOOLEAN) - Verified booking flag
- `helpful_count` (INTEGER) - Helpful votes
- `status` (TEXT) - published/draft/flagged
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Relationships**:
- Belongs to: `profiles` (user_id), `facilities` (facility_id), `bookings` (booking_id)

**Typical Usage**:
- Collecting user feedback
- Building facility reputation
- Influencing booking decisions

---

## Relationships Diagram

```
Organizations 1---∞ Memberships ∞---1 Profiles (auth.users)
       |                      |
       |                      |
       ∞                      ∞
       |                      |
Facilities 1---∞ Zones        |
       |                      |
       |                      |
       ∞                      ∞
       |                      |
   Bookings 1---1 Payments    |
       |                      |
       ∞                      ∞
       |                      |
    Reviews                   |
                              |
Organizations 1---∞ Facility Rules
       |
       ∞
   Messages ∞---1 Profiles
       |
       ∞
Notifications 1---1 Profiles
```

---

## Multi-Tenant Architecture

### Tenant Isolation

Each organization operates in its own isolated data space:

1. **Data Segregation**: All tenant-sensitive data includes `org_id`
2. **RLS Enforcement**: Row-level security policies enforce access control
3. **Cross-Tenant Queries**: Explicit joins required for cross-tenant data access

### Access Control

1. **Platform Admins**: Full access to all organizations
2. **Organization Owners/Admins**: Full access to their organization
3. **Staff**: Read/write access to organization resources
4. **Users**: Read public data, manage own bookings/profile

### Typical Scenarios

#### New Booking Flow
1. User selects facility (filtered by published status)
2. System checks availability (filtered by facility)
3. User creates booking (with org_id from user context)
4. Booking is validated against facility rules
5. Payment is processed
6. Confirmation notification is sent

#### Admin Management
1. Admin views organization facilities (filtered by org_id)
2. Admin creates/modifies facilities
3. Admin manages bookings for organization
4. Admin sets pricing and availability rules
5. Admin views reports and analytics

#### Cross-Organization Reporting
1. Platform admin queries across multiple organizations
2. Aggregated data is computed with explicit org_id filtering
3. Reports are generated per organization or system-wide

---

## Security Considerations

### Data Protection
- All sensitive data is encrypted at rest
- Personal information is GDPR compliant
- Access logs are maintained for audit purposes

### RLS Policies
- Row-level security enforces tenant boundaries
- Role-based access control limits user permissions
- Platform admins have oversight capabilities

### Privacy
- User data is only accessible to authorized parties
- Organization data is isolated from other tenants
- Deletion requests are handled per legal requirements

---

## Maintenance

### Schema Evolution
- New columns should be nullable or have defaults
- Backward compatibility is maintained
- Migration scripts are versioned

### Performance
- Indexes are created on frequently queried columns
- Query performance is monitored
- Caching strategies are implemented where appropriate

### Monitoring
- Database performance is tracked
- Query patterns are analyzed
- Anomalies are detected and investigated

---

**Last Updated**: 2024-12-08  
**Maintained By**: BookMe Development Team