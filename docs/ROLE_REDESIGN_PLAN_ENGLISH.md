# Role System Redesign - English Code Implementation

**Date**: October 27, 2025
**Status**: 📋 **READY FOR IMPLEMENTATION**
**Priority**: HIGH
**Language Policy**: English code, Norwegian UI via i18n

---

## Language Requirements ✅

**CRITICAL**: All code must use English:
- ✅ Enum values in English
- ✅ Variable names in English
- ✅ Comments in English
- ✅ Database column names in English
- ✅ TypeScript interfaces in English

**Norwegian via i18n**:
- ✅ UI labels translated
- ✅ Role display names translated
- ✅ Error messages translated
- ✅ User-facing text translated

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

**Problem**: Generic roles don't match business domain (case management).

---

## ✅ Required Roles (Business-Specific - ENGLISH)

### Platform Level (SaaS)
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

### Organization Level (Tenant-specific)

**New org_role enum (ENGLISH)**:
```typescript
owner          // Organization owner (highest authority)
admin          // Full organization administrator
case_handler   // Main operational role (Norwegian: Saksbehandler)
editor         // Content management (Norwegian: Redaktør)
read_only      // View-only access (Norwegian: Lesetilgang)
customer       // ✅ KEEP - End users making bookings
```

---

## Detailed Role Specifications

### 1. Platform Admin (platform_admin)
**Level**: Platform (SaaS)
**Norwegian UI**: "Plattform Administrator"
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

### 2. Owner (owner)
**Level**: Organization
**Norwegian UI**: "Eier"
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

### 3. Admin (admin)
**Level**: Organization
**Norwegian UI**: "Administrator"
**Scope**: Single organization

**Permissions**:
- ✅ Manage facilities
- ✅ Manage all bookings
- ✅ Manage availability rules
- ✅ View all organization data
- ✅ Manage users (except owner)
- ✅ Configure organization settings
- ✅ Generate reports
- ✅ All permissions of case_handler + below

**Access**:
- Organization admin panel
- All management features

**Restrictions**:
- ❌ Cannot delete organization
- ❌ Cannot change owner role
- ❌ Cannot access billing

---

### 4. Case Handler (case_handler)
**Level**: Organization
**Norwegian UI**: "Saksbehandler"
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

### 5. Editor (editor)
**Level**: Organization
**Norwegian UI**: "Redaktør"
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

### 6. Read Only (read_only)
**Level**: Organization
**Norwegian UI**: "Lesetilgang"
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

### 7. Customer (customer)
**Level**: Organization
**Norwegian UI**: "Kunde"
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
  owner (100)
    └─ admin (80)
       └─ case_handler (60)
          ├─ editor (40)
          └─ read_only (20)
             └─ customer (10)
```

**Hierarchy Rules**:
- Higher number = more permissions
- Parent roles inherit all child permissions
- `platform_admin` bypasses org hierarchy entirely

---

## Permission Matrix

### Facilities

| Action | Customer | Read Only | Editor | Case Handler | Admin | Owner | Platform Admin |
|--------|----------|-----------|--------|--------------|-------|-------|----------------|
| View published | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View draft | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit content | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Create/Delete | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Change pricing | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### Bookings

| Action | Customer | Read Only | Editor | Case Handler | Admin | Owner | Platform Admin |
|--------|----------|-----------|--------|--------------|-------|-------|----------------|
| View own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all | ❌ | ✅ | ✅ (ro) | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Approve/Reject | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cancel any | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Refund | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### Users

| Action | Customer | Read Only | Editor | Case Handler | Admin | Owner | Platform Admin |
|--------|----------|-----------|--------|--------------|-------|-------|----------------|
| View list | ❌ | ✅ (limited) | ✅ (limited) | ✅ (limited) | ✅ | ✅ | ✅ |
| Edit own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit others | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage roles | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

### Organization Settings

| Action | Customer | Read Only | Editor | Case Handler | Admin | Owner | Platform Admin |
|--------|----------|-----------|--------|--------------|-------|-------|----------------|
| View | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Billing | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete org | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### Reports

| Action | Customer | Read Only | Editor | Case Handler | Admin | Owner | Platform Admin |
|--------|----------|-----------|--------|--------------|-------|-------|----------------|
| View basic | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View advanced | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Export data | ❌ | ✅ (limited) | ✅ (limited) | ✅ | ✅ | ✅ | ✅ |

---

## Implementation Strategy

### Phase 1: Database Migration (Critical)

#### 1.1 Create New Migration File
```sql
-- File: supabase/migrations/20251027000001_update_org_roles_english.sql

-- Update org_role enum to include new roles (ENGLISH)
ALTER TYPE org_role ADD VALUE IF NOT EXISTS 'case_handler';
ALTER TYPE org_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE org_role ADD VALUE IF NOT EXISTS 'read_only';

-- Note: PostgreSQL doesn't allow removing enum values
-- We'll keep 'staff' for backwards compatibility during migration
-- It can be mapped to 'case_handler' in the application layer

COMMENT ON TYPE org_role IS 'Organization roles: owner, admin, case_handler, editor, read_only, staff (deprecated), customer';
```

#### 1.2 Data Migration
```sql
-- Migrate existing 'staff' users to 'case_handler'
UPDATE memberships
SET role = 'case_handler'
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
  | 'case_handler'
  | 'editor'
  | 'read_only'
  | 'staff'        // deprecated
  | 'customer';
```

#### 2.2 Create Role Constants (ENGLISH CODE)
```typescript
// src/constants/roles.ts

export const ORG_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  CASE_HANDLER: 'case_handler',
  EDITOR: 'editor',
  READ_ONLY: 'read_only',
  CUSTOMER: 'customer',
  STAFF: 'staff', // deprecated
} as const;

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 100,
  admin: 80,
  case_handler: 60,
  editor: 40,
  read_only: 20,
  customer: 10,
  staff: 60, // Map to case_handler level during transition
};

// Norwegian labels via i18n keys
export const ROLE_I18N_KEYS: Record<OrgRole, string> = {
  owner: 'roles.owner',
  admin: 'roles.admin',
  case_handler: 'roles.case_handler',
  editor: 'roles.editor',
  read_only: 'roles.read_only',
  customer: 'roles.customer',
  staff: 'roles.staff_deprecated',
};

export const ROLE_DESCRIPTION_I18N_KEYS: Record<OrgRole, string> = {
  owner: 'roles.descriptions.owner',
  admin: 'roles.descriptions.admin',
  case_handler: 'roles.descriptions.case_handler',
  editor: 'roles.descriptions.editor',
  read_only: 'roles.descriptions.read_only',
  customer: 'roles.descriptions.customer',
  staff: 'roles.descriptions.staff_deprecated',
};
```

---

### Phase 3: Update RBAC Service

#### 3.1 Update Permission Checking (ENGLISH)
```typescript
// src/services/supabase/rbac.service.ts

private checkCaseHandlerPermissions(
  resource: string,
  action: string
): boolean {
  const caseHandlerPermissions: Record<string, string[]> = {
    bookings: ['create', 'read', 'update', 'delete'], // Full booking control
    facilities: ['read'], // Read-only facilities
    users: ['read'], // View users (limited)
    availability_rules: ['read', 'update'], // Can modify availability
    reviews: ['read'], // View reviews
  };

  return caseHandlerPermissions[resource]?.includes(action) || false;
}

private checkEditorPermissions(
  resource: string,
  action: string
): boolean {
  const editorPermissions: Record<string, string[]> = {
    facilities: ['read', 'update'], // Edit facility content
    bookings: ['read'], // Read-only bookings
    media: ['create', 'read', 'update', 'delete'], // Full media control
    tags: ['create', 'read', 'update'], // Manage tags
  };

  return editorPermissions[resource]?.includes(action) || false;
}

private checkReadOnlyPermissions(
  resource: string,
  action: string
): boolean {
  const readOnlyPermissions: Record<string, string[]> = {
    bookings: ['read'],
    facilities: ['read'],
    users: ['read'], // Limited
    reports: ['read'],
  };

  return readOnlyPermissions[resource]?.includes(action) || false;
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

    case 'case_handler':
    case 'staff': // Handle deprecated 'staff' as 'case_handler'
      return this.checkCaseHandlerPermissions(resource, action);

    case 'editor':
      return this.checkEditorPermissions(resource, action);

    case 'read_only':
      return this.checkReadOnlyPermissions(resource, action);

    case 'customer':
      return this.checkCustomerPermissions(resource, action);

    default:
      return false;
  }
}
```

---

### Phase 4: Update UI Components

#### 4.1 Update RequireRole Guard (ENGLISH)
```typescript
// src/components/admin/guards/RequireRole.tsx

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 100,
  admin: 80,
  case_handler: 60,
  editor: 40,
  read_only: 20,
  customer: 10,
  staff: 60, // Map to case_handler level
};

// Add new helper components
export const CaseHandlerOnly = ({ children, orgId }) => (
  <RequireRole minRole="case_handler" orgId={orgId}>
    {children}
  </RequireRole>
);

export const EditorOnly = ({ children, orgId }) => (
  <RequireRole minRole="editor" orgId={orgId}>
    {children}
  </RequireRole>
);

export const ReadOnlyGuard = ({ children, orgId }) => (
  <RequireRole minRole="read_only" orgId={orgId}>
    {children}
  </RequireRole>
);
```

#### 4.2 Role Selector Component (with i18n)
```typescript
// src/components/admin/RoleSelector.tsx

import { useTranslation } from 'react-i18next';
import { ROLE_I18N_KEYS, ROLE_DESCRIPTION_I18N_KEYS, ORG_ROLES } from '@/constants/roles';

export const RoleSelector = ({
  value,
  onChange,
  currentUserRole
}: RoleSelectorProps) => {
  const { t } = useTranslation();

  // Only show roles equal or lower than current user's role
  const availableRoles = getAvailableRoles(currentUserRole);

  return (
    <Select value={value} onChange={onChange}>
      {availableRoles.map(role => (
        <SelectItem key={role} value={role}>
          <div>
            <p className="font-medium">{t(ROLE_I18N_KEYS[role])}</p>
            <p className="text-xs text-gray-500">
              {t(ROLE_DESCRIPTION_I18N_KEYS[role])}
            </p>
          </div>
        </SelectItem>
      ))}
    </Select>
  );
};
```

---

### Phase 5: i18n Translation Files

#### 5.1 Norwegian Translations
```json
// locales/no/roles.json
{
  "roles": {
    "owner": "Eier",
    "admin": "Administrator",
    "case_handler": "Saksbehandler",
    "editor": "Redaktør",
    "read_only": "Lesetilgang",
    "customer": "Kunde",
    "staff_deprecated": "Ansatt (utgått)"
  },
  "descriptions": {
    "owner": "Full kontroll over organisasjonen",
    "admin": "Administrator med full tilgang",
    "case_handler": "Behandler bookinger og henvendelser",
    "editor": "Redigerer innhold og fasiliteter",
    "read_only": "Kun lesetilgang til data",
    "customer": "Kunde som kan booke fasiliteter",
    "staff_deprecated": "Utgått rolle (bruk saksbehandler)"
  }
}
```

#### 5.2 English Translations
```json
// locales/en/roles.json
{
  "roles": {
    "owner": "Owner",
    "admin": "Administrator",
    "case_handler": "Case Handler",
    "editor": "Editor",
    "read_only": "Read Only",
    "customer": "Customer",
    "staff_deprecated": "Staff (deprecated)"
  },
  "descriptions": {
    "owner": "Full control over the organization",
    "admin": "Administrator with full access",
    "case_handler": "Handles bookings and inquiries",
    "editor": "Edits content and facilities",
    "read_only": "Read-only access to data",
    "customer": "Customer who can book facilities",
    "staff_deprecated": "Deprecated role (use case handler)"
  }
}
```

---

## User Experience Considerations

### Role Selection During User Creation
```
1. Admin creates new user
2. Enters email
3. Selects role (Norwegian UI):
   [ ] Saksbehandler - Behandler bookinger og henvendelser
   [ ] Redaktør - Redigerer innhold og fasiliteter
   [ ] Lesetilgang - Kun lesetilgang til data
   [ ] Administrator - Full tilgang til organisasjonen
4. Sends invitation
```

### Role Badge Display (with i18n)
```typescript
import { useTranslation } from 'react-i18next';
import { ROLE_I18N_KEYS } from '@/constants/roles';

<Badge variant={getRoleBadgeVariant(role)}>
  {t(ROLE_I18N_KEYS[role])}
</Badge>

// Colors:
// owner -> purple
// admin -> blue
// case_handler -> green
// editor -> yellow
// read_only -> gray
// customer -> default
```

---

## Migration Timeline

### Phase 1: Database & Types (2-3 hours)
- [ ] Create migration file with English role names
- [ ] Update org_role enum
- [ ] Migrate existing 'staff' to 'case_handler'
- [ ] Generate TypeScript types
- [ ] Create role constants file

### Phase 2: i18n Setup (2-3 hours)
- [ ] Install react-i18next dependencies
- [ ] Create translation file structure
- [ ] Add Norwegian role translations
- [ ] Add English role translations
- [ ] Configure i18n provider

### Phase 3: Backend Logic (3-4 hours)
- [ ] Update rbac.service.ts permissions
- [ ] Add role-specific permission functions
- [ ] Update role hierarchy
- [ ] Test permission matrix

### Phase 4: Frontend Components (4-5 hours)
- [ ] Update RequireRole guard
- [ ] Create new role helper components
- [ ] Build RoleSelector component with i18n
- [ ] Update admin navigation
- [ ] Add feature flags hook

### Phase 5: UI Polish & Testing (3-4 hours)
- [ ] Update all admin pages
- [ ] Add role badges with translations
- [ ] Test all permission scenarios
- [ ] Update documentation
- [ ] User acceptance testing

**Total Estimated Time**: 14-19 hours (2-3 days)

---

## Testing Checklist

### Per Role Testing

#### Test as Case Handler
- [ ] Can view all bookings
- [ ] Can create/edit bookings
- [ ] Can approve/reject bookings
- [ ] Can manage availability
- [ ] Cannot edit facilities
- [ ] Cannot manage users
- [ ] Cannot access org settings
- [ ] UI shows "Saksbehandler" in Norwegian

#### Test as Editor
- [ ] Can edit facility content
- [ ] Can upload images
- [ ] Can manage tags
- [ ] Can view bookings (read-only)
- [ ] Cannot approve bookings
- [ ] Cannot manage users
- [ ] Cannot access org settings
- [ ] UI shows "Redaktør" in Norwegian

#### Test as Read Only
- [ ] Can view all data
- [ ] Cannot edit anything
- [ ] Cannot create bookings
- [ ] Cannot manage any resources
- [ ] Has read-only access everywhere
- [ ] UI shows "Lesetilgang" in Norwegian

---

## Success Criteria

✅ **Complete when**:
1. Database migration applied with English role names
2. All TypeScript types updated to English
3. i18n system implemented with Norwegian UI translations
4. RBAC service handles new roles correctly
5. UI shows Norwegian role labels via i18n
6. All permission tests passing
7. Language switching works correctly
8. Documentation updated
9. User acceptance testing complete

---

## Related Documents

- AUTH_ALIGNMENT_REPORT.md
- AUTH_REFACTORING_COMPLETE.md
- I18N_IMPLEMENTATION_GUIDE.md (to be created)
- MANUAL_TEST_CHECKLIST.md
- RBAC_TEST_RESULTS.md

---

**Created**: October 27, 2025
**Status**: ✅ **READY FOR IMPLEMENTATION**
**Next Action**: Implement database migration with English role names
**Language**: English code, Norwegian UI via i18n
