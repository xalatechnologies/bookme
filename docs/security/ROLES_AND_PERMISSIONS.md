# Roles and Permissions

This document describes the role-based access control (RBAC) system in Booknor, including role definitions, permissions, and implementation details.

## Overview

Booknor uses a hierarchical role system with both **platform roles** and **organization roles**. Each role has specific permissions that determine what actions users can perform and what resources they can access.

## Role Types

### Platform Roles

Platform roles apply across the entire system:

| Role | Description | Use Case |
|------|-------------|----------|
| `platform_admin` | Full system access across all organizations | System administrators, support staff |
| `user` | Standard platform user | Default role for all authenticated users |

### Organization Roles

Organization roles are scoped to specific organizations:

| Role | Priority | Description | Norwegian Label |
|------|----------|-------------|-----------------|
| `owner` | 100 | Full control over the organization | Eier |
| `admin` | 80 | Administrative access to the organization | Administrator |
| `case_handler` | 60 | Main operational role for handling bookings | Saksbehandler |
| `editor` | 40 | Content management role | Redaktør |
| `read_only` | 20 | View-only access | Lesetilgang |
| `customer` | 10 | Standard customer access | Kunde |
| `staff` | 60 | **DEPRECATED** - Mapped to `case_handler` | Ansatt (utgått) |

> **Note**: The `staff` role is deprecated and automatically mapped to `case_handler` for backwards compatibility.

## Role Hierarchy

Roles are organized in a hierarchy where higher-priority roles inherit permissions from lower-priority roles:

```
owner (100)
  ├─ admin (80)
  │   ├─ case_handler (60)
  │   │   └─ read_only (20)
  │   │       └─ customer (10)
  │   └─ editor (40)
  │       └─ read_only (20)
  │           └─ customer (10)
  └─ [inherits all permissions]
```

### Role Inheritance

- **Owner**: Inherits permissions from all other roles
- **Admin**: Inherits permissions from `case_handler`, `editor`, `read_only`, and `customer`
- **Case Handler**: Inherits permissions from `read_only` and `customer`
- **Editor**: Inherits permissions from `read_only` and `customer`
- **Read Only**: Inherits permissions from `customer`
- **Customer**: No inherited permissions (base role)

## Permissions by Role

### Owner

**Full organization control** - Can perform all actions:

- ✅ Manage all settings, members, facilities, bookings, and billing
- ✅ Create, read, update, and delete all resources
- ✅ Assign any role to members
- ✅ Access all reports and analytics
- ✅ View and export audit logs
- ✅ Manage integrations and system settings

### Admin

**Administrative access** - Can manage most aspects except organization deletion:

- ✅ Manage members, facilities, bookings
- ✅ Create, read, update, and delete most resources
- ✅ Assign roles (except `owner`)
- ✅ Access reports and analytics
- ✅ View and export audit logs
- ✅ Manage integrations
- ❌ Delete organization
- ❌ Modify billing settings (read-only)

### Case Handler (Saksbehandler)

**Main operational role** - Handles bookings and customer requests:

- ✅ Create, read, update, and delete bookings
- ✅ Approve/reject booking requests
- ✅ Manage availability and blackouts
- ✅ Handle customer support tickets
- ✅ View facilities and zones (read-only)
- ✅ View reports
- ❌ Manage facilities or users
- ❌ Access system settings

### Editor (Redaktør)

**Content management** - Manages facility content:

- ✅ Create, read, update, and delete facilities
- ✅ Upload and manage media
- ✅ Manage tags and categories
- ✅ Edit facility descriptions
- ✅ Manage availability rules
- ✅ View bookings (read-only)
- ❌ Handle bookings or approvals
- ❌ Manage users

### Read Only (Lesetilgang)

**View-only access** - Can view but not modify:

- ✅ View facilities, bookings, and reports
- ✅ View availability rules and pricing
- ✅ Create support tickets
- ❌ Modify any resources
- ❌ Access billing or audit logs

### Customer (Kunde)

**Standard customer access** - End-user permissions:

- ✅ View facilities and availability
- ✅ Create and manage own bookings
- ✅ Create reviews
- ✅ Manage own profile
- ✅ Create support tickets
- ❌ Access admin features
- ❌ View other users' data

## Admin Portal Access

### Access Requirements

To access the admin portal (`/admin/*`), users must have one of the following roles:

- `owner`
- `admin`
- `case_handler` (staff)

### Route Protection

All admin routes are protected using the `ProtectedRoute` component with role requirements:

```typescript
<ProtectedRoute 
  requiredRole="staff" 
  loginPath="/login-selection"
  unauthorizedComponent={<AdminUnauthorizedComponent />}
>
  <AdminLayout><OverviewPage /></AdminLayout>
</ProtectedRoute>
```

### Navigation Visibility

The admin sidebar dynamically shows/hides menu items based on the user's role:

| Menu Item | Required Role | Visible To |
|-----------|---------------|------------|
| Dashboard | `staff` | staff, admin, owner |
| Facilities | `admin` | admin, owner |
| Bookings | `staff` | staff, admin, owner |
| Users & Roles | `admin` | admin, owner |
| Messages | `staff` | staff, admin, owner |
| Notifications | `staff` | staff, admin, owner |
| Reports | `staff` | staff, admin, owner |
| Integrations | `admin` | admin, owner |
| Audit Log | `admin` | admin, owner |
| Data Retention | `admin` | admin, owner |
| Localization | `admin` | admin, owner |

## Implementation Details

### Role Constants

Role definitions are centralized in `src/constants/roles.ts`:

```typescript
export const ORG_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  CASE_HANDLER: 'case_handler',
  EDITOR: 'editor',
  READ_ONLY: 'read_only',
  CUSTOMER: 'customer',
  STAFF: 'staff', // DEPRECATED
} as const;
```

### Role Checking Functions

The system provides several utility functions for role checking:

```typescript
// Check minimum role requirement
hasMinimumRole(userRole, requiredRole): boolean

// Check exact role match
hasExactRole(userRole, targetRole): boolean

// Check any of multiple roles
hasAnyRole(userRole, roles): boolean

// Check if user can perform action on resource
canPerformAction(userRole, resource, action): boolean
```

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```typescript
import { ProtectedRoute } from '@/components/features/auth/components/ProtectedRoute';

// Require authentication only
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### Role-Based UI

UI elements can be conditionally rendered based on roles:

```typescript
import { useRole } from '@/hooks/auth/useRole';

function MyComponent() {
  const { role, hasMinimumRole } = useRole();
  
  return (
    <>
      {hasMinimumRole('admin') && (
        <AdminButton />
      )}
    </>
  );
}
```

## Security Considerations

### Row Level Security (RLS)

All database queries are protected by Supabase RLS policies that enforce role-based access:

- Policies check the user's role in the `memberships` table
- Organization-scoped data is filtered by `org_id`
- User-scoped data is filtered by `user_id`

### Client-Side vs Server-Side

- **Client-side role checks**: Used for UI visibility and navigation
- **Server-side enforcement**: RLS policies provide the actual security boundary
- **Never rely solely on client-side checks** for security-critical operations

### Role Assignment

- Only `owner` and `admin` roles can assign roles to other users
- Users cannot assign a role higher than or equal to their own (except `owner`)
- Role changes are logged in the audit log

## Migration Notes

### Deprecated `staff` Role

The `staff` role has been deprecated in favor of more specific roles:

- **`staff` → `case_handler`**: For operational staff handling bookings
- **`staff` → `editor`**: For content management staff

Existing `staff` users are automatically mapped to `case_handler` via the compatibility layer in `src/constants/roles.ts`.

## Testing Role-Based Access

### Manual Testing

Test with different user roles:

1. **Owner**: Should see all menu items and have full access
2. **Admin**: Should see most items except organization deletion
3. **Case Handler**: Should see operational items (bookings, messages, reports)
4. **Editor**: Should see content management items
5. **Read Only**: Should see view-only access
6. **Customer**: Should not access admin portal

### Automated Testing

Role-based access should be tested in integration tests:

```typescript
describe('Admin Portal Access', () => {
  it('allows staff to access bookings page', () => {
    // Test implementation
  });
  
  it('prevents customers from accessing admin portal', () => {
    // Test implementation
  });
});
```

## Related Documentation

- [State Management](../dev/STATE_MANAGEMENT.md)
- [Entity Model](../data/ENTITY_MODEL.md)
- [Security Model](./SECURITY_MODEL.md)
- [Role Redesign Plan](../features/ROLE_REDESIGN_PLAN_ENGLISH.md)

## References

- Role constants: `src/constants/roles.ts`
- Role utilities: `src/shared/utils/role.ts`
- Protected routes: `src/components/features/auth/components/ProtectedRoute.tsx`
- Admin routes: `src/pages/AdminRoutes.tsx`
- Admin sidebar: `src/components/layouts/AdminLayout/AdminSidebar.tsx`
