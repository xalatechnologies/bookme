# User Roles & Permissions Documentation

## Overview
This directory contains comprehensive documentation for all user roles across the Digilist platform, organized by application (Backoffice and Web). Each role document details specific functionalities, API endpoints, database access, and security restrictions based on the requirements defined in `requirements/requirements.json`.

---

## Role Hierarchy & Relationships

### Backoffice Application Roles

```
┌─────────────────────────────────────────────────────────────────┐
│                         SUPER ADMIN                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • Platform-wide access (all tenants)                       │ │
│  │ • Multi-tenant management (PLAT-001)                       │ │
│  │ • Licensing & subscriptions (PLAT-006)                     │ │
│  │ • Global feature flags (PLAT-007, TND-009)                 │ │
│  │ • System-wide RBAC (PLAT-004)                              │ │
│  │ • Security & compliance (SEC-001, SEC-002, SEC-003)        │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TENANT ADMIN                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • Single tenant scope                                      │ │
│  │ • Organization management (PLAT-002)                       │ │
│  │ • User management (PLAT-003)                               │ │
│  │ • All listings & bookings (DOM-001 to DOM-011)             │ │
│  │ • Tenant-wide reporting (TND-005)                          │ │
│  │ • Audit access (PLAT-008, TND-008)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORGANIZATION ADMIN                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • Single organization scope                                │ │
│  │ • Member management (PLAT-002, PLAT-003)                   │ │
│  │ • Organization listings (DOM-001, DOM-002)                 │ │
│  │ • Availability & pricing (DOM-003, DOM-004)                │ │
│  │ • Organization bookings (DOM-005, DOM-006)                 │ │
│  │ • Event management (TND-002)                               │ │
│  │ • Shareable links (TND-004)                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────┬───────────────────────┘
                  │                       │
                  ▼                       ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │  LISTING MANAGER    │   │  BOOKING MANAGER    │
    │  ┌───────────────┐  │   │  ┌───────────────┐  │
    │  │ • Listings    │  │   │  │ • Bookings    │  │
    │  │ • Availability│  │   │  │ • Status      │  │
    │  │ • Pricing     │  │   │  │ • Allocations │  │
    │  │ • Media       │  │   │  │ • Pricing     │  │
    │  │ • Categories  │  │   │  │ • Reports     │  │
    │  │ • Events      │  │   │  │ • Discounts   │  │
    │  └───────────────┘  │   │  └───────────────┘  │
    └─────────────────────┘   └─────────────────────┘
```

### Web Application Roles

```
┌─────────────────────────────────────────────────────────────────┐
│                         GUEST USER                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • Unauthenticated access                                   │ │
│  │ • Browse public listings (DOM-001)                         │ │
│  │ • View categories (DOM-009)                                │ │
│  │ • Check availability (DOM-003)                             │ │
│  │ • View pricing (DOM-004)                                   │ │
│  │ • Access shared links (TND-004)                            │ │
│  │ • Browse events (TND-002)                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │ (Authentication)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          END USER                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • Authenticated user                                       │ │
│  │ • All Guest User capabilities +                            │ │
│  │ • Create bookings (DOM-005)                                │ │
│  │ • Manage own bookings (DOM-006)                            │ │
│  │ • Apply discounts (DOM-011)                                │ │
│  │ • User profile (PLAT-003)                                  │ │
│  │ • Booking history                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │ (Organization Membership)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION MEMBER                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • All End User capabilities +                              │ │
│  │ • Organization listings access                             │ │
│  │ • Member-only content                                      │ │
│  │ • Member pricing (DOM-004)                                 │ │
│  │ • Organization events (TND-002)                            │ │
│  │ • Internal resources                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Role Documentation Files

### Backoffice Application

| Role | File | Scope | Priority |
|------|------|-------|----------|
| **Super Admin** | [`backoffice-super-admin.md`](./backoffice-super-admin.md) | All Tenants | Highest |
| **Tenant Admin** | [`backoffice-tenant-admin.md`](./backoffice-tenant-admin.md) | Single Tenant | High |
| **Organization Admin** | [`backoffice-organization-admin.md`](./backoffice-organization-admin.md) | Single Organization | Medium |
| **Listing Manager** | [`backoffice-listing-manager.md`](./backoffice-listing-manager.md) | Assigned Listings | Medium |
| **Booking Manager** | [`backoffice-booking-manager.md`](./backoffice-booking-manager.md) | Organization Bookings | Medium |

### Web Application

| Role | File | Scope | Priority |
|------|------|-------|----------|
| **Guest User** | [`web-guest-user.md`](./web-guest-user.md) | Public Access | Low |
| **End User** | [`web-end-user.md`](./web-end-user.md) | Own Data | Medium |
| **Organization Member** | [`web-organization-member.md`](./web-organization-member.md) | Organization Data | Medium |

---

## Requirements Coverage Map

### Domain Layer (DOMAIN)

| Requirement | Description | Roles with Access |
|-------------|-------------|-------------------|
| **DOM-001** | Listing Catalog | All roles (scoped) |
| **DOM-002** | Listing Types & Booking Models | Tenant Admin, Org Admin, Listing Manager |
| **DOM-003** | Availability Rules | Tenant Admin, Org Admin, Listing Manager, End User (read) |
| **DOM-004** | Pricing Rules | Tenant Admin, Org Admin, Listing Manager, End User (read) |
| **DOM-005** | Booking Creation | Tenant Admin, Org Admin, Booking Manager, End User |
| **DOM-006** | Booking Status Workflow | Tenant Admin, Org Admin, Booking Manager |
| **DOM-007** | Allocations & Overlap Prevention | Tenant Admin, Org Admin, Booking Manager |
| **DOM-008** | Listing Media | Tenant Admin, Org Admin, Listing Manager |
| **DOM-009** | Categories & Filters | All roles (read), Tenant Admin (write) |
| **DOM-010** | Recurring Bookings | Tenant Admin, Org Admin, Booking Manager |
| **DOM-011** | Discount Codes | Tenant Admin, Org Admin, Listing Manager, End User (apply) |

### Platform Layer (PLATFORM)

| Requirement | Description | Roles with Access |
|-------------|-------------|-------------------|
| **PLAT-001** | Multi-Tenant Architecture | Super Admin only |
| **PLAT-002** | Organizations | Super Admin, Tenant Admin, Org Admin |
| **PLAT-003** | User Management | Super Admin, Tenant Admin, Org Admin, End User (self) |
| **PLAT-004** | RBAC (Roles & Permissions) | Super Admin, Tenant Admin |
| **PLAT-005** | Authentication (OAuth) | All authenticated users |
| **PLAT-006** | Licensing & Subscriptions | Super Admin only |
| **PLAT-007** | Feature Flags | Super Admin, Tenant Admin (view) |
| **PLAT-008** | Audit Logging | Super Admin, Tenant Admin, Org Admin (scoped) |

### Tender Requirements (TENDER)

| Requirement | Description | Roles with Access |
|-------------|-------------|-------------------|
| **TND-001** | Calendar/Resource Planning | Tenant Admin, Org Admin, Listing Manager |
| **TND-002** | Event Administration | Tenant Admin, Org Admin, Listing Manager, End User (view) |
| **TND-003** | Editable Booking Page | Tenant Admin, Org Admin, Booking Manager |
| **TND-004** | Booking via Link/Embed | All roles (access shared links) |
| **TND-005** | Reporting | Super Admin, Tenant Admin, Org Admin, Listing Manager |
| **TND-006** | Ticketing Integration | Tenant Admin, Org Admin |
| **TND-007** | Website Widget Integration | Guest User, End User (public access) |
| **TND-008** | Auditability | Super Admin, Tenant Admin, Org Admin |
| **TND-009** | Licensing/Feature Flags | Super Admin only |

### Security & Compliance (CROSS)

| Requirement | Description | Roles with Access |
|-------------|-------------|-------------------|
| **SEC-001** | Session Security | All authenticated users |
| **SEC-002** | CSRF Protection | All users (automatic) |
| **SEC-003** | Tenant Isolation | Super Admin (enforcement) |
| **SEC-004** | Dependency Security | Super Admin (monitoring) |
| **SEC-005** | GDPR Compliance | Super Admin, Tenant Admin |

---

## Permission Matrix

### Backoffice Application

| Functionality | Super Admin | Tenant Admin | Org Admin | Listing Mgr | Booking Mgr |
|--------------|-------------|--------------|-----------|-------------|-------------|
| **Tenant Management** | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None |
| **Organization Management** | ✅ All | ✅ Tenant | ✅ Own | ❌ None | ❌ None |
| **User Management** | ✅ All | ✅ Tenant | ✅ Org | ❌ None | ❌ None |
| **Listing CRUD** | ✅ All | ✅ Tenant | ✅ Org | ✅ Assigned | 📖 Read |
| **Booking CRUD** | ✅ All | ✅ Tenant | ✅ Org | 📖 Read | ✅ Org |
| **Availability Rules** | ✅ All | ✅ Tenant | ✅ Org | ✅ Assigned | 📖 Read |
| **Pricing Rules** | ✅ All | ✅ Tenant | ✅ Org | ✅ Assigned | 📖 Read |
| **Media Management** | ✅ All | ✅ Tenant | ✅ Org | ✅ Assigned | ❌ None |
| **Reporting** | ✅ All | ✅ Tenant | ✅ Org | ✅ Listings | ✅ Bookings |
| **Audit Logs** | ✅ All | ✅ Tenant | ✅ Org | ❌ None | ❌ None |
| **Feature Flags** | ✅ Full | 📖 View | ❌ None | ❌ None | ❌ None |
| **Licensing** | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None |

**Legend:** ✅ Full Access | 📖 Read Only | ❌ No Access

### Web Application

| Functionality | Guest | End User | Org Member |
|--------------|-------|----------|------------|
| **Browse Listings** | ✅ Public | ✅ All | ✅ All + Internal |
| **View Availability** | ✅ Public | ✅ All | ✅ All + Member |
| **View Pricing** | ✅ Public | ✅ All | ✅ Member Rates |
| **Create Bookings** | ❌ None | ✅ Own | ✅ Own + Member |
| **Manage Bookings** | ❌ None | ✅ Own | ✅ Own |
| **Apply Discounts** | ❌ None | ✅ Public | ✅ Member Codes |
| **View Events** | ✅ Public | ✅ All | ✅ All + Member |
| **User Profile** | ❌ None | ✅ Own | ✅ Own |
| **Organization Access** | ❌ None | ❌ None | ✅ Member |

---

## Data Access Patterns

### Tenant Isolation
```
Super Admin
    └─ Tenant A
        ├─ Organization 1
        │   ├─ Listings
        │   └─ Bookings
        └─ Organization 2
            ├─ Listings
            └─ Bookings
    └─ Tenant B
        └─ Organization 3
            ├─ Listings
            └─ Bookings
```

### Role Scoping Rules

1. **Super Admin**: Cross-tenant access to all data
2. **Tenant Admin**: All data within single tenant
3. **Organization Admin**: All data within single organization
4. **Listing Manager**: Assigned listings and related data
5. **Booking Manager**: Organization bookings and related data
6. **End User**: Own bookings and public data
7. **Guest User**: Public data only

---

## API Endpoint Access

### Authentication Requirements

| Endpoint Pattern | Guest | End User | Org Member | Backoffice |
|-----------------|-------|----------|------------|------------|
| `GET /listings` | ✅ | ✅ | ✅ | ✅ |
| `POST /listings` | ❌ | ❌ | ❌ | ✅ (scoped) |
| `GET /bookings` | ❌ | ✅ (own) | ✅ (own) | ✅ (scoped) |
| `POST /bookings` | ❌ | ✅ | ✅ | ✅ |
| `GET /admin/*` | ❌ | ❌ | ❌ | ✅ (scoped) |
| `GET /reports` | ❌ | ❌ | ❌ | ✅ (scoped) |

---

## Security Considerations

### Authentication Levels

1. **Public Access**: No authentication required (Guest User)
2. **Standard Auth**: OAuth login required (End User, Org Member)
3. **MFA Required**: Multi-factor authentication (Tenant Admin, Super Admin)
4. **Audit Logged**: All actions logged (Backoffice roles)

### Data Filtering

- **Row-Level Security (RLS)**: Enforced at database level
- **Tenant Isolation**: Automatic filtering by tenant_id
- **Organization Scoping**: Filtered by organization membership
- **User Ownership**: Filtered by user_id for personal data

---

## Implementation References

### Database Schema
- **Platform Schema**: `platform.*` - Multi-tenant, organizations, users, RBAC
- **Domain Schema**: `domain.*` - Listings, bookings, allocations
- **Public Schema**: `public.*` - Sessions, licenses, feature flags

### API Documentation
- OpenAPI specification: `reports/contracts/openapi.snapshot.json`
- API endpoints documented in each role file

### Testing
- Integration tests: `tests/integration/`
- E2E tests: `e2e/tests/`
- Contract tests: `tests/contract/`

---

## Related Documentation

- **Requirements**: [`/requirements/requirements.json`](../../requirements/requirements.json)
- **Architecture**: [`/docs/02-architecture/`](../02-architecture/)
- **API Contracts**: [`/docs/02-architecture/BOOKING_FLOW_API_CONTRACTS.md`](../02-architecture/BOOKING_FLOW_API_CONTRACTS.md)
- **RBAC Implementation**: [`/docs/02-architecture/RBAC_IMPLEMENTATION.md`](../02-architecture/RBAC_IMPLEMENTATION.md)
- **Tender Mapping**: [`/docs/requirements/TENDER_MAPPING.md`](../requirements/TENDER_MAPPING.md)

---

## Maintenance

This documentation is generated based on `requirements/requirements.json` and should be updated when:
- New requirements are added
- Role permissions change
- New roles are introduced
- API endpoints are modified
- Security policies are updated

**Last Updated**: 2026-01-07  
**Version**: 1.0.0  
**Status**: ✅ Complete - All 33 requirements documented
