# Comprehensive Component Refactoring Plan

**Date**: October 27, 2025
**Goal**: Migrate all components to i18n, apply SOLID principles, reorganize structure
**Priority**: Keep UI/UX unchanged ✅

---

## Phase 1: Header Components (High Priority)

### Components to Refactor:
1. ✅ `src/components/GlobalHeader.tsx` - Main public header
2. ✅ `src/components/admin/layout/AdminHeader.tsx` - Admin header (partially done)
3. `src/components/admin/header/SearchField.tsx` - Search component
4. `src/components/admin/header/NotificationBell.tsx` - Notifications
5. ✅ `src/components/admin/header/ProfileDropdown.tsx` - Profile menu (done)
6. ✅ `src/components/header/ProfileMenu.tsx` - Public profile menu (done)
7. `src/components/header/LanguageToggle.tsx` - Language switcher
8. `src/components/header/Logo.tsx` - Logo component
9. `src/components/header/GlobalSearch.tsx` - Global search
10. `src/components/user/header/UserHeader.tsx` - User header

**Actions**:
- Add i18n for placeholders, tooltips, aria-labels
- Extract reusable header logic into hooks
- Apply Single Responsibility Principle
- Ensure accessibility attributes are translated

---

## Phase 2: Card Components (High Priority)

### Components to Refactor:
1. `src/components/facility/FacilityCard.tsx` - Main facility card
2. `src/components/bookings/BookingCard.tsx` - Booking display card
3. `src/components/group/GroupManagementCard.tsx` - Group booking card
4. `src/components/admin/dashboard/TodaysBookings.tsx` - Dashboard cards
5. `src/components/user/dashboard/UpcomingBookingsCard.tsx` - User bookings
6. `src/components/user/dashboard/QuickActionsCard.tsx` - Quick actions
7. `src/components/user/dashboard/FacilityRecommendations.tsx` - Recommendations

**Actions**:
- Migrate all hardcoded text to i18n
- Extract card data formatting logic
- Create reusable card components
- Apply Open/Closed Principle (extend without modifying)

---

## Phase 3: Sidebar Components (High Priority)

### Components to Refactor:
1. ✅ `src/components/admin/layout/AdminSidebar.tsx` - Admin navigation (done)
2. ✅ `src/components/user/layout/UserSidebar.tsx` - User navigation (done)
3. `src/components/admin/layout/AdminLayout.tsx` - Admin layout wrapper
4. `src/components/user/layout/UserLayout.tsx` - User layout wrapper

**Actions**:
- All navigation labels translated ✅
- Extract navigation configuration
- Create reusable sidebar components
- Apply Dependency Inversion Principle

---

## Phase 4: Form Components (Medium Priority)

### Components to Refactor:
1. `src/components/booking/BookingForm.tsx` - Main booking form
2. `src/components/booking/StepByStepBooking.tsx` - Multi-step form
3. `src/components/admin/facilities/FacilityEditForm.tsx` - Facility editor
4. `src/components/support/SupportTicketForm.tsx` - Support form
5. `src/components/auth/LoginForm.tsx` - Login forms
6. `src/components/user/profile/ProfileEditForm.tsx` - Profile editor

**Actions**:
- Translate all labels, placeholders, error messages
- Extract form validation logic
- Create reusable form field components
- Apply Single Responsibility Principle

---

## Phase 5: Modal & Dialog Components (Medium Priority)

### Components to Refactor:
1. `src/components/booking/RecurringBookingModal.tsx` - Recurring bookings
2. `src/components/group/GroupInvitationModal.tsx` - Group invites
3. `src/components/facility/FacilityImageModal.tsx` - Image viewer
4. `src/components/admin/DeleteConfirmationModal.tsx` - Delete confirmations
5. `src/components/user/DeleteAccountModal.tsx` - Account deletion

**Actions**:
- Translate modal titles, descriptions, buttons
- Extract modal management logic into hooks
- Create reusable modal wrapper
- Consistent modal patterns across app

---

## Phase 6: Calendar Components (Complex)

### Components to Refactor:
1. `src/components/calendar/EnhancedCalendar.tsx` - Main calendar (1000+ lines)
2. `src/components/calendar/FacilityCalendar.tsx` - Facility-specific
3. `src/components/calendar/SimpleCalendar.tsx` - Simple view
4. `src/components/calendar/CalendarGrid.tsx` - Grid layout
5. `src/components/calendar/TimeSlotGrid.tsx` - Time slots
6. `src/components/calendar/EventTooltip.tsx` - Event details
7. `src/components/calendar/CalendarFilters.tsx` - Filter controls

**Actions**:
- **SPLIT LARGE COMPONENTS**: Break EnhancedCalendar into smaller pieces
- Translate date formats, day names, event labels
- Extract calendar state management
- Apply SOLID principles to calendar logic
- Create calendar hooks: `useCalendarState`, `useEventHandling`

---

## Phase 7: Search & Filter Components (Medium Priority)

### Components to Refactor:
1. `src/components/search/FacilitySearch.tsx` - Facility search
2. ✅ `src/components/search/ViewModeToggle.tsx` - View switcher (done)
3. `src/components/search/SearchFilters.tsx` - Filter panel
4. `src/components/search/SearchResults.tsx` - Results display
5. `src/components/bookings/BookingFiltersBar.tsx` - Booking filters

**Actions**:
- Translate search placeholders, filter labels
- Extract search/filter logic into hooks
- Create reusable filter components
- Apply Interface Segregation Principle

---

## Phase 8: Dashboard Components (Medium Priority)

### Components to Refactor:
1. `src/components/admin/dashboard/StatsCard.tsx` - KPI cards
2. `src/components/admin/dashboard/BookingChart.tsx` - Charts
3. `src/components/admin/dashboard/RevenueChart.tsx` - Revenue
4. `src/components/admin/dashboard/TodaysBookings.tsx` - Today's list
5. `src/components/user/dashboard/HeroSection.tsx` - User hero (done)
6. `src/components/user/dashboard/ActivityFeed.tsx` - Activity feed

**Actions**:
- Translate chart labels, axis titles, tooltips
- Extract chart configuration
- Create reusable dashboard components
- Format numbers/currency with i18n utilities

---

## Phase 9: Facility Detail Components (Complex)

### Components to Refactor:
1. ✅ `src/components/facility/FacilityHeader.tsx` - Header (done)
2. ✅ `src/components/facility/detail/FacilityDetailStates.tsx` - States (done)
3. ✅ `src/components/facility/detail/FacilityContactInfo.tsx` - Contact (done)
4. `src/components/facility/detail/FacilityAmenities.tsx` - Amenities list
5. `src/components/facility/detail/FacilityReviews.tsx` - Reviews
6. `src/components/facility/detail/FacilityPricing.tsx` - Pricing info
7. `src/components/facility/gallery/ImageGallery.tsx` - Image gallery

**Actions**:
- Translate amenity names, review text templates
- Extract facility data formatting
- Create reusable detail components
- Apply Single Responsibility Principle

---

## Phase 10: Messaging & Support (Low Priority)

### Components to Refactor:
1. `src/components/messaging/MessageInbox.tsx` - Message list
2. `src/components/messaging/MessageThread.tsx` - Thread view
3. `src/components/messaging/MessageComposer.tsx` - Composer
4. `src/components/support/SupportTicketList.tsx` - Ticket list
5. `src/components/support/TicketDetails.tsx` - Ticket details

**Actions**:
- Translate message templates, status labels
- Extract messaging logic into service layer
- Apply Dependency Inversion Principle
- Create messaging hooks

---

## Folder Restructuring Plan

### Current Structure Issues:
- Mixed concerns in root `components/`
- Inconsistent naming conventions
- Large files without proper separation

### Proposed New Structure:

```
src/components/
├── common/              # Shared/reusable components
│   ├── cards/
│   │   ├── BaseCard.tsx
│   │   ├── StatCard.tsx
│   │   └── ActionCard.tsx
│   ├── forms/
│   │   ├── FormField.tsx
│   │   ├── FormActions.tsx
│   │   └── ValidationMessage.tsx
│   ├── modals/
│   │   ├── BaseModal.tsx
│   │   ├── ConfirmationModal.tsx
│   │   └── FormModal.tsx
│   └── navigation/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── Breadcrumbs.tsx
│
├── features/            # Feature-based organization
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── bookings/
│   │   ├── components/
│   │   │   ├── BookingCard/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── BookingCard.tsx
│   │   │   │   ├── BookingCardHeader.tsx
│   │   │   │   └── BookingCardActions.tsx
│   │   │   └── BookingForm/
│   │   ├── hooks/
│   │   │   ├── useBookingForm.ts
│   │   │   └── useBookingValidation.ts
│   │   └── types.ts
│   ├── facilities/
│   │   ├── components/
│   │   │   ├── FacilityCard/
│   │   │   ├── FacilityDetail/
│   │   │   └── FacilitySearch/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── calendar/
│   │   ├── components/
│   │   │   ├── CalendarGrid/
│   │   │   ├── EventCard/
│   │   │   └── TimeSlotPicker/
│   │   ├── hooks/
│   │   │   ├── useCalendarState.ts
│   │   │   ├── useEventHandling.ts
│   │   │   └── useTimeSlotSelection.ts
│   │   └── utils/
│   │       ├── dateHelpers.ts
│   │       └── eventUtils.ts
│   └── dashboard/
│       ├── admin/
│       └── user/
│
├── layouts/             # Layout components
│   ├── AdminLayout/
│   │   ├── index.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminFooter.tsx
│   ├── UserLayout/
│   └── PublicLayout/
│
└── ui/                  # shadcn/ui components (keep as is)
    └── ...
```

---

## SOLID Principles Application

### 1. Single Responsibility Principle (SRP)
**Current Issues**:
- `EnhancedCalendar.tsx` (1000+ lines) - does too much
- Components mixing UI and business logic

**Solution**:
```typescript
// BEFORE: One large component
EnhancedCalendar.tsx (1000+ lines)

// AFTER: Separated concerns
CalendarContainer.tsx       // Main wrapper
CalendarHeader.tsx          // Header with navigation
CalendarGrid.tsx            // Grid layout only
CalendarEventCard.tsx       // Event display
useCalendarState.ts         // State management
useEventHandling.ts         // Event logic
dateUtils.ts                // Date utilities
```

### 2. Open/Closed Principle (OCP)
**Example - Card Components**:
```typescript
// Base card that's open for extension
interface BaseCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const BaseCard = ({ title, children, actions }: BaseCardProps) => (
  <Card>
    <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
    <CardContent>{children}</CardContent>
    {actions && <CardFooter>{actions}</CardFooter>}
  </Card>
);

// Extended cards
export const BookingCard = (props) => (
  <BaseCard title={props.title} actions={<BookingActions />}>
    <BookingDetails booking={props.booking} />
  </BaseCard>
);
```

### 3. Liskov Substitution Principle (LSP)
**Example - Form Components**:
```typescript
// Base form field interface
interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
}

// All form fields follow same interface
const TextField = (props: FormFieldProps & { type: 'text' }) => ...
const EmailField = (props: FormFieldProps & { type: 'email' }) => ...
const DateField = (props: FormFieldProps & { type: 'date' }) => ...
```

### 4. Interface Segregation Principle (ISP)
**Example - Search Components**:
```typescript
// Split large interfaces into smaller ones
interface SearchableComponent {
  onSearch: (query: string) => void;
}

interface FilterableComponent {
  onFilter: (filters: Filters) => void;
}

interface SortableComponent {
  onSort: (field: string, order: 'asc' | 'desc') => void;
}

// Components implement only what they need
const SearchBar: React.FC<SearchableComponent> = ...
const FilterPanel: React.FC<FilterableComponent> = ...
const ResultsList: React.FC<SearchableComponent & SortableComponent> = ...
```

### 5. Dependency Inversion Principle (DIP)
**Example - Service Layer**:
```typescript
// Abstract interface
interface BookingService {
  getBookings(): Promise<Booking[]>;
  createBooking(data: BookingData): Promise<Booking>;
  updateBooking(id: string, data: BookingData): Promise<Booking>;
}

// Component depends on interface, not implementation
const BookingList = ({ service }: { service: BookingService }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    service.getBookings().then(setBookings);
  }, [service]);

  return ...
};
```

---

## Component Size Guidelines

### Target Sizes:
- **Small Components**: < 100 lines (most components)
- **Medium Components**: 100-300 lines (feature components)
- **Large Components**: 300-500 lines (complex features)
- **⚠️ Refactor Required**: > 500 lines

### Current Components > 500 Lines:
1. `calendar/EnhancedCalendar.tsx` (~1000 lines) → Split into 5-7 components
2. `booking/StepByStepBooking.tsx` (~800 lines) → Split into step components
3. `admin/facilities/FacilityEditForm.tsx` (~600 lines) → Extract form sections
4. `user/profile/UserProfile.tsx` (~700 lines) → Split into tabs

---

## Translation Namespace Organization

### Recommended Namespace Usage:

| Component Type | Primary Namespace | Secondary Namespace |
|---------------|-------------------|---------------------|
| Headers | `navigation` | `common` |
| Cards | `common` | feature-specific (`bookings`, `facilities`) |
| Forms | `common` + feature | `validation` |
| Modals | `common` | feature-specific |
| Dashboard | `admin` or `user` | `common` |
| Calendar | `bookings` | `common` |
| Search | feature-specific | `common` |

---

## Testing Strategy

### For Each Refactored Component:

1. **Visual Testing**:
   - Compare before/after screenshots
   - Test in both languages (NO/EN)
   - Verify responsive behavior
   - Check accessibility (aria-labels, keyboard nav)

2. **Functional Testing**:
   - All buttons/actions work
   - Forms submit correctly
   - Data displays properly
   - No console errors

3. **Performance Testing**:
   - Component render time
   - Bundle size impact
   - Translation loading time

---

## Implementation Phases

### Week 1: High Priority (Headers, Cards, Sidebars)
- Day 1-2: Header components
- Day 3-4: Card components
- Day 5: Sidebar components (already done ✅)

### Week 2: Medium Priority (Forms, Modals, Search)
- Day 1-2: Form components
- Day 3: Modal components
- Day 4-5: Search & filter components

### Week 3: Complex Components (Calendar, Dashboard)
- Day 1-3: Calendar refactoring (large task)
- Day 4-5: Dashboard components

### Week 4: Remaining Components & Polish
- Day 1-2: Facility details
- Day 3: Messaging/Support
- Day 4-5: Testing, bug fixes, documentation

---

## Success Criteria

✅ **All hardcoded Norwegian text migrated to i18n**
✅ **No components > 500 lines**
✅ **SOLID principles applied consistently**
✅ **Folder structure reorganized logically**
✅ **UI/UX unchanged (pixel-perfect)**
✅ **All tests passing**
✅ **TypeScript strict mode compliant**
✅ **Accessibility maintained/improved**
✅ **Performance maintained/improved**
✅ **Documentation updated**

---

**Next Steps**: Start with Phase 1 - Header Components

---

**Document Version**: 1.0
**Last Updated**: October 27, 2025
**Status**: 📋 Planning Complete - Ready for Implementation
