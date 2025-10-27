# Authentication & RBAC Alignment Report

**Date**: October 27, 2025
**Audit Scope**: Complete codebase auth/RBAC analysis
**Status**: ⚠️ **MISALIGNMENT FOUND** - Dual auth systems detected

---

## Executive Summary

### Critical Finding: Dual Authentication Systems

The BookMe application currently operates with **TWO SEPARATE AUTHENTICATION CONTEXTS**:

1. **AdminAuthContext** (Mock) - Used by admin panel
2. **AuthContext** (Real) - Used by user panel

This creates:
- ❌ **Security vulnerability** - Admin panel uses mock localStorage auth
- ❌ **Maintenance overhead** - Two separate auth implementations
- ❌ **Inconsistent RBAC** - Different role systems
- ❌ **Architectural debt** - Split auth logic

### Recommendation

**MERGE** AdminAuthContext into AuthContext immediately. All systems should use the real Supabase authentication.

---

## Detailed Findings

### 1. Core Auth Services: ✅ EXCELLENT

#### AuthContext.tsx ✅
**Location**: `src/contexts/AuthContext.tsx`
**Status**: ✅ **Production-ready, well-structured**

**Strengths**:
- Real Supabase authentication
- Proper session management
- Database-backed roles (customer, staff, admin, owner)
- Memberships integration
- Profile management
- Type-safe interfaces
- Error handling

**Current features**:
```typescript
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  memberships: readonly Membership[];
  currentOrgId: string | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setCurrentOrg: (orgId: string) => Promise<void>;
}
```

**Recommendation**: ✅ **Keep as-is** - This is the foundation

---

#### auth.service.ts ✅
**Location**: `src/services/supabase/auth.service.ts`
**Status**: ✅ **Comprehensive, well-designed**

**Features**:
- Email/password authentication
- Social auth (Google OAuth)
- Session management
- Password reset
- Email verification
- Profile updates
- Strong validation (email format, password strength)
- Proper error handling

**Recommendation**: ✅ **Keep as-is** - Excellent service layer

---

#### rbac.service.ts ✅
**Location**: `src/services/supabase/rbac.service.ts`
**Status**: ✅ **Robust RBAC implementation**

**Features**:
- Role checking (hasRole, isOrgAdmin, isOrgStaff, isPlatformAdmin)
- Permission matrix implementation
- Organization membership management
- Resource-based permissions
- Staff vs customer permission differentiation
- Integration with database RPC functions

**Permission Matrix**:
| Role | Facilities | Bookings | Users | Org Settings |
|------|-----------|----------|-------|--------------|
| customer | read | CRUD (own) | - | - |
| staff | CRUD | CRUD (all) | read | - |
| admin | CRUD | CRUD (all) | CRUD | CRUD |
| owner | CRUD | CRUD (all) | CRUD | CRUD |
| platform_admin | CRUD | CRUD (all) | CRUD | CRUD |

**Recommendation**: ✅ **Keep as-is** - Excellent RBAC service

---

### 2. Auth Hooks: ✅ EXCELLENT

#### usePermissions.ts ✅
**Location**: `src/hooks/auth/usePermissions.ts`
**Status**: ✅ **Well-structured, React Query integration**

**Features**:
- Fetch permissions data with React Query
- Check specific permissions (can function)
- Check org admin/staff status
- Facility and booking permission checks
- 5-minute cache with automatic refetch
- Proper TypeScript interfaces

**Recommendation**: ✅ **Keep as-is** - Modern React patterns

---

#### useRole.ts ✅
**Location**: `src/hooks/auth/useRole.ts`
**Status**: ✅ **Excellent role checking utilities**

**Features**:
- Role hierarchy implementation
- Quick role checks (isOwner, isAdmin, isStaff, isCustomer)
- Minimum role checking (hasMinimumRole)
- Platform admin bypass logic
- Multi-org role support (useRoles)
- React Query caching

**Role Priority System**:
```typescript
owner: 4
admin: 3
staff: 2
customer: 1
```

**Recommendation**: ✅ **Keep as-is** - Clean hook design

---

### 3. Auth Guards: ✅ EXCELLENT

#### RoleGuard.tsx ✅
**Location**: `src/components/auth/RoleGuard.tsx`
**Status**: ✅ **Flexible guard component**

**Features**:
- Multiple role checking modes (minRole, exactRole, anyRole)
- Platform admin bypass
- Custom fallback components
- Helper components (AdminOnly, StaffOnly, etc.)
- Uses real useRole hook

**Recommendation**: ✅ **Keep as-is** - Well-designed guards

---

#### PermissionGuard.tsx ✅
**Location**: `src/components/auth/PermissionGuard.tsx`
**Status**: ✅ **Granular permission checking**

**Features**:
- Resource-based permission checks
- Multiple permission modes (single, all, any)
- Helper components (CanCreate, CanUpdate, etc.)
- Async permission resolution
- Custom fallback support

**Recommendation**: ✅ **Keep as-is** - Excellent permission guards

---

### 4. Mock Auth System: ❌ CRITICAL ISSUE

#### AdminAuthContext.tsx ❌
**Location**: `src/contexts/AdminAuthContext.tsx`
**Status**: ❌ **MOCK DATA - MUST BE REMOVED**

**Problems**:
```typescript
// 🚨 HARDCODED CREDENTIALS
if (email === "admin@example.com" && password === "password") {
  newUser = {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    roles: ["system-admin", "org-admin", ...] // Mock roles!
  };
}

// 🚨 USES LOCALSTORAGE ONLY - NO DATABASE
localStorage.setItem('adminUser', JSON.stringify(newUser));
```

**Mock Role System** (doesn't match database):
- `system-admin`
- `org-admin`
- `facility-manager`
- `case-worker`
- `approver`
- `analyst`
- `user`

**Database Role System** (real):
- `customer`
- `staff`
- `admin`
- `owner`
- `platform_admin`

**Security Issues**:
- ❌ No real authentication
- ❌ Anyone can access with mock credentials
- ❌ No session management
- ❌ No database integration
- ❌ Roles don't match schema

**Recommendation**: ❌ **DELETE THIS FILE** - Replace with real auth

---

### 5. Admin Components Using Mock Auth: ❌ NEED UPDATE

#### ProfileDropdown.tsx (Admin) ❌
**Location**: `src/components/admin/header/ProfileDropdown.tsx`
**Status**: ❌ **Uses AdminAuthContext**

**Current code**:
```typescript
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const { user, logout } = useAdminAuth();
```

**Required changes**:
```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user, profile, signOut } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
  await signOut();
  navigate('/login-selection');
};
```

**Recommendation**: ❌ **UPDATE TO USE AuthContext**

---

#### RequireRole.tsx (Admin Guard) ❌
**Location**: `src/components/admin/guards/RequireRole.tsx`
**Status**: ❌ **Uses AdminAuthContext with mock roles**

**Current code**:
```typescript
import { useAdminAuth } from "@/contexts/AdminAuthContext";

type TRole = "system-admin" | "org-admin" | ...;

export const RequireRole = ({ roles, children }) => {
  const { user } = useAdminAuth();
  const allowed = user?.roles?.some(r => roles.includes(r));
  // ...
};
```

**Recommended approach**:
```typescript
import { useRole } from "@/hooks/auth/useRole";

export const RequireRole = ({ minRole = 'staff', children }) => {
  const { hasMinimumRole, loading, isPlatformAdmin } = useRole();

  if (loading) return <LoadingSpinner />;
  if (isPlatformAdmin) return <>{children}</>;
  if (hasMinimumRole(minRole)) return <>{children}</>;

  return <Navigate to="/access-denied" />;
};
```

**Recommendation**: ❌ **REWRITE TO USE useRole hook**

---

#### SettingsPage.tsx (Admin) ❌
**Location**: `src/pages/admin/SettingsPage.tsx`
**Status**: ❌ **Uses AdminAuthContext**

**Current code**:
```typescript
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const { user, updateUser } = useAdminAuth();
```

**Required changes**:
```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";

const { user, profile } = useAuth();
const { updateProfile } = useUserProfile();
```

**Recommendation**: ❌ **UPDATE TO USE AuthContext**

---

### 6. App.tsx Provider Structure: ⚠️ NEEDS CLEANUP

**Location**: `src/App.tsx`
**Status**: ⚠️ **Has AdminAuthProvider wrapper**

**Current structure**:
```typescript
<AuthProvider>
  <LanguageProvider>
    <AdminAuthProvider> {/* 🚨 REMOVE THIS */}
      <CartProvider>
        <UserProfileProvider>
          {/* app */}
        </UserProfileProvider>
      </CartProvider>
    </AdminAuthProvider>
  </LanguageProvider>
</AuthProvider>
```

**Required structure**:
```typescript
<AuthProvider>
  <LanguageProvider>
    <CartProvider>
      <UserProfileProvider>
        {/* app */}
      </UserProfileProvider>
    </CartProvider>
  </LanguageProvider>
</AuthProvider>
```

**Recommendation**: ⚠️ **REMOVE AdminAuthProvider**

---

## Files Summary

### ✅ KEEP AS-IS (Well-structured, production-ready)
1. `src/contexts/AuthContext.tsx` ✅
2. `src/services/supabase/auth.service.ts` ✅
3. `src/services/supabase/rbac.service.ts` ✅
4. `src/hooks/auth/usePermissions.ts` ✅
5. `src/hooks/auth/useRole.ts` ✅
6. `src/components/auth/RoleGuard.tsx` ✅
7. `src/components/auth/PermissionGuard.tsx` ✅

### ❌ DELETE
1. `src/contexts/AdminAuthContext.tsx` ❌ **DELETE ENTIRE FILE**

### ⚠️ UPDATE (Replace AdminAuthContext with AuthContext)
1. `src/App.tsx` - Remove AdminAuthProvider wrapper
2. `src/components/admin/header/ProfileDropdown.tsx` - Use useAuth()
3. `src/components/admin/guards/RequireRole.tsx` - Use useRole()
4. `src/pages/admin/SettingsPage.tsx` - Use useAuth() and useUserProfile()

---

## Migration Strategy

### Phase 1: Backup & Preparation ✅
- ✅ Create AUTH_REFACTORING_PLAN.md
- ✅ Create AUTH_ALIGNMENT_REPORT.md (this document)
- ✅ Document all AdminAuthContext usage

### Phase 2: Update Admin Components (2-3 hours)

#### 2.1 Update ProfileDropdown
```typescript
// File: src/components/admin/header/ProfileDropdown.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login-selection');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const userName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email;

  return (
    // ... UI with userName and handleLogout
  );
};
```

#### 2.2 Rewrite RequireRole Guard
```typescript
// File: src/components/admin/guards/RequireRole.tsx

import { useRole } from "@/hooks/auth/useRole";
import { Navigate } from "react-router-dom";

const ROLE_HIERARCHY = {
  customer: 1,
  staff: 2,
  admin: 3,
  owner: 4,
};

interface RequireRoleProps {
  minRole?: 'customer' | 'staff' | 'admin' | 'owner';
  children: React.ReactNode;
}

export const RequireRole = ({
  minRole = 'staff',
  children
}: RequireRoleProps): JSX.Element => {
  const { role, loading, isPlatformAdmin } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Platform admin bypasses all checks
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Check role hierarchy
  if (role && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole]) {
    return <>{children}</>;
  }

  return <Navigate to="/access-denied" replace />;
};
```

#### 2.3 Update SettingsPage
```typescript
// File: src/pages/admin/SettingsPage.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const { updateProfile } = useUserProfile();

  // Use profile data instead of mock user data
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = async () => {
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
    });
  };

  // ... rest of component
};
```

### Phase 3: Update App.tsx (10 minutes)

```typescript
// File: src/App.tsx

export const App = (): React.JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          {/* REMOVED: <AdminAuthProvider> */}
          <CartProvider>
            <UserProfileProvider>
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* ... routes */}
                </Routes>
              </BrowserRouter>
            </UserProfileProvider>
          </CartProvider>
          {/* REMOVED: </AdminAuthProvider> */}
        </LanguageProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
```

### Phase 4: Delete AdminAuthContext (5 minutes)

```bash
# Delete the mock auth context
rm src/contexts/AdminAuthContext.tsx
```

### Phase 5: Update Admin Routes Protection (30 minutes)

Update admin routes to use RequireAuth with minimum role:

```typescript
// In AdminRoutes.tsx or App.tsx

import { RequireRole } from "@/components/admin/guards/RequireRole";

<Route path="/admin/*" element={
  <RequireRole minRole="staff">
    <AdminRoutes />
  </RequireRole>
} />
```

### Phase 6: Testing (1 hour)

Test all scenarios from MANUAL_TEST_CHECKLIST.md:
1. Customer cannot access /admin
2. Staff can access /admin
3. Admin can access /admin with full permissions
4. Logout works from admin panel
5. Profile data displays correctly
6. Settings page works with real data

---

## Impact Assessment

### Security Impact: 🔴 HIGH
- **Current**: Admin panel accessible with mock credentials
- **After fix**: Admin panel requires real Supabase authentication
- **Benefit**: Eliminates critical security vulnerability

### Development Impact: 🟢 LOW
- Only 4 files need updating
- Well-documented refactoring plan
- Real auth system already exists and tested

### User Impact: 🟢 NONE
- No breaking changes for end users
- Same login flow
- Improved security

### Testing Impact: 🟡 MEDIUM
- Need to test all admin panel features
- Verify role-based access
- Ensure logout works correctly

---

## Timeline

| Phase | Task | Duration | Complexity |
|-------|------|----------|------------|
| 1 | Backup & Preparation | ✅ Done | Easy |
| 2 | Update Admin Components | 2-3 hours | Medium |
| 3 | Update App.tsx | 10 minutes | Easy |
| 4 | Delete AdminAuthContext | 5 minutes | Easy |
| 5 | Update Route Protection | 30 minutes | Medium |
| 6 | Testing | 1 hour | Medium |

**Total Estimated Time**: 4-5 hours

---

## Risk Assessment

### Risk 1: Breaking Admin Panel
**Impact**: High
**Probability**: Low (if following plan)
**Mitigation**:
- Test after each component update
- Keep backup of AdminAuthContext temporarily
- Incremental changes with git commits

### Risk 2: User Confusion
**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Admin users already have accounts in Supabase
- Same login flow
- Clear error messages

### Risk 3: Lost Functionality
**Impact**: Medium
**Probability**: Very Low
**Mitigation**:
- Audit shows all AdminAuth features exist in AuthContext
- Real auth has MORE features than mock auth

---

## Success Criteria

✅ **Complete when**:
1. AdminAuthContext.tsx deleted
2. All admin components use AuthContext
3. No references to useAdminAuth() in codebase
4. Admin panel accessible only with real Supabase auth
5. All manual tests pass (MANUAL_TEST_CHECKLIST.md)
6. No console errors
7. Logout works correctly

---

## Follow-up Actions

### After Migration
1. Update documentation (README.md)
2. Update AUTH_REFACTORING_PLAN.md status
3. Run full RBAC test suite
4. Update RBAC_TEST_RESULTS.md
5. Git commit with message: "fix(auth): merge AdminAuthContext into unified AuthContext"

### Future Enhancements
1. Add admin-specific features to AuthContext if needed
2. Implement platform admin checking in UI
3. Add role-based navigation restrictions
4. Enhance permission granularity

---

## Conclusion

### Current State
- ❌ Dual auth systems (mock + real)
- ❌ Security vulnerability in admin panel
- ✅ Excellent real auth foundation
- ✅ Well-structured RBAC services

### Target State
- ✅ Single unified auth system
- ✅ Real Supabase auth everywhere
- ✅ Consistent RBAC across app
- ✅ Proper security

### Action Required
**Immediate**: Execute refactoring to merge auth systems
**Priority**: High (security issue)
**Effort**: Medium (4-5 hours)
**Risk**: Low (well-planned migration)

---

**Report Generated**: October 27, 2025
**Next Action**: Execute Phase 2 of migration plan
**Status**: ⚠️ **AWAITING REFACTORING**
