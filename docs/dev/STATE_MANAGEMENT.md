# State Management Architecture

## Overview

This document defines the clear boundaries between React Context and Zustand stores in the BookMe application.

## Design Principles

1. **Context for Core User State** - User-related data that persists throughout the session
2. **Zustand for UI and Transient State** - UI toggles, temporary data, and feature-specific state
3. **Services for Data Access** - All Supabase operations go through service layer
4. **No Duplication** - Each piece of state lives in exactly one place

---

## React Context Usage

### ✅ Use Context ONLY For:

#### 1. AuthContext
**Purpose**: Authentication state and session management

**Responsibilities**:
- Current authenticated user (`User`)
- Session information (`Session`)
- User profile from database (`Profile`)
- Organization memberships (`Membership[]`)
- Current organization ID
- Auth methods: `signIn()`, `signOut()`, `signInWithPassword()`
- Profile refresh: `refreshProfile()`, `setCurrentOrg()`

**Why Context**: Auth state is fundamental to the entire app and rarely changes

#### 2. UserProfileContext
**Purpose**: User profile data and preferences

**Responsibilities**:
- User display information (firstName, lastName, email, phone)
- User avatar
- Profile update methods
- Profile refresh logic

**Why Context**: Profile data is user-scoped and accessed across many components

#### 3. LanguageContext
**Purpose**: Application language/locale settings

**Responsibilities**:
- Current language (`'NO' | 'EN'`)
- Language toggle methods
- Sync with i18n library
- Persist language preference to database

**Why Context**: Language affects entire UI and requires re-render of all components

---

## Zustand Store Usage

### ✅ Use Zustand For:

#### 1. UI State Stores
**Pattern**: `*UIStore.ts`

Examples:
- `appUIStore.ts` - Global UI state (modals, sidebars, notifications)
- `bookingUIStore.ts` - Booking-specific UI (steps, wizards, toggles)
- `calendarUIStore.ts` - Calendar view state (selected date, view mode)
- `facilityUIStore.ts` - Facility search/filter UI state
- `messageUIStore.ts` - Message UI (thread selection, compose modal)
- `supportUIStore.ts` - Support ticket UI state

**Characteristics**:
- Local to specific features
- Frequently changes
- No persistence needed (or session-only)
- Primarily controls what is shown/hidden

#### 2. Domain/Transient State Stores
**Pattern**: `*Store.ts` (without UI suffix)

Examples:
- `cartStore.ts` - Shopping cart items (booking draft)
- `favoritesStore.ts` - User's favorite facilities
- `recurringBookingStore.ts` - Recurring booking patterns
- `slotSelectionStore.ts` - Time slot selection state
- `messageStore.ts` - Message threads and drafts
- `supportStore.ts` - Support tickets and responses
- `fieldConfigStore.ts` - Dynamic form configurations
- `zoneStore.ts` - Zone selection state

**Characteristics**:
- Feature-specific domain logic
- Needs localStorage persistence
- May sync with backend
- Temporary or draft data

---

## State Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Layer                         │
│  Pages and Components consume state via hooks                │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                       Hooks Layer                            │
│  Custom hooks (useAuth, useCart, etc.)                       │
│  Encapsulate state access and business logic                │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌──────────────────────┬──────────────────────────────────────┐
│   Context Layer      │      Zustand Store Layer             │
│                      │                                       │
│  - AuthContext       │  UI Stores:                          │
│  - UserProfile       │    - appUIStore                      │
│  - LanguageContext   │    - bookingUIStore                  │
│                      │    - calendarUIStore                 │
│                      │    - etc.                            │
│                      │                                       │
│                      │  Domain Stores:                      │
│                      │    - cartStore                       │
│                      │    - favoritesStore                  │
│                      │    - recurringBookingStore           │
│                      │    - etc.                            │
└──────────────────────┴──────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Business Services Layer                    │
│  services/business/* - Business logic and orchestration     │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Services Layer                    │
│  services/supabase/* - Data access and API calls            │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Client                         │
│  Direct database access with RLS                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Current State Inventory

### React Contexts (3)
1. ✅ **AuthContext** - Auth, session, profile, memberships
2. ✅ **UserProfileContext** - User display info and avatar
3. ✅ **LanguageContext** - i18n language selection
4. ❌ **CartContext** - SHOULD BE REMOVED (duplicates cartStore)

### Zustand Stores (18)

#### UI Stores (9)
1. `appUIStore.ts` - Global modals, sidebar, notifications
2. `bookingUIStore.ts` - Booking wizard steps
3. `calendarUIStore.ts` - Calendar view configuration
4. `cartUIStore.ts` - Cart UI (drawer open/close)
5. `facilityUIStore.ts` - Facility search UI
6. `favoritesUIStore.ts` - Favorites panel UI
7. `messageUIStore.ts` - Message UI state
8. `slotSelectionUIStore.ts` - Slot picker UI
9. `supportUIStore.ts` - Support ticket UI
10. `zoneUIStore.ts` - Zone selector UI

#### Domain Stores (8)
1. `cartStore.ts` - Cart items with persistence
2. `favoritesStore.ts` - Favorite facilities with DB sync
3. `recurringBookingStore.ts` - Recurring booking patterns
4. `slotSelectionStore.ts` - Selected time slots
5. `messageStore.ts` - Messages and threads
6. `supportStore.ts` - Support tickets
7. `fieldConfigStore.ts` - Dynamic form configs
8. `zoneStore.ts` - Zone data

---

## Migration Actions Required

### 1. Remove CartContext
**Issue**: `CartContext` wraps `cartStore` and creates duplication

**Action**:
- ✅ Delete `src/contexts/CartContext.tsx`
- ✅ Update components using `useCart()` to use `useCartStore()` directly
- ✅ Remove `CartProvider` from `AppProviders.tsx`

### 2. Consolidate Favorites Management
**Issue**: Favorites logic split between `AuthContext` and `favoritesStore`

**Current**:
- `AuthContext` manages favorite loading/clearing on auth changes
- `favoritesStore` manages favorite CRUD operations

**Action**:
- ✅ Keep favorites logic in `favoritesStore` only
- ✅ `AuthContext` calls `favoritesStore.setUserId()` and `loadFavorites()`
- ✅ Clear separation of concerns

### 3. Verify No State Duplication
**Action**: Audit all stores to ensure no overlapping responsibilities

---

## Best Practices

### When to Use Context
- User/auth state that lives for entire session
- Global configuration (language, theme)
- State that triggers full app re-renders
- State that requires React's component tree propagation

### When to Use Zustand
- UI toggles and view state
- Feature-specific state
- State that needs localStorage persistence
- State that changes frequently
- State with complex update logic
- State that doesn't need component tree propagation

### When to Use Neither (Component State)
- Truly local state (single component)
- Form input values (use react-hook-form)
- Temporary UI state (hover, focus)

---

## Anti-Patterns to Avoid

❌ **Don't**: Store same data in both Context and Zustand  
✅ **Do**: Choose one source of truth

❌ **Don't**: Put all UI state in Context  
✅ **Do**: Use Zustand for UI state that doesn't need React Context

❌ **Don't**: Make direct Supabase calls from Context or Stores  
✅ **Do**: Call services layer which handles data access

❌ **Don't**: Store derived data  
✅ **Do**: Calculate derived values with selectors/getters

---

## Migration Checklist

- [ ] Remove `CartContext.tsx`
- [ ] Update all `useCart()` imports to `useCartStore()`
- [ ] Remove `CartProvider` from app
- [ ] Verify favorites only managed by `favoritesStore`
- [ ] Audit all Context providers for unnecessary state
- [ ] Audit all Zustand stores for duplicated Context state
- [ ] Document any custom state patterns in this file

---

## Questions & Decisions

### Q: Should cart state be in Context or Zustand?
**A**: Zustand. Cart is transient/draft state that needs localStorage persistence.

### Q: Should favorites be in Context or Zustand?
**A**: Zustand. Favorites are user-specific but feature-scoped with DB sync.

### Q: Should user profile be in Context or Zustand?
**A**: Context. Profile is core user state accessed globally throughout app.

### Q: How do we handle auth state in stores?
**A**: Stores can call `useAuth()` or receive `userId` as parameter. Never duplicate user/session in stores.

---

## Maintenance

This document should be updated when:
- Adding new Context providers
- Adding new Zustand stores
- Changing state management architecture
- Migrating state between layers
