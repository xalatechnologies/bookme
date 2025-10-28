# Architecture Completion Checklist

**Essential Considerations for Feature Domain Refactoring**

When completing each feature domain, we must verify ALL of the following aspects:

---

## ✅ Core Architecture (Current Focus)

- [x] **Component Organization** - Feature-based structure
- [x] **Type Definitions** - Centralized types.ts
- [x] **Constants** - Centralized constants.ts
- [x] **Hooks** - Feature-specific hooks directory
- [x] **Barrel Exports** - Clean index.ts
- [x] **Documentation** - Comprehensive README.md

---

## 🌍 Localization & Translations

### Requirements for Each Domain

**Must verify:**
- [ ] All user-facing text uses `t()` function from `useTranslation`
- [ ] Translation keys follow namespace pattern: `{feature}.{component}.{key}`
- [ ] No hardcoded strings in components
- [ ] Translation files exist in `src/i18n/locales/{lang}/{feature}.json`
- [ ] Date/time formatting uses `i18n.format` utilities
- [ ] Number/currency formatting uses locale-aware functions

**Example:**
```typescript
// ❌ BAD - Hardcoded string
<h1>Booking Details</h1>

// ✅ GOOD - Translated
const { t } = useTranslation('bookings');
<h1>{t('bookings.details.title')}</h1>
```

### Translation Structure
```
src/i18n/locales/
├── en/
│   ├── bookings.json
│   ├── facilities.json
│   └── calendar.json
└── no/
    ├── bookings.json
    ├── facilities.json
    └── calendar.json
```

### Checklist per Feature:
- [ ] Create `{feature}.json` for each language (en, no)
- [ ] Export from main i18n configuration
- [ ] Test language switching
- [ ] Verify plural forms work correctly
- [ ] Check date/time localization

---

## 🔐 RBAC & Authorization

### Requirements for Each Domain

**Must verify:**
- [ ] Role-based access checks using `useAuth()` hook
- [ ] Permission gates for sensitive actions
- [ ] Proper role constants imported from auth domain
- [ ] UI elements hidden/disabled based on permissions
- [ ] API calls include proper authorization headers
- [ ] Admin-only features protected with `<RequireRole>`

**Example:**
```typescript
// Component-level protection
import { RequireRole } from '@/components/auth/RequireRole';

<RequireRole roles={['admin', 'facility_manager']}>
  <AdminBookingActions />
</RequireRole>

// Hook-based checks
const { user, hasRole } = useAuth();
const canEdit = hasRole(['admin', 'facility_manager']);

{canEdit && <EditButton />}
```

### Role Constants
```typescript
// Should be in auth domain constants
export const ROLES = {
  ADMIN: 'admin',
  FACILITY_MANAGER: 'facility_manager',
  USER: 'user',
  GUEST: 'guest'
} as const;
```

### Checklist per Feature:
- [ ] Identify admin-only components
- [ ] Add role checks to sensitive actions
- [ ] Hide UI for unauthorized users
- [ ] Document required permissions in README
- [ ] Test with different user roles

---

## 🔑 Authentication State

### Requirements for Each Domain

**Must verify:**
- [ ] Uses `useAuth()` for auth state (not prop drilling)
- [ ] Handles unauthenticated state gracefully
- [ ] Shows loading state during auth check
- [ ] Redirects to login when required
- [ ] Clears sensitive data on logout

**Example:**
```typescript
const { user, isLoading, isAuthenticated } = useAuth();

if (isLoading) return <LoadingState />;
if (!isAuthenticated) return <Navigate to="/login" />;

return <AuthenticatedContent user={user} />;
```

### Checklist per Feature:
- [ ] Remove auth props (use hook instead)
- [ ] Add loading states
- [ ] Add error states for auth failures
- [ ] Test logged-out experience
- [ ] Verify protected routes

---

## ⚡ Performance Optimization

### Requirements for Each Domain

**Must verify:**
- [ ] **Memoization** - `useMemo` for expensive calculations
- [ ] **Callbacks** - `useCallback` for event handlers passed as props
- [ ] **Code Splitting** - Lazy load heavy components
- [ ] **List Virtualization** - Use virtual scrolling for long lists
- [ ] **Image Optimization** - Lazy load images, use proper formats
- [ ] **API Caching** - Use TanStack Query for data fetching
- [ ] **Debouncing** - Debounce search/filter inputs

**Example:**
```typescript
// ✅ Memoized expensive calculation
const totalPrice = useMemo(() => 
  slots.reduce((sum, slot) => sum + slot.price, 0),
  [slots]
);

// ✅ Memoized callback
const handleDelete = useCallback((id: string) => {
  deleteBooking(id);
}, [deleteBooking]);

// ✅ Lazy loading
const BookingModal = lazy(() => import('./BookingModal'));

// ✅ TanStack Query caching
const { data: bookings } = useQuery({
  queryKey: ['bookings', userId],
  queryFn: () => bookingsService.getByUser(userId),
  staleTime: 5 * 60 * 1000 // 5 minutes
});
```

### Checklist per Feature:
- [ ] Profile render performance (React DevTools)
- [ ] Add memoization where beneficial
- [ ] Lazy load modals/heavy components
- [ ] Implement infinite scroll for lists
- [ ] Use TanStack Query for API calls
- [ ] Debounce search inputs (300ms)
- [ ] Document performance optimizations in README

---

## 🎨 Animations & Transitions

### Requirements for Each Domain

**Must verify:**
- [ ] Consistent animation patterns
- [ ] Smooth state transitions
- [ ] Loading skeletons for async content
- [ ] Hover/focus states
- [ ] Entrance/exit animations for modals
- [ ] Micro-interactions on buttons/cards

**Example:**
```typescript
// ✅ Using Tailwind transitions
<button className="transition-colors hover:bg-blue-600">

// ✅ Framer Motion for complex animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>

// ✅ Loading skeleton
{isLoading ? <BookingCardSkeleton /> : <BookingCard />}
```

### Animation Constants
```typescript
// Should be in design tokens
export const ANIMATION = {
  DURATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms'
  },
  EASING: {
    IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    OUT: 'cubic-bezier(0.0, 0, 0.2, 1)'
  }
} as const;
```

### Checklist per Feature:
- [ ] Add loading skeletons
- [ ] Animate modal open/close
- [ ] Add hover states to interactive elements
- [ ] Smooth list updates (add/remove)
- [ ] Entrance animations for page load
- [ ] Document animation patterns in README

---

## 🎨 Styling & Design Tokens

### Requirements for Each Domain

**Must verify:**
- [ ] Uses Tailwind CSS utility classes
- [ ] No inline styles (except dynamic values)
- [ ] Consistent spacing (using design tokens)
- [ ] Consistent colors (using design tokens)
- [ ] Consistent typography (using design tokens)
- [ ] Responsive design (mobile-first)
- [ ] Dark mode support (if applicable)

**Design Token Structure:**
```typescript
// Should be in a central design-tokens.ts or Tailwind config
export const DESIGN_TOKENS = {
  COLORS: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  SPACING: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  TYPOGRAPHY: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    body: 'text-base',
    caption: 'text-sm text-gray-600'
  },
  BORDERS: {
    radius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem'
    }
  },
  SHADOWS: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
} as const;
```

**Example:**
```typescript
// ❌ BAD - Inline styles
<div style={{ padding: '16px', color: '#3b82f6' }}>

// ✅ GOOD - Tailwind utilities
<div className="p-4 text-primary">

// ✅ GOOD - Using design tokens
import { DESIGN_TOKENS } from '@/config/design-tokens';
<div className={DESIGN_TOKENS.TYPOGRAPHY.h1}>
```

### Checklist per Feature:
- [ ] Remove all inline styles
- [ ] Use Tailwind utilities consistently
- [ ] Verify responsive breakpoints (sm, md, lg, xl)
- [ ] Test on mobile viewport
- [ ] Ensure proper contrast ratios (WCAG AA)
- [ ] Use consistent spacing scale
- [ ] Document component variants in README

---

## 📊 State Management

### Requirements for Each Domain

**Must verify:**
- [ ] Local state with `useState` for UI-only state
- [ ] Context for feature-scoped state
- [ ] Zustand for global app state
- [ ] TanStack Query for server state
- [ ] No prop drilling (use context/hooks)

**Example:**
```typescript
// ✅ Local UI state
const [isOpen, setIsOpen] = useState(false);

// ✅ Feature context
const { bookingState, updateBooking } = useBookingContext();

// ✅ Global store
const { cart, addToCart } = useCartStore();

// ✅ Server state
const { data, isLoading } = useQuery({
  queryKey: ['bookings'],
  queryFn: bookingsService.getAll
});
```

### Checklist per Feature:
- [ ] Identify state scope (local/feature/global/server)
- [ ] Use appropriate state management tool
- [ ] Remove unnecessary prop drilling
- [ ] Document state management in README

---

## 🧪 Testing Considerations

### Requirements for Each Domain

**Must verify:**
- [ ] Unit tests for hooks
- [ ] Component tests for key components
- [ ] Integration tests for user flows
- [ ] Accessibility tests
- [ ] Mock API calls properly

### Checklist per Feature:
- [ ] Test coverage >80% for hooks
- [ ] Test key user interactions
- [ ] Test auth/RBAC conditions
- [ ] Test loading/error states
- [ ] Test translations render correctly

---

## 📝 Documentation Requirements

### Each README.md Must Include:

- [x] **Architecture** - Folder structure
- [x] **Components** - API docs with examples
- [x] **Hooks** - Usage examples
- [x] **Types** - Type reference
- [x] **Constants** - Available constants
- [ ] **Localization** - Translation keys used
- [ ] **RBAC** - Required permissions
- [ ] **Performance** - Optimizations applied
- [ ] **Animations** - Animation patterns
- [ ] **Styling** - Component variants
- [ ] **State Management** - State flow diagram
- [ ] **Testing** - How to test this feature
- [ ] **Accessibility** - A11y considerations

---

## 🔄 Migration Strategy for Existing Features

When refactoring an existing feature domain:

### Phase 1: Infrastructure (Non-Breaking)
- [x] Create constants.ts
- [x] Create hooks/ directory
- [x] Update index.ts barrel exports
- [x] Create README.md
- [ ] **Add localization constants**
- [ ] **Add RBAC constants**
- [ ] **Add design token references**
- [ ] **Add animation constants**

### Phase 2: Component Updates (Incremental)
- [ ] Remove hardcoded strings → Add translations
- [ ] Remove inline styles → Use Tailwind + tokens
- [ ] Add role checks → Implement RBAC
- [ ] Add loading states → Improve UX
- [ ] Add animations → Enhance interactions
- [ ] Optimize performance → Add memoization
- [ ] Remove prop drilling → Use hooks

### Phase 3: Verification
- [ ] Test all user roles
- [ ] Test both languages (en, no)
- [ ] Test responsive breakpoints
- [ ] Profile performance
- [ ] Verify animations work
- [ ] Run full test suite
- [ ] Build succeeds with 0 errors

---

## 🎯 Priority Matrix

| Concern | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Localization | HIGH | MEDIUM | **CRITICAL** |
| RBAC | HIGH | MEDIUM | **CRITICAL** |
| Performance | HIGH | LOW | **HIGH** |
| Design Tokens | MEDIUM | LOW | **HIGH** |
| Animations | MEDIUM | MEDIUM | **MEDIUM** |
| Auth State | HIGH | LOW | **HIGH** |
| Documentation | HIGH | MEDIUM | **HIGH** |

---

## 📋 Per-Domain Completion Checklist

Use this for each feature domain (bookings, facilities, calendar, etc.):

```markdown
## {Feature} Domain Completion

### Core Architecture
- [x] types.ts
- [x] constants.ts
- [x] hooks/
- [x] index.ts
- [x] README.md

### Localization
- [ ] en/{feature}.json created
- [ ] no/{feature}.json created
- [ ] All strings use t()
- [ ] No hardcoded text

### RBAC & Auth
- [ ] Role checks added
- [ ] RequireRole components
- [ ] useAuth() hook used
- [ ] Permissions documented

### Performance
- [ ] useMemo added where needed
- [ ] useCallback for props
- [ ] Lazy loading implemented
- [ ] TanStack Query used

### Styling & Design
- [ ] Tailwind utilities only
- [ ] Design tokens used
- [ ] Responsive design verified
- [ ] No inline styles

### Animations
- [ ] Loading skeletons
- [ ] Modal transitions
- [ ] Hover states
- [ ] Smooth transitions

### Documentation
- [ ] Localization keys listed
- [ ] RBAC requirements listed
- [ ] Performance notes added
- [ ] Animation patterns documented

### Verification
- [ ] npm run build (0 errors)
- [ ] All languages tested
- [ ] All roles tested
- [ ] Mobile tested
- [ ] Performance profiled
```

---

## 🚀 Next: Bookings Domain Enhancement

Let's update the bookings domain to include ALL these concerns:

1. **Add localization constants** to bookings/constants.ts
2. **Add RBAC constants** to bookings/constants.ts
3. **Create bookings.json** translation files (en, no)
4. **Update README.md** with all sections
5. **Verify** everything still builds

This will be our **COMPLETE template** for all future domains.
