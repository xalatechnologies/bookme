# Role System Redesign - Business Requirements

**Date**: October 27, 2025
**Status**: 📋 **PLANNING**
**Priority**: HIGH

---

## Current State vs Business Requirements

### ❌ Current Roles (Generic)
```typescript
// Platform level
platform_admin  // SaaS admin

// Organization level (in memberships table)
owner           // Organization owner
admin           // Generic admin
staff           // Generic staff
customer        // End user/customer
```

**Problem**: Generic roles don't match your business domain (saksbehandling/case management).

---

### ✅ Required Roles (Business-Specific)

#### Platform Level (SaaS)
```typescript
platform_admin  // ✅ KEEP - Super admin managing all organizations
```

**Responsibilities**:
- Manage all organizations
- View all bookings across orgs
- System configuration
- Billing and subscriptions
- Platform-wide analytics

---

#### Organization Level (Tenant-specific)

Based on your requirements: "admin, saksbehandler, redaktør, lesetilgang"

```typescript
// Proposed new org_role enum:
owner          // Organization owner (highest authority)
admin          // Full organization administrator
saksbehandler  // Case handler (main operational role)
redaktør       // Editor (content management)
lesetilgang    // Read-only access
customer       // ✅ KEEP - End users making bookings
```

---

## Detailed Role Specifications

### 1. Platform Admin (platform_admin)
**Level**: Platform (SaaS)
**Norwegian**: "Plattform Administrator"
**Scope**: All organizations

**Permissions**:
- ✅ Create/edit/delete organizations
- ✅ Manage organization subscriptions
- ✅ View all bookings across all orgs
- ✅ Platform-wide settings
- ✅ User management across orgs
- ✅ System maintenance
- ✅ Audit logs access
- ✅ Billing and invoicing

**Access**:
- All admin panels
- Platform dashboard
- Organization management
- System settings

---

### 2. Owner (eier)
**Level**: Organization
**Norwegian**: "Eier"
**Scope**: Single organization

**Permissions**:
- ✅ Full organization control
- ✅ Manage organization settings
- ✅ Add/remove users
- ✅ Assign roles to users
- ✅ Billing and subscription
- ✅ Delete organization (with confirmation)
- ✅ All permissions of admin + below

**Access**:
- Organization admin panel
- All organization features
- Billing dashboard

**Restrictions**:
- ❌ Cannot access other organizations
- ❌ Cannot modify platform settings

---

### 3. Admin (administrator)
**Level**: Organization
**Norwegian**: "Administrator"
**Scope**: Single organization

**Permissions**:
- ✅ Manage facilities
- ✅ Manage all bookings
- ✅ Manage availability rules
- ✅ View all organization data
- ✅ Manage users (except owner)
- ✅ Configure organization settings
- ✅ Generate reports
- ✅ All permissions of saksbehandler + below

**Access**:
- Organization admin panel
- All management features

**Restrictions**:
- ❌ Cannot delete organization
- ❌ Cannot change owner role
- ❌ Cannot access billing

---

### 4. Saksbehandler (Case Handler)
**Level**: Organization
**Norwegian**: "Saksbehandler"
**Scope**: Single organization

**Main operational role** for handling bookings and cases.

**Permissions**:
- ✅ View all bookings
- ✅ Create bookings for users
- ✅ Approve/reject booking requests
- ✅ Modify booking status
- ✅ Manage availability (with restrictions)
- ✅ Communicate with customers
- ✅ View facility information
- ✅ Generate basic reports

**Access**:
- Booking management dashboard
- Case handling interface
- Customer communication

**Restrictions**:
- ❌ Cannot create/delete facilities
- ❌ Cannot manage users
- ❌ Cannot change pricing rules
- ❌ Limited to operational tasks

---

### 5. Redaktør (Editor)
**Level**: Organization
**Norwegian**: "Redaktør"
**Scope**: Single organization

**Content management role** for facility information and marketing.

**Permissions**:
- ✅ Edit facility descriptions
- ✅ Upload/manage facility images
- ✅ Edit facility amenities
- ✅ Manage tags and categories
- ✅ View bookings (read-only)
- ✅ Update availability information
- ✅ Manage promotional content

**Access**:
- Facility content editor
- Media library
- Basic booking view

**Restrictions**:
- ❌ Cannot change pricing
- ❌ Cannot approve/reject bookings
- ❌ Cannot manage users
- ❌ Cannot delete facilities
- ❌ Content only, no operational control

---

### 6. Lesetilgang (Read-Only Access)
**Level**: Organization
**Norwegian**: "Lesetilgang"
**Scope**: Single organization

**View-only role** for auditors, managers, or observers.

**Permissions**:
- ✅ View all bookings (read-only)
- ✅ View all facilities
- ✅ View users (no personal data)
- ✅ View reports and analytics
- ✅ Export data (limited)

**Access**:
- Dashboard (view-only)
- Reports section

**Restrictions**:
- ❌ Cannot modify anything
- ❌ Cannot create bookings
- ❌ Cannot communicate with users
- ❌ Read-only access to everything

---

### 7. Customer (kunde)
**Level**: Organization
**Norwegian**: "Kunde"
**Scope**: Own bookings only

**End user role** - people making bookings.

**Permissions**:
- ✅ View published facilities
- ✅ Create bookings
- ✅ View own bookings
- ✅ Cancel own bookings (within policy)
- ✅ Leave reviews
- ✅ Update own profile
- ✅ View booking history

**Access**:
- Public facility browser
- User dashboard
- Own bookings page

**Restrictions**:
- ❌ Cannot access admin panel
- ❌ Cannot view other users' bookings
- ❌ Cannot manage facilities

---

## Role Hierarchy & Inheritance

```
Platform Level:
  platform_admin (bypasses all org checks)

Organization Level:
  owner (6)
    └─ admin (5)
       └─ saksbehandler (4)
          ├─ redaktør (3)
          └─ lesetilgang (2)
             └─ customer (1)
```

**Hierarchy Rules**:
- Higher number = more permissions
- Parent roles inherit all child permissions
- `platform_admin` bypasses org hierarchy entirely

---

## Permission Matrix

### Facilities

| Action | Customer | Lesetilgang | Redaktør | Saksbehandler | Admin | Owner | Platform Admin |
|--------|----------|-------------|----------|---------------|-------|-------|----------------|
| View published | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View draft | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit content | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Create/Delete | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Change pricing | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### Bookings

| Action | Customer | Lesetilgang | Redaktør | Saksbehandler | Admin | Owner | Platform Admin |
|--------|----------|-------------|----------|---------------|-------|-------|----------------|
| View own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all | ❌ | ✅ | ✅ (ro) | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Approve/Reject | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cancel any | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Refund | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### Users

| Action | Customer | Lesetilgang | Redaktør | Saksbehandler | Admin | Owner | Platform Admin |
|--------|----------|-------------|----------|---------------|-------|-------|----------------|
| View list | ❌ | ✅ (limited) | ✅ (limited) | ✅ (limited) | ✅ | ✅ | ✅ |
| Edit own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit others | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage roles | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### Organization Settings

| Action | Customer | Lesetilgang | Redaktør | Saksbehandler | Admin | Owner | Platform Admin |
|--------|----------|-------------|----------|---------------|-------|-------|----------------|
| View | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Billing | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete org | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### Reports

| Action | Customer | Lesetilgang | Redaktør | Saksbehandler | Admin | Owner | Platform Admin |
|--------|----------|-------------|----------|---------------|-------|-------|----------------|
| View basic | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View advanced | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Export data | ❌ | ✅ (limited) | ✅ (limited) | ✅ | ✅ | ✅ | ✅ |

---

## Implementation Strategy

### Phase 1: Database Migration (Critical)

#### 1.1 Create New Migration File
```sql
-- File: supabase/migrations/20251027000001_update_org_roles.sql

-- Update org_role enum to include new roles
ALTER TYPE org_role ADD VALUE IF NOT EXISTS 'saksbehandler';
ALTER TYPE org_role ADD VALUE IF NOT EXISTS 'redaktør';
ALTER TYPE org_role ADD VALUE IF NOT EXISTS 'lesetilgang';

-- Note: PostgreSQL doesn't allow removing enum values
-- We'll keep 'staff' for backwards compatibility during migration
-- It can be mapped to 'saksbehandler' in the application layer

COMMENT ON TYPE org_role IS 'Organization roles: owner, admin, saksbehandler, redaktør, lesetilgang, staff (deprecated), customer';
```

#### 1.2 Data Migration
```sql
-- Migrate existing 'staff' users to 'saksbehandler'
UPDATE memberships
SET role = 'saksbehandler'
WHERE role = 'staff';

-- Optionally: keep 'staff' as alias or deprecate it
```

---

### Phase 2: TypeScript Type Updates

#### 2.1 Update Database Types
```typescript
// Run type generation
npx supabase gen types typescript --local > src/types/database.ts

// This will update org_role enum to:
type OrgRole =
  | 'owner'
  | 'admin'
  | 'saksbehandler'
  | 'redaktør'
  | 'lesetilgang'
  | 'staff'        // deprecated
  | 'customer';
```

#### 2.2 Create Role Constants
```typescript
// src/constants/roles.ts

export const ORG_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SAKSBEHANDLER: 'saksbehandler',
  REDAKTOR: 'redaktør',
  LESETILGANG: 'lesetilgang',
  CUSTOMER: 'customer',
  STAFF: 'staff', // deprecated
} as const;

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 6,
  admin: 5,
  saksbehandler: 4,
  redaktør: 3,
  lesetilgang: 2,
  customer: 1,
  staff: 4, // Map to saksbehandler level during transition
};

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Eier',
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  redaktør: 'Redaktør',
  lesetilgang: 'Lesetilgang',
  customer: 'Kunde',
  staff: 'Ansatt (utgått)', // deprecated
};

export const ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  owner: 'Full kontroll over organisasjonen',
  admin: 'Administrator med full tilgang',
  saksbehandler: 'Behandler bookinger og henvendelser',
  redaktør: 'Redigerer innhold og fasiliteter',
  lesetilgang: 'Kun lesetilgang til data',
  customer: 'Kunde som kan booke fasiliteter',
  staff: 'Utgått rolle (bruk saksbehandler)',
};
```

---

### Phase 3: Update RBAC Service

#### 3.1 Update Permission Checking
```typescript
// src/services/supabase/rbac.service.ts

private checkSaksbehandlerPermissions(
  resource: string,
  action: string
): boolean {
  const saksbehandlerPermissions: Record<string, string[]> = {
    bookings: ['create', 'read', 'update', 'delete'], // Full booking control
    facilities: ['read'], // Read-only facilities
    users: ['read'], // View users (limited)
    availability_rules: ['read', 'update'], // Can modify availability
    reviews: ['read'], // View reviews
  };

  return saksbehandlerPermissions[resource]?.includes(action) || false;
}

private checkRedaktorPermissions(
  resource: string,
  action: string
): boolean {
  const redaktorPermissions: Record<string, string[]> = {
    facilities: ['read', 'update'], // Edit facility content
    bookings: ['read'], // Read-only bookings
    media: ['create', 'read', 'update', 'delete'], // Full media control
    tags: ['create', 'read', 'update'], // Manage tags
  };

  return redaktorPermissions[resource]?.includes(action) || false;
}

private checkLesetilgangPermissions(
  resource: string,
  action: string
): boolean {
  const lesetilgangPermissions: Record<string, string[]> = {
    bookings: ['read'],
    facilities: ['read'],
    users: ['read'], // Limited
    reports: ['read'],
  };

  return lesetilgangPermissions[resource]?.includes(action) || false;
}

// Update main hasPermission method
async hasPermission(
  userId: string,
  permission: Permission,
  orgId?: string
): Promise<boolean> {
  // ... existing platform admin check ...

  const { resource, action } = permission;

  switch (role) {
    case 'owner':
    case 'admin':
      return true; // Full permissions

    case 'saksbehandler':
    case 'staff': // Handle deprecated 'staff' as 'saksbehandler'
      return this.checkSaksbehandlerPermissions(resource, action);

    case 'redaktør':
      return this.checkRedaktorPermissions(resource, action);

    case 'lesetilgang':
      return this.checkLesetilgangPermissions(resource, action);

    case 'customer':
      return this.checkCustomerPermissions(resource, action);

    default:
      return false;
  }
}
```

---

### Phase 4: Update UI Components

#### 4.1 Update RequireRole Guard
```typescript
// src/components/admin/guards/RequireRole.tsx

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 6,
  admin: 5,
  saksbehandler: 4,
  redaktør: 3,
  lesetilgang: 2,
  customer: 1,
  staff: 4, // Map to saksbehandler level
};

// Add new helper components
export const SaksbehandlerOnly = ({ children, orgId }) => (
  <RequireRole minRole="saksbehandler" orgId={orgId}>
    {children}
  </RequireRole>
);

export const RedaktorOnly = ({ children, orgId }) => (
  <RequireRole minRole="redaktør" orgId={orgId}>
    {children}
  </RequireRole>
);

export const LesetilgangOnly = ({ children, orgId }) => (
  <RequireRole minRole="lesetilgang" orgId={orgId}>
    {children}
  </RequireRole>
);
```

#### 4.2 Role Selector Component
```typescript
// src/components/admin/RoleSelector.tsx

import { ROLE_LABELS, ROLE_DESCRIPTIONS, ORG_ROLES } from '@/constants/roles';

export const RoleSelector = ({
  value,
  onChange,
  currentUserRole
}: RoleSelectorProps) => {
  // Only show roles equal or lower than current user's role
  const availableRoles = getAvailableRoles(currentUserRole);

  return (
    <Select value={value} onChange={onChange}>
      {availableRoles.map(role => (
        <SelectItem key={role} value={role}>
          <div>
            <p className="font-medium">{ROLE_LABELS[role]}</p>
            <p className="text-xs text-gray-500">
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>
        </SelectItem>
      ))}
    </Select>
  );
};
```

---

### Phase 5: Update Admin UI

#### 5.1 Admin Sidebar Navigation
```typescript
// Different menu items based on role

// Saksbehandler sees:
- Dashboard
- Bookinger (full CRUD)
- Tilgjengelighet
- Fasiliteter (read-only)
- Rapporter (basic)

// Redaktør sees:
- Dashboard
- Fasiliteter (edit content)
- Mediahåndtering
- Tags & Categories
- Bookinger (read-only)

// Lesetilgang sees:
- Dashboard (read-only)
- Bookinger (read-only)
- Rapporter (view only)
- Fasiliteter (read-only)
```

#### 5.2 Feature Flags
```typescript
// src/hooks/useFeatureAccess.ts

export const useFeatureAccess = () => {
  const { role, isPlatformAdmin } = useRole();

  return {
    canManageBookings: ['owner', 'admin', 'saksbehandler', 'staff'].includes(role) || isPlatformAdmin,
    canEditFacilities: ['owner', 'admin', 'redaktør'].includes(role) || isPlatformAdmin,
    canManageUsers: ['owner', 'admin'].includes(role) || isPlatformAdmin,
    canViewReports: role !== 'customer' || isPlatformAdmin,
    canExportData: ['owner', 'admin', 'saksbehandler'].includes(role) || isPlatformAdmin,
    canManageMedia: ['owner', 'admin', 'redaktør'].includes(role) || isPlatformAdmin,
    hasFullAccess: ['owner', 'admin'].includes(role) || isPlatformAdmin,
    hasReadOnlyAccess: role === 'lesetilgang',
  };
};
```

---

## User Experience Considerations

### Role Selection During User Creation
```
1. Admin creates new user
2. Enters email
3. Selects role:
   [ ] Saksbehandler - Behandler bookinger og henvendelser
   [ ] Redaktør - Redigerer innhold og fasiliteter
   [ ] Lesetilgang - Kun lesetilgang til data
   [ ] Administrator - Full tilgang til organisasjonen
4. Sends invitation
```

### Role Badge Display
```typescript
<Badge variant={getRoleBadgeVariant(role)}>
  {ROLE_LABELS[role]}
</Badge>

// Colors:
// owner -> purple
// admin -> blue
// saksbehandler -> green
// redaktør -> yellow
// lesetilgang -> gray
// customer -> default
```

---

## Migration Timeline

### Week 1: Database & Types
- [ ] Create migration file
- [ ] Update org_role enum
- [ ] Migrate existing 'staff' to 'saksbehandler'
- [ ] Generate TypeScript types
- [ ] Create role constants file

### Week 2: Backend Logic
- [ ] Update rbac.service.ts permissions
- [ ] Add role-specific permission functions
- [ ] Update role hierarchy
- [ ] Test permission matrix

### Week 3: Frontend Components
- [ ] Update RequireRole guard
- [ ] Create new role helper components
- [ ] Build RoleSelector component
- [ ] Update admin navigation
- [ ] Add feature flags hook

### Week 4: UI Polish & Testing
- [ ] Update all admin pages
- [ ] Add role badges
- [ ] Test all permission scenarios
- [ ] Update documentation
- [ ] User acceptance testing

---

## Testing Checklist

### Per Role Testing

#### Test as Saksbehandler
- [ ] Can view all bookings
- [ ] Can create/edit bookings
- [ ] Can approve/reject bookings
- [ ] Can manage availability
- [ ] Cannot edit facilities
- [ ] Cannot manage users
- [ ] Cannot access org settings

#### Test as Redaktør
- [ ] Can edit facility content
- [ ] Can upload images
- [ ] Can manage tags
- [ ] Can view bookings (read-only)
- [ ] Cannot approve bookings
- [ ] Cannot manage users
- [ ] Cannot access org settings

#### Test as Lesetilgang
- [ ] Can view all data
- [ ] Cannot edit anything
- [ ] Cannot create bookings
- [ ] Cannot manage any resources
- [ ] Has read-only access everywhere

---

## Success Criteria

✅ **Complete when**:
1. Database migration applied successfully
2. All TypeScript types updated
3. RBAC service handles new roles correctly
4. UI shows role-appropriate features
5. All permission tests passing
6. Documentation updated
7. User acceptance testing complete

---

## Related Documents

- AUTH_ALIGNMENT_REPORT.md
- AUTH_REFACTORING_COMPLETE.md
- MANUAL_TEST_CHECKLIST.md
- RBAC_TEST_RESULTS.md

---

**Created**: October 27, 2025
**Status**: 📋 **PLANNING COMPLETE - READY FOR IMPLEMENTATION**
**Next Action**: Review and approve role design
