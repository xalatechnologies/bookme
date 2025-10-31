# RBAC System Documentation

## Overview

This is a comprehensive, production-ready Role-Based Access Control (RBAC) system with strict TypeScript type safety, Norwegian/English translations, and extensive permission management.

## Architecture

The RBAC system is organized into three main modules:

### 1. Role Constants (`/src/constants/roles.ts`)
- **Purpose**: Define all role constants, hierarchies, and translations
- **Features**:
  - Type-safe role definitions
  - Norwegian and English translations
  - Role hierarchy and inheritance
  - Backwards compatibility support

### 2. RBAC Types (`/src/types/rbac.ts`)
- **Purpose**: Comprehensive type definitions for RBAC
- **Features**:
  - Permission types and interfaces
  - Role validation types
  - Feature flag types
  - Type guards and helpers

### 3. Role Helpers (`/src/utils/roleHelpers.ts`)
- **Purpose**: Utility functions for role checking and permission validation
- **Features**:
  - Permission matrix management
  - Feature flag management
  - Role comparison and validation
  - UI helper functions

## Role Hierarchy

### Platform Roles
- **platform_admin**: Full system access across all organizations
- **user**: Standard platform user

### Organization Roles

#### Leadership (Highest Privilege)
- **owner** (Priority: 100): Full control over the organization
- **admin** (Priority: 90): Administrative access, cannot delete organization

#### Staff Roles
- **redaktør** (Priority: 80): Content and facility editor
- **saksbehandler** (Priority: 70): Case handler for bookings and customers
- **staff** (Priority: 60): Operational access

#### Limited Access
- **lesetilgang** (Priority: 50): Read-only access

#### Customer
- **customer** (Priority: 10): Standard customer access

## Usage Examples

### Basic Role Checking

```typescript
import { hasMinimumRole, hasExactRole } from '@/utils/roleHelpers';
import { ORG_ROLES } from '@/constants/roles';

// Check minimum role
const canManageBookings = hasMinimumRole(userRole, 'staff', isPlatformAdmin);

// Check exact role
const isOwner = hasExactRole(userRole, ORG_ROLES.OWNER);
```

### Permission Checking

```typescript
import { canPerformAction } from '@/utils/roleHelpers';

// Check if user can create facilities
const canCreate = canPerformAction(
  userRole,
  'facilities',
  'create',
  isPlatformAdmin
);

// With scope-based permissions
const canUpdate = canPerformAction(
  userRole,
  'bookings',
  'update',
  isPlatformAdmin,
  { userId: currentUserId, isOwner: true }
);
```

### Feature Flags

```typescript
import { hasFeatureAccess, getEnabledFeatures } from '@/utils/roleHelpers';

// Check specific feature
const hasAnalytics = hasFeatureAccess(userRole, 'analytics_dashboard', isPlatformAdmin);

// Get all enabled features
const features = getEnabledFeatures(userRole, isPlatformAdmin);
```

### Role Comparison

```typescript
import { compareRoles, getHighestRole } from '@/utils/roleHelpers';

// Compare two roles
const comparison = compareRoles('admin', 'staff');
if (comparison.role1IsHigher) {
  console.log('Admin has higher privileges than staff');
}

// Get highest role from array
const highest = getHighestRole(['staff', 'admin', 'customer']);
// Returns: 'admin'
```

### Translations

```typescript
import { getRoleLabel, getRoleDescription } from '@/constants/roles';

// Get role label
const labelEN = getRoleLabel('saksbehandler', 'en'); // "Case Handler"
const labelNO = getRoleLabel('saksbehandler', 'no'); // "Saksbehandler"

// Get role description
const descEN = getRoleDescription('redaktør', 'en');
const descNO = getRoleDescription('redaktør', 'no');
```

### UI Helpers

```typescript
import { getRoleBadgeColor, formatRole } from '@/utils/roleHelpers';

// Get badge color for UI
const badgeColor = getRoleBadgeColor('admin'); // "bg-blue-600"

// Format role for display
const displayName = formatRole('owner', 'no'); // "Eier"
```

## Permission Matrix

### Owner Permissions
- **Full access** to all resources and actions

### Admin Permissions
- **Facilities**: Full CRUD + manage
- **Bookings**: Full CRUD + manage
- **Members**: Create, read, update, delete
- **Billing**: Read, update
- **Analytics**: Read, export
- **Audit Logs**: Read, export

### Redaktør (Editor) Permissions
- **Facilities**: Full CRUD
- **Availability Rules**: Full CRUD
- **Zones**: Full CRUD
- **Reviews**: Read, update, delete
- **Additional Services**: Full CRUD
- **Reports**: Read, create

### Saksbehandler (Case Handler) Permissions
- **Bookings**: Full CRUD
- **Support Tickets**: Full CRUD
- **Profiles**: Read, update
- **Reviews**: Read, update

### Staff Permissions
- **Facilities**: Full CRUD
- **Bookings**: Full CRUD
- **Availability Rules**: Full CRUD
- **Pricing Rules**: Full CRUD
- **Analytics**: Read

### Lesetilgang (Read-Only) Permissions
- **All resources**: Read access only
- **Cannot** access billing or audit logs

### Customer Permissions
- **Facilities**: Read
- **Bookings**: Create, read, update (own bookings)
- **Profile**: Read, update (own profile)
- **Reviews**: Create, read
- **Favorites**: Create, read, delete

## Feature Flags

### Available Features
- `analytics_dashboard`: Analytics and reporting access
- `billing_management`: Billing and payment management
- `member_management`: Organization member management
- `facility_management`: Facility creation and management
- `booking_management`: All booking management
- `advanced_reporting`: Advanced reports and data export
- `audit_logs`: Audit log viewing
- `platform_admin`: Platform administration

### Role-Feature Matrix

| Feature | Owner | Admin | Redaktør | Saksbehandler | Staff | Lesetilgang | Customer |
|---------|-------|-------|----------|---------------|-------|-------------|----------|
| Analytics Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Billing Management | ✓ | ✓ | - | - | - | - | - |
| Member Management | ✓ | ✓ | - | - | - | - | - |
| Facility Management | ✓ | ✓ | ✓ | - | ✓ | - | - |
| Booking Management | ✓ | ✓ | - | ✓ | ✓ | - | - |
| Advanced Reporting | ✓ | ✓ | ✓ | - | - | - | - |
| Audit Logs | ✓ | ✓ | - | - | - | - | - |

## Integration with Existing Code

### Updating Existing Services

The RBAC system is designed to integrate seamlessly with existing code:

```typescript
// Before
import type { Database } from '@/types/database';
type OrgRole = Database['public']['Enums']['org_role'];

// After (same compatibility)
import type { OrgRole, ExtendedOrgRole } from '@/constants/roles';
```

### Migration Path for Extended Roles

Extended roles (`saksbehandler`, `redaktør`, `lesetilgang`) are currently not in the database enum. To use them:

1. **Phase 1** (Current): Use extended roles in TypeScript only
   ```typescript
   import type { ExtendedOrgRole } from '@/constants/roles';
   ```

2. **Phase 2**: Add to database enum
   ```sql
   ALTER TYPE org_role ADD VALUE 'saksbehandler';
   ALTER TYPE org_role ADD VALUE 'redaktør';
   ALTER TYPE org_role ADD VALUE 'lesetilgang';
   ```

3. **Phase 3**: Update code to use database roles
   ```typescript
   import type { OrgRole } from '@/constants/roles';
   // Now includes all extended roles
   ```

## Type Safety

### Strict TypeScript Rules
- No `any` types permitted
- All functions have explicit return types
- Readonly interfaces for all props
- Comprehensive JSDoc documentation

### Type Guards

```typescript
import { isExtendedOrgRole, isPlatformRole, isValidRole } from '@/constants/roles';

// Check if value is valid role
if (isExtendedOrgRole(userInput)) {
  // userInput is now typed as ExtendedOrgRole
  const priority = getRolePriority(userInput);
}

// Validate role with suggestions
import { validateRole } from '@/utils/roleHelpers';

const validation = validateRole('invalid-role');
if (!validation.valid) {
  console.error(validation.error);
  console.log('Suggestions:', validation.suggestions);
}
```

## Best Practices

### 1. Always Use Type Imports
```typescript
// Good
import type { ExtendedOrgRole } from '@/constants/roles';
import { hasMinimumRole } from '@/utils/roleHelpers';

// Avoid
import { ExtendedOrgRole, hasMinimumRole } from '@/constants/roles';
```

### 2. Check Platform Admin First
```typescript
// Platform admins bypass all checks
if (isPlatformAdmin) {
  return true;
}
// Then check role-specific permissions
```

### 3. Use Permission Matrix for Complex Checks
```typescript
// Instead of multiple if statements
const canAccess = canPerformAction(userRole, resource, action, isPlatformAdmin);

// Not this
if (userRole === 'owner' || userRole === 'admin' || ...) {
  // Complex logic
}
```

### 4. Leverage Role Inheritance
```typescript
import { getInheritedRoles } from '@/utils/roleHelpers';

const inheritedRoles = getInheritedRoles('admin');
// ['redaktør', 'saksbehandler', 'staff', 'lesetilgang', 'customer']
```

## Testing

### Example Test Cases

```typescript
import { hasMinimumRole, canPerformAction } from '@/utils/roleHelpers';

describe('RBAC System', () => {
  it('should validate role hierarchy', () => {
    expect(hasMinimumRole('owner', 'admin', false)).toBe(true);
    expect(hasMinimumRole('customer', 'admin', false)).toBe(false);
    expect(hasMinimumRole('customer', 'admin', true)).toBe(true); // platform admin
  });

  it('should validate permissions', () => {
    expect(canPerformAction('admin', 'facilities', 'create', false)).toBe(true);
    expect(canPerformAction('customer', 'facilities', 'delete', false)).toBe(false);
    expect(canPerformAction('lesetilgang', 'bookings', 'read', false)).toBe(true);
  });

  it('should handle Norwegian roles', () => {
    expect(hasMinimumRole('redaktør', 'staff', false)).toBe(true);
    expect(canPerformAction('saksbehandler', 'bookings', 'update', false)).toBe(true);
  });
});
```

## Files Structure

```
src/
├── constants/
│   ├── roles.ts              # Role constants and labels
│   └── RBAC_README.md        # This documentation
├── types/
│   └── rbac.ts              # RBAC-specific types
└── utils/
    └── roleHelpers.ts       # Role utility functions
```

## Future Enhancements

### Planned Features
1. **Dynamic Permissions**: Runtime permission configuration
2. **Role Templates**: Predefined role templates for common scenarios
3. **Permission Audit**: Logging and tracking permission checks
4. **Role Delegation**: Temporary role elevation
5. **Fine-grained Permissions**: Resource-level permissions (e.g., specific facilities)

### Database Integration
```sql
-- Future table for dynamic permissions
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role org_role NOT NULL,
  resource TEXT NOT NULL,
  actions TEXT[] NOT NULL,
  conditions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Support and Maintenance

### Adding New Roles
1. Add to `EXTENDED_ORG_ROLES` in `/src/constants/roles.ts`
2. Add to `ROLE_PRIORITY` with appropriate priority
3. Add labels to `ROLE_LABELS_EN` and `ROLE_LABELS_NO`
4. Add descriptions to `ROLE_DESCRIPTIONS_EN` and `ROLE_DESCRIPTIONS_NO`
5. Add to `ROLE_INHERITANCE` mapping
6. Add permission matrix in `/src/utils/roleHelpers.ts`
7. Update feature flags as needed

### Adding New Permissions
1. Add resource type to `ResourceType` in `/src/types/rbac.ts`
2. Update permission matrices in `/src/utils/roleHelpers.ts`
3. Add feature flags if needed
4. Update documentation

## License

Part of the BookMe application - internal use only.
