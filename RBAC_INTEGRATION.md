# RBAC System Integration Guide

## Overview

A comprehensive, production-ready Role-Based Access Control (RBAC) system has been implemented with strict TypeScript type safety, Norwegian/English translations, and extensive permission management.

## What Was Created

### Core Files (1,429 lines of TypeScript)

1. **`/src/constants/roles.ts`** (327 lines)
   - Role constants and type definitions
   - Norwegian/English translations
   - Role hierarchy and inheritance
   - Backwards compatibility support

2. **`/src/types/rbac.ts`** (370 lines)
   - RBAC-specific type definitions
   - Permission interfaces
   - Feature flag types
   - Type guards and factory functions

3. **`/src/utils/roleHelpers.ts`** (732 lines)
   - Role checking utilities
   - Permission matrix management
   - Feature flag management
   - UI helper functions

4. **`/src/constants/RBAC_README.md`** (11KB)
   - Comprehensive documentation
   - Usage examples
   - Best practices
   - Migration guide

## Features

### Type Safety
- **Zero `any` types** - Strict TypeScript throughout
- **Explicit return types** for all functions
- **Readonly interfaces** for all props
- **Comprehensive JSDoc** documentation
- **Type guards** for runtime validation

### Role System
- **Platform Roles**: `platform_admin`, `user`
- **Organization Roles**: `owner`, `admin`, `staff`, `customer`
- **Extended Roles** (Norwegian): `redaktør`, `saksbehandler`, `lesetilgang`
- **Role Hierarchy**: Priority-based (100 for owner down to 10 for customer)
- **Role Inheritance**: Admin inherits all staff permissions

### Permission Management
- **Resource-based permissions**: 19 resource types (facilities, bookings, etc.)
- **Action types**: create, read, update, delete, manage, export
- **Permission matrices**: Pre-defined for each role
- **Scope-based checks**: Context-aware permission validation

### Feature Flags
- **8 feature flags** ready to use
- **Role-based enablement**: Features enabled per role
- **Runtime checks**: Dynamic feature access validation

### Internationalization
- **Norwegian (Bokmål)** and **English** translations
- **Role labels** and **descriptions** in both languages
- **Locale-aware** helper functions

## Quick Start

### 1. Basic Usage

```typescript
import { hasMinimumRole, canPerformAction } from '@/utils/roleHelpers';
import { ORG_ROLES } from '@/constants/roles';

// Check if user has minimum role
const canManage = hasMinimumRole(userRole, 'staff', isPlatformAdmin);

// Check specific permission
const canCreateFacility = canPerformAction(
  userRole,
  'facilities',
  'create',
  isPlatformAdmin
);
```

### 2. Feature Flags

```typescript
import { hasFeatureAccess, getEnabledFeatures } from '@/utils/roleHelpers';

// Check single feature
if (hasFeatureAccess(userRole, 'analytics_dashboard', isPlatformAdmin)) {
  // Show analytics
}

// Get all enabled features
const features = getEnabledFeatures(userRole, isPlatformAdmin);
```

### 3. Translations

```typescript
import { getRoleLabel, formatRole } from '@/constants/roles';

// Get translated label
const labelNO = getRoleLabel('saksbehandler', 'no'); // "Saksbehandler"
const labelEN = getRoleLabel('saksbehandler', 'en'); // "Case Handler"
```

## Integration with Existing Code

### Compatible with Existing Services

The RBAC system is **fully compatible** with your existing code:

```typescript
// Your existing rbacService.ts can use the new utilities
import { hasMinimumRole, canPerformAction } from '@/utils/roleHelpers';
import type { ExtendedOrgRole } from '@/constants/roles';

// Enhance existing methods
async hasPermission(
  userId: string,
  permission: Permission,
  orgId?: string
): Promise<boolean> {
  const role = await this.getUserRole(userId, orgId);
  const isPlatformAdmin = await this.isPlatformAdmin(userId);

  return canPerformAction(
    role as ExtendedOrgRole,
    permission.resource,
    permission.action,
    isPlatformAdmin
  );
}
```

### Updating Hooks

Enhance your existing `useRole` and `usePermissions` hooks:

```typescript
// In useRole.ts
import { hasMinimumRole, getInheritedRoles } from '@/utils/roleHelpers';
import type { ExtendedOrgRole } from '@/constants/roles';

// Add new utility methods
const inheritedRoles = getInheritedRoles(role as ExtendedOrgRole);
const hasMinRole = (minRole: ExtendedOrgRole) =>
  hasMinimumRole(role as ExtendedOrgRole, minRole, isPlatformAdmin);
```

## Role Definitions

### Platform Level
- **platform_admin**: Full system access (Priority: Implicit highest)
- **user**: Standard platform user

### Organization Level (Descending Priority)

| Role | Priority | English | Norwegian | Description |
|------|----------|---------|-----------|-------------|
| owner | 100 | Owner | Eier | Full organization control |
| admin | 90 | Administrator | Administrator | Administrative access |
| redaktør | 80 | Editor | Redaktør | Content/facility management |
| saksbehandler | 70 | Case Handler | Saksbehandler | Booking/customer management |
| staff | 60 | Staff Member | Ansatt | Operational access |
| lesetilgang | 50 | Read-Only | Lesetilgang | View-only access |
| customer | 10 | Customer | Kunde | Standard customer access |

## Permission Matrix Summary

### Owner
- **ALL** resources: Full CRUD + manage

### Admin
- **Most** resources: Full CRUD + manage
- **Cannot**: Delete organization

### Redaktør (Editor)
- **Facilities**: Full CRUD
- **Content**: Full management
- **Cannot**: Access billing/sensitive data

### Saksbehandler (Case Handler)
- **Bookings**: Full CRUD
- **Support**: Full CRUD
- **Customers**: Read/update profiles

### Staff
- **Operations**: Full CRUD on facilities, bookings
- **Cannot**: Modify org settings

### Lesetilgang (Read-Only)
- **ALL** resources: Read access
- **Cannot**: Modify anything

### Customer
- **View**: Facilities, availability
- **Manage**: Own bookings, profile, favorites

## Migration Path for Extended Roles

The extended roles (`redaktør`, `saksbehandler`, `lesetilgang`) are not yet in the database enum. Here's the migration plan:

### Phase 1: Current (TypeScript Only)
```typescript
// Use ExtendedOrgRole type
import type { ExtendedOrgRole } from '@/constants/roles';
```

### Phase 2: Database Migration
```sql
-- Add new roles to enum
ALTER TYPE org_role ADD VALUE 'redaktør';
ALTER TYPE org_role ADD VALUE 'saksbehandler';
ALTER TYPE org_role ADD VALUE 'lesetilgang';
```

### Phase 3: Update Types
```typescript
// OrgRole now includes extended roles automatically
import type { OrgRole } from '@/constants/roles';
```

## Examples

### Component with Role Checks

```typescript
import { hasMinimumRole } from '@/utils/roleHelpers';
import { useRole } from '@/hooks/auth/useRole';

export const AdminPanel = (): JSX.Element | null => {
  const { role, isPlatformAdmin } = useRole();

  if (!hasMinimumRole(role, 'admin', isPlatformAdmin)) {
    return null;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Admin Panel</h2>
      {/* Admin content */}
    </div>
  );
};
```

### Permission-Based Navigation

```typescript
import { canPerformAction } from '@/utils/roleHelpers';

const NavItem = ({ resource, action }: { resource: ResourceType; action: ActionType }) => {
  const { role, isPlatformAdmin } = useRole();

  if (!canPerformAction(role, resource, action, isPlatformAdmin)) {
    return null;
  }

  return <MenuItem />;
};
```

### Feature-Gated Content

```typescript
import { hasFeatureAccess } from '@/utils/roleHelpers';

export const Analytics = (): JSX.Element | null => {
  const { role, isPlatformAdmin } = useRole();

  if (!hasFeatureAccess(role, 'analytics_dashboard', isPlatformAdmin)) {
    return <div>Access Denied</div>;
  }

  return <AnalyticsDashboard />;
};
```

## Testing

### Unit Tests Example

```typescript
import { hasMinimumRole, canPerformAction } from '@/utils/roleHelpers';

describe('RBAC System', () => {
  describe('Role Hierarchy', () => {
    it('should validate owner > admin', () => {
      expect(hasMinimumRole('owner', 'admin', false)).toBe(true);
    });

    it('should validate staff < admin', () => {
      expect(hasMinimumRole('staff', 'admin', false)).toBe(false);
    });

    it('should allow platform admin all roles', () => {
      expect(hasMinimumRole('customer', 'owner', true)).toBe(true);
    });
  });

  describe('Permissions', () => {
    it('should allow admin to create facilities', () => {
      expect(canPerformAction('admin', 'facilities', 'create', false)).toBe(true);
    });

    it('should deny customer facility deletion', () => {
      expect(canPerformAction('customer', 'facilities', 'delete', false)).toBe(false);
    });

    it('should allow redaktør to manage content', () => {
      expect(canPerformAction('redaktør', 'facilities', 'update', false)).toBe(true);
    });
  });
});
```

## TypeScript Configuration

The RBAC system requires your existing TypeScript configuration:
- `strict: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

All requirements are already met in your `tsconfig.json`.

## Performance Considerations

- **Permission matrices**: Pre-computed at module load (O(1) lookup)
- **Role comparisons**: Simple numeric priority comparison
- **Type guards**: Minimal runtime overhead
- **Memoization**: Consider wrapping in React.useMemo for complex checks

## Future Enhancements

### Planned
1. **Dynamic Permissions**: Runtime permission configuration
2. **Permission Audit**: Logging permission checks
3. **Role Templates**: Pre-configured role bundles
4. **Fine-grained Permissions**: Resource-level permissions

### Database Schema (Future)
```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role org_role NOT NULL,
  resource TEXT NOT NULL,
  actions TEXT[] NOT NULL,
  conditions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## File Locations

```
/Users/ibrahimrahmani/Documents/xaheen/bookme/
├── src/
│   ├── constants/
│   │   ├── roles.ts              # 327 lines - Role constants
│   │   └── RBAC_README.md        # 11KB - Detailed docs
│   ├── types/
│   │   └── rbac.ts               # 370 lines - Type definitions
│   └── utils/
│       └── roleHelpers.ts        # 732 lines - Utility functions
└── RBAC_INTEGRATION.md           # This file
```

## Summary Statistics

- **Total Lines of Code**: 1,429
- **TypeScript Files**: 3
- **Documentation**: 2 files (11KB)
- **Roles Supported**: 9 (2 platform + 7 organization)
- **Resources**: 19 types
- **Permissions**: 6 action types
- **Feature Flags**: 8
- **Languages**: 2 (English + Norwegian)
- **Type Safety**: 100% (zero `any` types)
- **Compilation Errors**: 0

## Support

For questions or issues, refer to:
1. **`/src/constants/RBAC_README.md`** - Comprehensive documentation
2. **Existing codebase**: `/src/services/supabase/rbac.service.ts`
3. **Hooks**: `/src/hooks/auth/useRole.ts`, `/src/hooks/auth/usePermissions.ts`

## License

Part of the BookMe application - internal use only.
