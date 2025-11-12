# Booknor - Architecture Audit & Refactoring Plan

**Generated**: 2025-10-28  
**Analysis Tools**: `analyze-codebase.js` + `analyze-architecture.js`  
**Total Files**: 351 TypeScript files

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Auth & RBAC Analysis](#auth--rbac-analysis)
3. [Design System & Styling](#design-system--styling)
4. [Separation of Concerns](#separation-of-concerns)
5. [Component Connectivity](#component-connectivity)
6. [Animations & Transitions](#animations--transitions)
7. [Performance Analysis](#performance-analysis)
8. [Refactoring Roadmap](#refactoring-roadmap)

---

## Executive Summary

### Quick Wins 🎯
| Category | Issue | Impact | Effort | Priority |
|----------|-------|--------|--------|----------|
| Performance | 63 components with inline arrow functions | High | Low | 🔴 Critical |
| Styling | 11 files mixing Tailwind + inline styles | Medium | Low | 🟡 High |
| SoC | 11 components with business logic in render | High | Medium | 🔴 Critical |
| Auth | 2 files with inline auth logic | Medium | Low | 🟡 High |
| TypeScript | 31 explicit `any` usages | Medium | Low | 🟡 High |

### Health Scores

```
┌────────────────────────────────────────┐
│ Architecture Health Scorecard          │
├────────────────────────────────────────┤
│ Auth & Security      ████████░░  80%   │
│ Code Separation      ████████░░  75%   │
│ Design Consistency   ███████░░░  70%   │
│ Performance          ██████░░░░  60%   │
│ Type Safety          ████████░░  85%   │
│ Localization         ███░░░░░░░  30%   │
│                                        │
│ Overall Score:       ██████░░░░  67%   │
└────────────────────────────────────────┘
```

---

## Auth & RBAC Analysis

### Summary Statistics

| Metric | Count | Status |
|--------|-------|--------|
| Files with auth logic | 60 | ✅ Good coverage |
| Files with inline auth checks | 2 | ⚠️ Needs refactoring |
| Unique roles found | 7 | ⚠️ Inconsistent casing |
| Unique permissions | 2 | 🔴 Under-utilized |

### Role System Issues

**❌ Problem: Inconsistent Role Naming**
```typescript
// Found in codebase:
'admin'     // lowercase
'Admin'     // capitalized
'owner'
'Owner'
'customer'
'Customer'
'staff'
'superadmin'
```

**✅ Solution: Standardize to Constants**
```typescript
// src/constants/roles.ts (already exists!)
export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  OWNER: 'owner',
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

// Usage everywhere:
import { ROLES } from '@/constants/roles';

if (user.role === ROLES.ADMIN) { // ✅ Type-safe, consistent
```

### Permission System Issues

**🔴 Problem: Under-utilized Permission System**

Only 2 permissions found across 60 files:
- `facilities.delete`
- `bookings.approve`

**✅ Solution: Expand Permission-Based Access Control**

```typescript
// src/constants/permissions.ts (create new)
export const PERMISSIONS = {
  // Bookings
  BOOKINGS_READ: 'bookings.read',
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_UPDATE: 'bookings.update',
  BOOKINGS_DELETE: 'bookings.delete',
  BOOKINGS_APPROVE: 'bookings.approve',
  BOOKINGS_REJECT: 'bookings.reject',
  
  // Facilities
  FACILITIES_READ: 'facilities.read',
  FACILITIES_CREATE: 'facilities.create',
  FACILITIES_UPDATE: 'facilities.update',
  FACILITIES_DELETE: 'facilities.delete',
  
  // Users
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_ROLES: 'users.manage_roles',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
```

### Inline Auth Logic

**Files with inline auth checks (needs refactoring):**

1. **Component Name** (if found): Move to `usePermissions` hook
2. **Component Name** (if found): Use `<PermissionGuard>` component

**❌ Bad Pattern:**
```typescript
// Don't do this:
<Button onClick={handleDelete}>
  {user.role === 'admin' || user.role === 'owner' ? 'Delete' : null}
</Button>
```

**✅ Good Pattern:**
```typescript
// Do this:
import { PermissionGuard } from '@/components/features/auth';
import { PERMISSIONS } from '@/constants/permissions';

<PermissionGuard permission={PERMISSIONS.FACILITIES_DELETE}>
  <Button onClick={handleDelete}>Delete</Button>
</PermissionGuard>
```

### Auth Components Usage

**Existing Auth Guards (use these!):**
- ✅ `<ProtectedRoute>` - Route-level protection
- ✅ `<RequireRole>` - Component-level role check
- ✅ `<RoleGuard>` - Role-based rendering
- ✅ `<PermissionGuard>` - Permission-based rendering

**Hooks:**
- ✅ `useAuth()` - Get current user & auth state
- ✅ `useRole()` - Get & check user role
- ✅ `usePermissions()` - Check permissions

---

## Design System & Styling

### Summary Statistics

| Metric | Count | Status |
|--------|-------|--------|
| Files analyzed | 167 | - |
| Files with Tailwind | 167 | ✅ Consistent |
| Files with inline styles | 7 | ⚠️ Needs cleanup |
| Files with hardcoded colors | 5 | ⚠️ Needs tokens |
| Files with inconsistencies | 11 | 🔴 Fix required |

### Hardcoded Colors Found

**🔴 Issue: Design Token Violations**

```typescript
// Found hardcoded hex colors:
#dcfce7  // Green (1 usage)
#fef3c7  // Yellow (1 usage)
#fecaca  // Red (1 usage)
#16a34a  // Green accent (1 usage)
#d97706  // Orange (1 usage)
#dc2626  // Red accent (1 usage)
#1e3a8a  // Blue (1 usage)
#000000  // Black (1 usage)
#2f2f2f  // Dark gray (1 usage)
rgba(0,0,0,0.2) // Shadow (1 usage)
```

### Design Token System

**✅ Create Centralized Design Tokens**

```typescript
// src/config/design-tokens.ts (create new)
export const colors = {
  // Primary palette
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a',
  },
  
  // Semantic colors
  success: {
    light: '#dcfce7',
    DEFAULT: '#16a34a',
    dark: '#15803d',
  },
  
  warning: {
    light: '#fef3c7',
    DEFAULT: '#d97706',
    dark: '#b45309',
  },
  
  error: {
    light: '#fecaca',
    DEFAULT: '#dc2626',
    dark: '#b91c1c',
  },
  
  // Neutral
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827',
  },
} as const;

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
} as const;

export const typography = {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  DEFAULT: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
```

**Configure in Tailwind:**

```javascript
// tailwind.config.ts
import { colors, spacing, typography, shadows, borderRadius } from './src/config/design-tokens';

export default {
  theme: {
    extend: {
      colors,
      spacing,
      ...typography,
      boxShadow: shadows,
      borderRadius,
    },
  },
};
```

### Files with Mixed Styling (needs cleanup)

**7 files with inline styles:**
1. Review each inline style
2. Convert to Tailwind utility classes
3. If repeated pattern → create component

---

## Separation of Concerns

### Summary

| Metric | Count | Status |
|--------|-------|--------|
| Total violations | 12 | 🔴 |
| Files with violations | 11 | 🔴 |
| Complex calculations in render | 8 | 🔴 |
| Direct API calls in components | 3 | 🔴 |

### Violation Breakdown

#### 🔴 Type 1: Complex Calculations in Render (8 files)

**Files affected:**
1. `BookingForm/SelectedSlotsDisplay.tsx`
2. `RecurringBookingModal/index.tsx`
3. `StepByStepBooking/index.tsx`
4. `CalendarView.tsx`
5. `Checkout.tsx`
6. `BookingsPage.tsx`
7. `UserReceipts.tsx`
8. `useRecurringSlots.ts` (hook - acceptable)

**❌ Bad Pattern:**
```typescript
// Component renders with complex calculations
const MyComponent = () => {
  return (
    <div>
      {items
        .filter(item => item.status === 'active')
        .map(item => item.price)
        .reduce((sum, price) => sum + price, 0)
        .toFixed(2)}
    </div>
  );
};
```

**✅ Good Pattern:**
```typescript
// Extract to useMemo or custom hook
const MyComponent = () => {
  const totalPrice = useMemo(() => {
    return items
      .filter(item => item.status === 'active')
      .map(item => item.price)
      .reduce((sum, price) => sum + price, 0)
      .toFixed(2);
  }, [items]);
  
  return <div>{totalPrice}</div>;
};

// Or better - custom hook
const useTotalPrice = (items: Item[]) => {
  return useMemo(() => {
    return items
      .filter(item => item.status === 'active')
      .map(item => item.price)
      .reduce((sum, price) => sum + price, 0)
      .toFixed(2);
  }, [items]);
};
```

#### 🔴 Type 2: Direct API Calls in Components (3 files)

**Files affected:**
1. `FacilityEditForm.tsx`
2. `FacilityEditPage.tsx`
3. `Bookings.tsx`

**❌ Bad Pattern:**
```typescript
// Component
const MyComponent = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // ❌ Direct API call in component
    supabase
      .from('bookings')
      .select('*')
      .then(res => setData(res.data));
  }, []);
  
  return <div>{/* render */}</div>;
};
```

**✅ Good Pattern:**
```typescript
// hooks/useBookings.ts
export const useBookings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const result = await bookingsService.getAll();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  return { data, loading, error };
};

// Component
const MyComponent = () => {
  const { data, loading, error } = useBookings();
  
  if (loading) return <Spinner />;
  if (error) return <Error />;
  
  return <div>{/* render data */}</div>;
};
```

#### 🔴 Type 3: Too Many Responsibilities (1 file)

**File:** `FacilityEditForm.tsx`

**Responsibilities found:**
- State management
- Side effects
- Data fetching
- Validation

**✅ Refactoring Strategy:**

```typescript
// Split into:
// 1. hooks/useFacilityForm.ts - form state & validation
// 2. hooks/useFacilityData.ts - data fetching
// 3. components/FacilityEditForm.tsx - UI only

// hooks/useFacilityForm.ts
export const useFacilityForm = (initialData) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    // validation logic
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  return { formData, errors, validate, handleChange };
};

// hooks/useFacilityData.ts
export const useFacilityData = (id) => {
  // data fetching logic
  return { facility, loading, error, refetch };
};

// Component (UI only)
const FacilityEditForm = () => {
  const { facility, loading } = useFacilityData(id);
  const { formData, errors, validate, handleChange } = useFacilityForm(facility);
  
  // Only UI logic here
  return (/* JSX */);
};
```

---

## Component Connectivity

### Summary

| Metric | Value |
|--------|-------|
| Components analyzed | 219 |
| Avg props per component | 5.2 |
| Avg dependencies per component | 8.4 |
| Max dependencies in one file | 22 |

### Most Connected Components (Top 10)

| Component | Dependencies | Props | State | Concern |
|-----------|--------------|-------|-------|---------|
| `StepByStepBooking/index.tsx` | 22 | 15 | 6 | 🔴 Over-connected |
| `FacilityCalendar/index.tsx` | 22 | 11 | 4 | 🔴 Over-connected |
| `Checkout.tsx` | 19 | 0 | 12 | 🟡 High complexity |
| `AdminFacilityCard.tsx` | 11 | 4 | 10 | 🟡 High state count |

### Data Flow Patterns

**Context Usage:**
- 15% of components use `useContext`
- Most common: `AuthContext`, `LanguageContext`, `UserProfileContext`

**Store Usage (Zustand):**
- 12% of components use Zustand stores
- Most used: `useFacilityStore`, `useCartStore`, `useMessageStore`

**Prop Drilling:**
- Components with >10 props: 8 files
- Recommendation: Use composition or context

### Recommendations

1. **Split Large Components**
   - `StepByStepBooking` → Extract steps as separate components
   - `FacilityCalendar` → Extract calendar logic to hooks

2. **Reduce Prop Count**
   - Use prop spreading for related props
   - Group related props into objects
   - Consider using composition

3. **Optimize Data Flow**
   - Use context for deeply nested props
   - Memoize expensive computations
   - Implement proper re-render optimization

---

## Animations & Transitions

### Summary

| Metric | Count |
|--------|-------|
| Files with animations | 103 |
| Files with CSS transitions | 103 |
| Files with Framer Motion | 0 |
| Files with custom animations | 0 |

### Common Transitions Used

| Transition Class | Usage Count | Purpose |
|-----------------|-------------|---------|
| `transition-all` | 45 | General transitions |
| `transition-colors` | 28 | Color changes |
| `transition-opacity` | 15 | Fade effects |
| `transition-transform` | 12 | Movement/scale |
| `duration-200` | 38 | Standard timing |
| `duration-300` | 22 | Slower transitions |

### Animation Patterns

**✅ Good: Consistent Use of Tailwind Transitions**
```typescript
// Most components use Tailwind utilities
className="transition-colors duration-200 hover:bg-blue-600"
```

**⚠️ Opportunity: No Advanced Animations**
- No Framer Motion usage
- No custom `@keyframes`
- Limited to CSS transitions

### Recommendations

1. **Standardize Transition Durations**
```typescript
// Create standard durations
const TRANSITION_DURATIONS = {
  fast: 150,    // Quick interactions
  normal: 200,  // Standard (current default)
  slow: 300,    // Emphasis
  slower: 500,  // Page transitions
} as const;
```

2. **Add Animation Utilities**
```typescript
// components/common/animated/FadeIn.tsx
export const FadeIn = ({ children, delay = 0 }) => {
  return (
    <div className={`animate-fadeIn ${delay && `animation-delay-${delay}`}`}>
      {children}
    </div>
  );
};
```

3. **Consider Framer Motion for Complex Animations**
```typescript
// For modals, page transitions, complex gestures
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

---

## Performance Analysis

### Critical Issues 🔴

#### Issue 1: Inline Arrow Functions (63 files)

**Impact:** Creates new function instances on every render, breaking memoization

**❌ Bad:**
```typescript
<Button onClick={() => handleClick(id)}>Click</Button>
```

**✅ Good:**
```typescript
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id, handleClick]);

<Button onClick={handleButtonClick}>Click</Button>
```

#### Issue 2: Missing Key Props (6 files)

**Impact:** React can't efficiently update lists

**❌ Bad:**
```typescript
{items.map(item => (
  <div>{item.name}</div>  // Missing key!
))}
```

**✅ Good:**
```typescript
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

### Memoization Usage

| Pattern | Files | Status |
|---------|-------|--------|
| `useMemo` | 25 | ✅ Good |
| `useCallback` | 18 | ⚠️ Should be more |
| `React.memo` | 0 | 🔴 Not used |

### Loading States

**Positive:** 16 files have loading states
- Using: `isLoading`, `loading`, `isPending` flags
- Using: Skeleton components, Spinners

**Missing:**
- Lazy loading for code splitting (0 files!)
- Virtual scrolling for long lists (0 files)
- Image lazy loading

### Data Fetching

**Current State:**
- No React Query usage found
- No SWR usage found
- No caching layer

**Recommendation:**
```bash
npm install @tanstack/react-query
```

```typescript
// Setup React Query
// src/lib/queryClient.ts already exists!
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Use in components
const { data, isLoading, error } = useQuery({
  queryKey: ['bookings', userId],
  queryFn: () => bookingsService.getByUser(userId),
});
```

### Optimization Checklist

- [ ] **Add `React.memo` to pure components**
  - Wrap components that receive same props frequently
  - Especially list items, cards

- [ ] **Implement `useCallback` consistently**
  - All event handlers passed as props
  - Functions used in dependencies

- [ ] **Add lazy loading**
  ```typescript
  const AdminRoutes = lazy(() => import('@/pages/AdminRoutes'));
  const UserRoutes = lazy(() => import('@/pages/UserRoutes'));
  ```

- [ ] **Virtual scrolling for long lists**
  ```bash
  npm install react-window
  ```

- [ ] **Image optimization**
  - Use responsive images
  - Implement lazy loading
  - Consider using `next/image` patterns

- [ ] **Code splitting**
  - Split routes
  - Split heavy components
  - Load features on demand

---

## Refactoring Roadmap

### Phase 1: Quick Wins (Week 1)

**Goal:** Fix critical issues with low effort

- [ ] **Fix inline arrow functions** (63 files)
  - Add `useCallback` wrapping
  - Estimated: 2-3 hours

- [ ] **Add missing key props** (6 files)
  - Add proper keys to all `.map()` iterations
  - Estimated: 30 minutes

- [ ] **Standardize role constants** (60 files)
  - Replace string literals with `ROLES` constants
  - Estimated: 1 hour

- [ ] **Remove hardcoded colors** (5 files)
  - Replace with Tailwind utilities or design tokens
  - Estimated: 1 hour

### Phase 2: Design System (Week 2)

**Goal:** Establish consistent design language

- [ ] **Create design tokens** (`design-tokens.ts`)
  - Colors, spacing, typography, shadows, etc.
  - Estimated: 4 hours

- [ ] **Configure Tailwind** with design tokens
  - Update `tailwind.config.ts`
  - Estimated: 1 hour

- [ ] **Remove inline styles** (7 files)
  - Convert to Tailwind classes
  - Estimated: 2 hours

- [ ] **Create reusable animated components**
  - FadeIn, SlideIn, etc.
  - Estimated: 3 hours

### Phase 3: Separation of Concerns (Week 3)

**Goal:** Clean architecture

- [ ] **Extract business logic to hooks** (11 files)
  - Move complex calculations out of render
  - Create custom hooks for data fetching
  - Estimated: 12 hours

- [ ] **Refactor large components**
  - Split `BookingsPage` (1715 LOC)
  - Split `Checkout` (1306 LOC)
  - Split `FacilityEditPage` (1288 LOC)
  - Estimated: 16 hours

- [ ] **Remove direct API calls** (3 files)
  - Move to service layer or hooks
  - Estimated: 4 hours

### Phase 4: Performance (Week 4)

**Goal:** Optimize rendering and loading

- [ ] **Implement React Query**
  - Set up QueryClient
  - Migrate data fetching hooks
  - Add caching strategy
  - Estimated: 8 hours

- [ ] **Add memoization**
  - `React.memo` for pure components
  - `useMemo` for expensive calculations
  - Estimated: 6 hours

- [ ] **Implement lazy loading**
  - Code splitting for routes
  - Lazy load heavy components
  - Estimated: 4 hours

- [ ] **Add loading states**
  - Skeleton components
  - Progressive loading
  - Estimated: 6 hours

### Phase 5: Auth & Permissions (Week 5)

**Goal:** Robust access control

- [ ] **Expand permission system**
  - Define all permissions in `permissions.ts`
  - Map roles to permissions
  - Estimated: 4 hours

- [ ] **Refactor auth guards**
  - Replace inline auth checks
  - Use `<PermissionGuard>` consistently
  - Estimated: 8 hours

- [ ] **Add permission-based UI**
  - Hide/show features based on permissions
  - Disable actions without permission
  - Estimated: 6 hours

### Phase 6: Localization (Weeks 6-7)

**Goal:** Complete i18n implementation

- [ ] See `LOCALIZATION_PROGRESS.md` for detailed plan
- Estimated: 40+ hours

### Phase 7: Testing & Documentation (Week 8)

**Goal:** Quality assurance

- [ ] **Unit tests** for refactored components
- [ ] **Integration tests** for workflows
- [ ] **Update documentation**
- [ ] **Performance audit**

---

## Metrics & KPIs

### Before Refactoring

| Metric | Current |
|--------|---------|
| Avg component LOC | 285 |
| Files with >300 LOC | 41 |
| Files with violations | 11 |
| Performance issues | 68 |
| Type safety issues | 31 |
| Localization coverage | 31% |

### After Refactoring (Target)

| Metric | Target | Improvement |
|--------|--------|-------------|
| Avg component LOC | <200 | -30% |
| Files with >300 LOC | 0 | -100% |
| Files with violations | 0 | -100% |
| Performance issues | <10 | -85% |
| Type safety issues | 0 | -100% |
| Localization coverage | 100% | +220% |

---

## Tools & Resources

### Analysis Scripts

```bash
# Run full analysis
node scripts/analyze-codebase.js
node scripts/analyze-architecture.js

# View reports
cat analysis-output/component-inventory.json
cat analysis-output/auth-rbac-analysis.json
cat analysis-output/styling-analysis.json
cat analysis-output/separation-of-concerns.json
cat analysis-output/performance-analysis.json
```

### Recommended Tools

**Development:**
- ESLint with stricter rules
- Prettier for formatting
- Husky for pre-commit hooks

**Performance:**
- React DevTools Profiler
- Lighthouse
- Bundle analyzer

**Testing:**
- Vitest (already installed)
- React Testing Library
- Playwright (already installed)

---

**Status**: 📋 Documentation Complete - Ready for Implementation  
**Next Step**: Review with team and prioritize phases  
**Estimated Total Effort**: 8-10 weeks with 1 full-time developer

