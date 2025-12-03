# Authentication Refactoring Plan

**Issue**: Two separate auth contexts causing confusion and maintenance overhead
**Goal**: Single unified auth system with proper RBAC

---

## Current Problem

### Two Auth Contexts

#### AdminAuthContext (Mock)
```typescript
// Location: src/contexts/AdminAuthContext.tsx
// Status: ❌ MOCK DATA - Not using Supabase

Issues:
- Uses localStorage with hardcoded credentials
- Mock roles: system-admin, org-admin, facility-manager, etc.
- No database integration
- Hardcoded users (admin@example.com / password)
- Not using real Supabase auth
```

#### AuthContext (Real)
```typescript
// Location: src/contexts/AuthContext.tsx
// Status: ✅ REAL SUPABASE - Production ready

Features:
- Real Supabase authentication
- Database-backed roles (customer, staff, admin, owner)
- Session management
- Profile and memberships integration
- Proper JWT tokens
```

### Impact

**Admin Panel**:
- Uses fake AdminAuthContext
- No real authentication
- Anyone can access if they know mock credentials
- Roles don't match database schema

**User Panel**:
- Uses real AuthContext
- Proper authentication
- RBAC working correctly
- Roles from database

**Result**: Inconsistent auth, security issues, maintenance nightmare

---

## Solution: Unified Auth Architecture

### Design Principles

1. **Single Source of Truth**: One AuthContext for entire app
2. **Role-Based Access**: Use database roles (customer, staff, admin, owner, platform_admin)
3. **Supabase Native**: Leverage Supabase Auth completely
4. **Type Safety**: Strong TypeScript types
5. **Security First**: No mock data, all real authentication

---

## Proposed Architecture

### 1. Enhanced AuthContext

**File**: `src/contexts/AuthContext.tsx`

**Features**:
```typescript
interface AuthContextValue {
  // User & Session
  user: User | null;
  session: Session | null;
  profile: Profile | null;

  // Organization & Role
  memberships: readonly Membership[];
  currentOrgId: string | null;
  currentRole: OrgRole | null; // ← NEW

  // Role Checks
  isPlatformAdmin: boolean; // ← NEW
  isOrgAdmin: boolean; // ← NEW (owner or admin)
  isStaff: boolean; // ← NEW (staff, admin, or owner)
  isCustomer: boolean; // ← NEW

  // Permissions
  hasPermission: (resource: string, action: string) => boolean; // ← NEW

  // Loading
  loading: boolean;

  // Actions
  signIn: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setCurrentOrg: (orgId: string) => Promise<void>;
}
```

**Key Changes**:
- Add role checking utilities
- Add permission checking
- Integrate with RBAC service
- Support both user and admin flows

---

### 2. Unified Route Protection

**Current** (Split):
```
/user/* → Uses AuthContext (real)
/admin/* → Uses AdminAuthContext (mock)
```

**Proposed** (Unified):
```
/user/* → Uses AuthContext + RequireAuth(role: 'customer')
/admin/* → Uses AuthContext + RequireAuth(role: 'staff')
```

**Implementation**:
```typescript
// src/components/auth/RequireAuth.tsx
interface RequireAuthProps {
  minRole?: 'customer' | 'staff' | 'admin' | 'owner';
  children: React.ReactNode;
}

export const RequireAuth = ({ minRole = 'customer', children }: RequireAuthProps) => {
  const { user, loading, currentRole } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login-selection" />;

  if (minRole && !hasMinimumRole(currentRole, minRole)) {
    return <Navigate to="/access-denied" />;
  }

  return <>{children}</>;
};
```

---

### 3. Database Role Mapping

**From** (Mock roles):
```typescript
type TRole = "system-admin" | "org-admin" | "facility-manager" |
             "case-worker" | "approver" | "analyst" | "user";
```

**To** (Database roles):
```typescript
// These are in database schema
type OrgRole = "customer" | "staff" | "admin" | "owner";

// Platform admin is separate (in auth.users metadata or RPC check)
type PlatformRole = "platform_admin";
```

**Role Hierarchy**:
```
platform_admin → Can access everything
└─ owner → Full org control
   └─ admin → Org management
      └─ staff → Facility & booking management
         └─ customer → Own bookings only
```

**Permission Matrix**:
| Feature | Customer | Staff | Admin | Owner | Platform |
|---------|----------|-------|-------|-------|----------|
| View own bookings | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all org bookings | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage facilities | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ | ✅ |
| Org settings | ❌ | ❌ | ✅ | ✅ | ✅ |
| Delete org | ❌ | ❌ | ❌ | ✅ | ✅ |
| Platform settings | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Refactoring Steps

### Phase 1: Enhance AuthContext ✅

**File**: `src/contexts/AuthContext.tsx`

**Add**:
```typescript
// Add role checking utilities
const currentRole = useMemo(() => {
  if (!currentOrgId || memberships.length === 0) return null;
  const membership = memberships.find(m => m.org_id === currentOrgId);
  return membership?.role || null;
}, [currentOrgId, memberships]);

const isPlatformAdmin = useMemo(() => {
  // Check via RPC or JWT claims
  return false; // TODO: Implement
}, [user]);

const isOrgAdmin = useMemo(() => {
  return currentRole === 'owner' || currentRole === 'admin' || isPlatformAdmin;
}, [currentRole, isPlatformAdmin]);

const isStaff = useMemo(() => {
  return ['owner', 'admin', 'staff'].includes(currentRole || '') || isPlatformAdmin;
}, [currentRole, isPlatformAdmin]);

const isCustomer = useMemo(() => {
  return currentRole === 'customer';
}, [currentRole]);

const hasPermission = useCallback((resource: string, action: string): boolean => {
  // Integrate with rbacService
  if (isPlatformAdmin) return true;
  // Check permission based on role
  return false; // TODO: Implement
}, [isPlatformAdmin, currentRole]);
```

---

### Phase 2: Update Route Protection

**File**: `src/components/auth/RequireAuth.tsx` (Create)

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_HIERARCHY = {
  customer: 1,
  staff: 2,
  admin: 3,
  owner: 4,
};

interface RequireAuthProps {
  minRole?: 'customer' | 'staff' | 'admin' | 'owner';
  children: React.ReactNode;
}

export const RequireAuth = ({
  minRole = 'customer',
  children
}: RequireAuthProps): JSX.Element => {
  const { user, loading, currentRole, isPlatformAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login-selection" replace />;
  }

  // Platform admin bypasses all checks
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Check role hierarchy
  if (currentRole && ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[minRole]) {
    return <>{children}</>;
  }

  // Access denied
  return <Navigate to="/access-denied" replace />;
};
```

---

### Phase 3: Update App.tsx Routes

**File**: `src/App.tsx`

**From**:
```typescript
<Route path="/user/*" element={<UserRoutes />} />
<Route path="/admin/*" element={<AdminRoutes />} />
```

**To**:
```typescript
<Route path="/user/*" element={
  <RequireAuth minRole="customer">
    <UserRoutes />
  </RequireAuth>
} />
<Route path="/admin/*" element={
  <RequireAuth minRole="staff">
    <AdminRoutes />
  </RequireAuth>
} />
```

---

### Phase 4: Update Admin Components

**Files to update**:
1. `src/components/admin/header/ProfileDropdown.tsx`
2. `src/components/admin/layout/AdminHeader.tsx`
3. Any other components using `useAdminAuth()`

**Change From**:
```typescript
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const { user, logout } = useAdminAuth();
```

**Change To**:
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, profile, signOut } = useAuth();

const handleLogout = async () => {
  await signOut();
  navigate('/login-selection');
};
```

---

### Phase 5: Remove AdminAuthContext

**Delete**:
- `src/contexts/AdminAuthContext.tsx`

**Update**:
- `src/App.tsx` - Remove AdminAuthProvider wrapper

**From**:
```typescript
<AuthProvider>
  <AdminAuthProvider>
    <UserProfileProvider>
      {/* app */}
    </UserProfileProvider>
  </AdminAuthProvider>
</AuthProvider>
```

**To**:
```typescript
<AuthProvider>
  <UserProfileProvider>
    {/* app */}
  </UserProfileProvider>
</AuthProvider>
```

---

### Phase 6: Update Admin Login

**File**: `src/pages/admin/Login.tsx` (if exists)

**Update to use**:
```typescript
const { signInWithPassword } = useAuth();

const handleLogin = async (e: FormEvent) => {
  e.preventDefault();
  try {
    await signInWithPassword(email, password);
    // Check if user has staff+ role
    // Redirect to /admin if yes, /user if no
  } catch (error) {
    // Handle error
  }
};
```

---

## Testing Plan

### Test 1: Customer Access
```
Login: test.user@drammen.kommune.no
Expected:
✅ Can access /user/*
❌ Cannot access /admin/*
✅ Redirect to /access-denied if try /admin
```

### Test 2: Staff Access
```
Login: staff@drammen.kommune.no
Expected:
✅ Can access /user/*
✅ Can access /admin/*
✅ See staff-level features
```

### Test 3: Admin Access
```
Login: admin@drammen.kommune.no
Expected:
✅ Can access /user/*
✅ Can access /admin/*
✅ See admin-level features
✅ Can manage users
```

### Test 4: Owner Access
```
Login: owner@drammen.kommune.no
Expected:
✅ Can access /user/*
✅ Can access /admin/*
✅ See owner-level features
✅ Can manage organization
```

### Test 5: Platform Admin
```
Login: superadmin@booknor.no
Expected:
✅ Can access everything
✅ Platform-wide controls
```

---

## Migration Checklist

### Preparation
- [x] Analyze current auth contexts
- [ ] Design unified architecture
- [ ] Create refactoring plan document

### Implementation
- [ ] Enhance AuthContext with role checks
- [ ] Create RequireAuth component
- [ ] Update App.tsx routes
- [ ] Update admin components to use AuthContext
- [ ] Remove AdminAuthContext
- [ ] Test all user roles
- [ ] Update documentation

### Verification
- [ ] All 5 test users can login
- [ ] Role-based access working
- [ ] Admin panel uses real auth
- [ ] No more mock data
- [ ] Logout works everywhere
- [ ] Protected routes work correctly

---

## Benefits

### Security
✅ No more mock credentials
✅ Real authentication everywhere
✅ Proper RBAC enforcement
✅ Database-backed permissions

### Maintenance
✅ Single auth context
✅ Consistent API
✅ Easier to understand
✅ Less code duplication

### Developer Experience
✅ One way to authenticate
✅ Clear role hierarchy
✅ Type-safe permissions
✅ Better debugging

### User Experience
✅ Consistent login flow
✅ Proper access control
✅ Better error handling
✅ Smoother navigation

---

## Risks & Mitigation

### Risk 1: Breaking Admin Panel
**Impact**: High
**Mitigation**:
- Phase implementation
- Test after each change
- Keep backup of old code

### Risk 2: Role Mapping Confusion
**Impact**: Medium
**Mitigation**:
- Clear documentation
- Migration guide
- Role mapping table

### Risk 3: Lost Features
**Impact**: Medium
**Mitigation**:
- Audit all AdminAuthContext usage
- Ensure all features mapped to AuthContext
- Comprehensive testing

---

## Timeline

### Phase 1-2: Core Changes (2-3 hours)
- Enhance AuthContext
- Create RequireAuth
- Update routes

### Phase 3-4: Component Updates (1-2 hours)
- Update admin components
- Replace useAdminAuth calls
- Test each component

### Phase 5-6: Cleanup & Testing (1 hour)
- Remove AdminAuthContext
- Clean up code
- Full regression test

**Total**: 4-6 hours

---

## Post-Refactoring

### Documentation to Update
- [ ] README.md
- [ ] DEVELOPMENT_SETUP.md
- [ ] RBAC_TEST_RESULTS.md
- [ ] API documentation

### Tests to Run
- [ ] Automated RBAC tests
- [ ] Manual test checklist
- [ ] All user roles
- [ ] All protected routes

### Code to Review
- [ ] No AdminAuthContext imports remaining
- [ ] All components use AuthContext
- [ ] No mock credentials
- [ ] Proper role checking

---

## Decision Log

**Date**: October 27, 2025
**Decision**: Merge AdminAuthContext into AuthContext
**Rationale**:
- Eliminate duplicate auth logic
- Use real Supabase auth everywhere
- Simplify codebase
- Improve security

**Alternatives Considered**:
1. Keep both contexts → ❌ Maintenance nightmare
2. Make AdminAuth use Supabase → ❌ Still duplicate
3. Merge into unified AuthContext → ✅ Best solution

---

## Success Criteria

✅ Single AuthContext used throughout app
✅ No AdminAuthContext references
✅ All test users can login with real auth
✅ Role-based access working correctly
✅ Admin panel uses Supabase auth
✅ All automated tests passing
✅ Documentation updated
✅ No breaking changes for end users
