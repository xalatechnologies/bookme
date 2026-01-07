# Super Admin Role - Backoffice

## Role Overview
**Super Admin** has full system access across all tenants and organizations. This role manages the entire platform infrastructure, tenant provisioning, and system-wide configurations.

## Core Responsibilities
- Multi-tenant platform management
- System-wide security and compliance oversight
- License and subscription management
- Global feature flag control

---

## Functionalities

### 1. Multi-Tenant Management (PLAT-001)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Create, update, and delete tenants
- Configure tenant-specific settings
- Monitor tenant health and usage
- Manage tenant isolation and security boundaries

#### API Endpoints
- `GET /admin/tenants` - List all tenants
- `POST /admin/tenants` - Create new tenant
- `PUT /admin/tenants/:id` - Update tenant configuration
- `DELETE /admin/tenants/:id` - Remove tenant

#### Database Access
- `platform.tenants` - Full CRUD access

---

### 2. Licensing & Subscriptions (PLAT-006)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Manage license tokens for all tenants
- Configure subscription plans
- Monitor license usage and compliance
- Handle license renewals and upgrades

#### Database Access
- `public.license_tokens` - Full CRUD access
- `public.subscriptions` - Full CRUD access

---

### 3. Feature Flags Management (PLAT-007, TND-009)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Create and manage global feature flags
- Enable/disable features per tenant
- Configure feature rollout strategies
- Monitor feature adoption

#### Database Access
- `public.feature_flags` - Full CRUD access
- `public.tenant_features` - Full CRUD access

---

### 4. Audit & Compliance (PLAT-008, TND-008)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- View all audit events across tenants
- Generate compliance reports
- Monitor security events
- Track system-wide changes

#### Database Access
- `platform.audit_events` - Read access (all tenants)

---

### 5. Security Management (SEC-001, SEC-002, SEC-003)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Monitor session security across all tenants
- Configure CSRF protection policies
- Enforce tenant isolation rules
- Review security incidents

#### API Endpoints
- `POST /auth/logout` - Force logout users
- Security configuration endpoints

#### Database Access
- `public.sessions` - Full access (all tenants)
- `platform.tenants` - Security configuration

---

### 6. User & Organization Management (PLAT-002, PLAT-003)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- View all organizations across tenants
- Manage user accounts system-wide
- Override organization settings
- Handle user disputes and issues

#### API Endpoints
- `GET /organizations` - List all organizations
- `POST /organizations` - Create organizations
- `GET /users/:id` - View any user
- `PUT /users/:id` - Update user details

#### Database Access
- `platform.organizations` - Full CRUD access
- `platform.users` - Full CRUD access
- `platform.memberships` - Full CRUD access

---

### 7. RBAC Administration (PLAT-004)
**Priority:** P0 | **Status:** Implemented

#### Capabilities
- Define system-wide roles and permissions
- Assign roles to users across tenants
- Configure permission hierarchies
- Audit role assignments

#### API Endpoints
- `GET /authz/permissions` - View all permissions
- `POST /roles` - Create system roles
- `PUT /users/:id/roles` - Assign roles

#### Database Access
- `platform.roles` - Full CRUD access
- `platform.permissions` - Full CRUD access
- `platform.role_permissions` - Full CRUD access
- `platform.user_roles` - Full CRUD access

---

### 8. Reporting & Analytics (TND-005)
**Priority:** P1 | **Status:** Implemented

#### Capabilities
- Generate system-wide reports
- Monitor platform performance metrics
- Track tenant usage statistics
- Export compliance reports

#### API Endpoints
- `GET /reports` - Access all reports
- `GET /reports/tenants` - Tenant analytics
- `GET /reports/usage` - Usage statistics

---

## Access Restrictions
- **Tenant Scope:** ALL (cross-tenant access)
- **Data Access:** Full read/write across all schemas
- **Security Level:** Highest - requires MFA and audit logging

## Related Roles
- **Tenant Admin:** Manages single tenant (subset of Super Admin capabilities)
- **Organization Admin:** Manages organization within tenant
- **Support Staff:** Read-only access for customer support
