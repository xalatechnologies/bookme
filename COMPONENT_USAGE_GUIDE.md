# BookMe Component Usage Guide

Complete guide for using the reusable booking components in your pages.

---

## Table of Contents

1. [BookingCard](#bookingcard)
2. [RecurringBookingGroup](#recurringbookinggroup)
3. [BookingDetailsPanel](#bookingdetailspanel)
4. [BookingFiltersBar](#bookingfiltersbar)
5. [Complete Example](#complete-example)

---

## BookingCard

**Location:** `src/components/bookings/BookingCard.tsx`

Displays a single booking with all relevant information, selection checkbox, and action buttons.

### Props

```typescript
interface BookingCardProps {
  readonly booking: BookingWithDetails;        // The booking to display
  readonly selected?: boolean;                 // Whether card is selected
  readonly onSelect?: (bookingId: string) => void;     // Selection handler
  readonly onViewDetails?: (booking: BookingWithDetails) => void;  // View details handler
  readonly onDelete?: (bookingId: string) => void;     // Delete handler
  readonly showCheckbox?: boolean;             // Show selection checkbox (default: true)
}
```

### Basic Usage

```tsx
import { BookingCard } from '@/components/bookings';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';

function MyBookingsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

  const handleSelect = (bookingId: string) => {
    setSelectedIds(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleViewDetails = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleDelete = (bookingId: string) => {
    // Your delete logic
  };

  return (
    <div className="space-y-4">
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          selected={selectedIds.includes(booking.id)}
          onSelect={handleSelect}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          showCheckbox
        />
      ))}
    </div>
  );
}
```

### Features

- ✅ Status-colored left border
- ✅ Status badge with proper colors
- ✅ Formatted date, time, duration
- ✅ Facility name and zone
- ✅ Price in NOK
- ✅ Selection checkbox
- ✅ View and delete buttons
- ✅ Click anywhere to view details
- ✅ Hover effect for better UX
- ✅ Fully accessible with ARIA labels

### Styling

The component uses Tailwind CSS and adapts to the booking status:

| Status | Border Color | Badge Color |
|--------|-------------|-------------|
| paid | Green | Green |
| completed | Blue | Blue |
| pending | Yellow | Yellow |
| awaiting_payment | Orange | Orange |
| cancelled | Red | Red |
| expired | Gray | Gray |
| refunded | Purple | Purple |

---

## RecurringBookingGroup

**Location:** `src/components/bookings/RecurringBookingGroup.tsx`

Displays a group of recurring bookings with summary information and frequency badge.

### Props

```typescript
interface RecurringBookingGroupProps {
  readonly group: RecurringBookingGroup;       // The recurring group
  readonly onViewDetails?: (groupId: string) => void;  // View group details handler
}

// RecurringBookingGroup type from hooks
interface RecurringBookingGroup {
  readonly recurringId: string;
  readonly bookings: BookingWithDetails[];
  readonly facilityName: string;
  readonly zoneName: string | null;
  readonly frequency: 'weekly' | 'biweekly' | 'monthly' | 'unknown';
  readonly nextBooking: BookingWithDetails | null;
  readonly totalBookings: number;
  readonly upcomingCount: number;
  readonly completedCount: number;
}
```

### Basic Usage

```tsx
import { RecurringBookingGroup } from '@/components/bookings';
import { useRecurringBookingGroups } from '@/hooks/bookings';

function MyBookingsPage() {
  const { data: bookings } = useUserBookings(userId);
  const recurringGroups = useRecurringBookingGroups(bookings);

  const handleViewGroup = (groupId: string) => {
    // Navigate to group details or show modal
    console.log('View recurring group:', groupId);
  };

  return (
    <div className="space-y-4">
      {recurringGroups.map(group => (
        <RecurringBookingGroup
          key={group.recurringId}
          group={group}
          onViewDetails={handleViewGroup}
        />
      ))}
    </div>
  );
}
```

### Features

- ✅ Purple left border to distinguish from regular bookings
- ✅ Repeat icon indicator
- ✅ Frequency badge (Ukentlig, Annenhver uke, Månedlig)
- ✅ Summary stats (total, upcoming, completed)
- ✅ Next booking date and time
- ✅ Zone name display
- ✅ View details button
- ✅ Click anywhere to expand

### Frequency Detection

The hook automatically detects frequency based on intervals:

| Interval | Detected Frequency |
|----------|-------------------|
| 6-8 days | Weekly |
| 13-15 days | Biweekly |
| 28-32 days | Monthly |
| Other | Unknown |

---

## BookingDetailsPanel

**Location:** `src/components/bookings/BookingDetailsPanel.tsx`

Modal panel that displays comprehensive booking details with conditional action buttons.

### Props

```typescript
interface BookingDetailsPanelProps {
  readonly booking: BookingWithDetails;        // The booking to display
  readonly onClose: () => void;                // Close modal handler
  readonly onEdit?: (booking: BookingWithDetails) => void;         // Edit handler (optional)
  readonly onCancel?: (booking: BookingWithDetails) => void;       // Cancel handler (optional)
  readonly onShare?: (booking: BookingWithDetails) => void;        // Share handler (optional)
  readonly onAddToCalendar?: (booking: BookingWithDetails) => void; // Calendar handler (optional)
}
```

### Basic Usage

```tsx
import { BookingDetailsPanel } from '@/components/bookings';
import { useCancelBooking } from '@/services/supabase/bookings.service';

function MyBookingsPage() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const cancelMutation = useCancelBooking();

  const handleCancel = async (booking: BookingWithDetails) => {
    try {
      await cancelMutation.mutateAsync(booking.id);
      toast.success('Booking avlyst');
      setShowDetails(false);
    } catch (error) {
      toast.error('Kunne ikke avlyse booking');
    }
  };

  const handleShare = (booking: BookingWithDetails) => {
    const shareText = `Booking: ${booking.facility?.name}`;
    navigator.clipboard.writeText(shareText);
    toast.success('Kopiert til utklippstavle');
  };

  const handleAddToCalendar = (booking: BookingWithDetails) => {
    // Create ICS file
    // See BookingsNew.tsx for full implementation
  };

  return (
    <>
      {/* Your booking list */}

      {showDetails && selectedBooking && (
        <BookingDetailsPanel
          booking={selectedBooking}
          onClose={() => setShowDetails(false)}
          onCancel={handleCancel}
          onShare={handleShare}
          onAddToCalendar={handleAddToCalendar}
        />
      )}
    </>
  );
}
```

### Features

- ✅ Full-screen modal overlay
- ✅ Detailed booking information
- ✅ Formatted date (with weekday)
- ✅ Time range display
- ✅ Duration calculation
- ✅ Price formatting in NOK
- ✅ Status badge
- ✅ Booking ID display
- ✅ Notes section (if present)
- ✅ Conditional actions based on status
- ✅ Accessible modal (ESC to close, click outside)

### Conditional Actions

Actions are shown based on booking status:

| Status | Available Actions |
|--------|------------------|
| pending | Edit, Cancel |
| awaiting_payment | Edit, Cancel |
| paid | Cancel, Share, Add to Calendar |
| completed | Share, Add to Calendar |
| cancelled | (none) |
| expired | (none) |
| refunded | (none) |

---

## BookingFiltersBar

**Location:** `src/components/bookings/BookingFiltersBar.tsx`

Comprehensive filter bar with search, date range, facility selection, and sorting.

### Props

```typescript
interface BookingFiltersBarProps {
  readonly filters: BookingFilters;            // Current filter state
  readonly facilities?: readonly string[];     // List of facilities for filter
  readonly onSearchChange: (search: string | undefined) => void;
  readonly onDateRangeChange: (range: BookingFilters['dateRange']) => void;
  readonly onFacilityChange: (facilityId: string | undefined) => void;
  readonly onSortChange: (sortBy: BookingFilters['sortBy']) => void;
  readonly onClearFilters: () => void;
  readonly onOpenCalendar?: () => void;        // Optional calendar button
}

// BookingFilters type from hooks
interface BookingFilters {
  status?: BookingStatus | 'all';
  facilityId?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'past' | 'upcoming';
  search?: string;
  sortBy?: 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'created';
}
```

### Basic Usage

```tsx
import { BookingFiltersBar } from '@/components/bookings';
import { useBookingListPage } from '@/hooks/bookings';

function MyBookingsPage() {
  const {
    filters,
    setSearchQuery,
    setDateRangeFilter,
    setFacilityFilter,
    setSortBy,
    resetFilters,
    filteredBookings,
  } = useBookingListPage();

  // Extract unique facilities
  const facilities = React.useMemo(() => {
    const facilitySet = new Set<string>();
    filteredBookings.forEach(booking => {
      if (booking.facility?.name) {
        facilitySet.add(booking.facility.name);
      }
    });
    return Array.from(facilitySet).sort();
  }, [filteredBookings]);

  return (
    <BookingFiltersBar
      filters={filters}
      facilities={facilities}
      onSearchChange={setSearchQuery}
      onDateRangeChange={setDateRangeFilter}
      onFacilityChange={setFacilityFilter}
      onSortChange={setSortBy}
      onClearFilters={resetFilters}
      onOpenCalendar={() => navigate('/calendar')}
    />
  );
}
```

### Features

- ✅ Search input with icon
- ✅ Date range dropdown
- ✅ Facility filter dropdown
- ✅ Sort options dropdown
- ✅ Clear filters button
- ✅ Calendar button (optional)
- ✅ Active filters indicator
- ✅ Quick reset link
- ✅ Responsive layout
- ✅ Accessible with ARIA labels

### Filter Options

**Date Range:**
- All
- Today
- This Week
- This Month
- Upcoming
- Past

**Sort Options:**
- Date (upcoming first)
- Date (oldest first)
- Price (low to high)
- Price (high to low)
- Created

### Active Filters Indicator

When filters are active, a summary bar appears showing:
- Which filters are active
- Quick "Reset all" link
- Border separator for visual clarity

---

## Complete Example

Here's a complete example using all components together with the custom hooks:

```tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useBookingListPage } from "@/hooks/bookings";
import { useCancelBooking } from "@/services/supabase/bookings.service";
import {
  BookingCard,
  BookingDetailsPanel,
  BookingFiltersBar,
  RecurringBookingGroup,
} from "@/components/bookings";
import type { BookingWithDetails } from "@/services/supabase/bookings.service";

export default function MyBookingsPage(): JSX.Element {
  const navigate = useNavigate();
  const cancelMutation = useCancelBooking();

  // Use the main hook for all booking logic
  const {
    filteredBookings,
    stats,
    recurringGroups,
    standaloneBookings,
    hasRecurringBookings,
    isLoading,
    filters,
    setStatusFilter,
    setSearchQuery,
    setDateRangeFilter,
    setFacilityFilter,
    setSortBy,
    resetFilters,
    refetch,
  } = useBookingListPage();

  // Local UI state
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

  // Get unique facilities for filter
  const facilities = useMemo(() => {
    const facilitySet = new Set<string>();
    filteredBookings.forEach(booking => {
      if (booking.facility?.name) {
        facilitySet.add(booking.facility.name);
      }
    });
    return Array.from(facilitySet).sort();
  }, [filteredBookings]);

  // Handlers
  const handleSelect = useCallback((bookingId: string) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b.id));
    }
  }, [selectedBookings.length, filteredBookings]);

  const handleViewDetails = useCallback((booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  }, []);

  const handleCancelBooking = useCallback(async (booking: BookingWithDetails) => {
    try {
      await cancelMutation.mutateAsync(booking.id);
      toast.success("Booking avlyst");
      setShowDetails(false);
      refetch();
    } catch (error) {
      toast.error("Kunne ikke avlyse booking");
    }
  }, [cancelMutation, refetch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mine Bookinger</h1>
        <Button onClick={() => navigate('/facilities')}>
          <Plus className="w-4 h-4 mr-2" />
          Ny booking
        </Button>
      </header>

      {/* Status Badges */}
      <div className="flex gap-2">
        <button onClick={() => setStatusFilter('all')}>
          Alle <Badge>{stats.total}</Badge>
        </button>
        <button onClick={() => setStatusFilter('paid')}>
          Bekreftet <Badge>{stats.paid}</Badge>
        </button>
        {/* More status buttons... */}
      </div>

      {/* Filters */}
      <BookingFiltersBar
        filters={filters}
        facilities={facilities}
        onSearchChange={setSearchQuery}
        onDateRangeChange={setDateRangeFilter}
        onFacilityChange={setFacilityFilter}
        onSortChange={setSortBy}
        onClearFilters={resetFilters}
        onOpenCalendar={() => navigate('/calendar')}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedBookings.length === filteredBookings.length}
            onCheckedChange={handleSelectAll}
          />
          <span>Velg alle ({filteredBookings.length})</span>
        </div>
        <span>Viser {filteredBookings.length} av {stats.total}</span>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Recurring Groups */}
        {hasRecurringBookings && recurringGroups.map(group => (
          <RecurringBookingGroup
            key={group.recurringId}
            group={group}
            onViewDetails={(id) => console.log('View group:', id)}
          />
        ))}

        {/* Standalone Bookings */}
        {standaloneBookings.map(booking => (
          <BookingCard
            key={booking.id}
            booking={booking}
            selected={selectedBookings.includes(booking.id)}
            onSelect={handleSelect}
            onViewDetails={handleViewDetails}
            onDelete={(id) => handleCancelBooking(booking)}
            showCheckbox
          />
        ))}
      </div>

      {/* Details Panel */}
      {showDetails && selectedBooking && (
        <BookingDetailsPanel
          booking={selectedBooking}
          onClose={() => setShowDetails(false)}
          onCancel={handleCancelBooking}
          onShare={(booking) => {
            navigator.clipboard.writeText(`Booking: ${booking.facility?.name}`);
            toast.success('Kopiert!');
          }}
          onAddToCalendar={(booking) => {
            // ICS file generation
            toast.success('Lagt til i kalender!');
          }}
        />
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Always Use the Custom Hook

✅ **Good:**
```tsx
const { filteredBookings, stats, filters } = useBookingListPage();
```

❌ **Bad:**
```tsx
const { data: bookings } = useUserBookings(userId);
const [filters, setFilters] = useState({});
// Manual filtering logic...
```

### 2. Memoize Expensive Calculations

✅ **Good:**
```tsx
const facilities = useMemo(() => {
  return Array.from(new Set(bookings.map(b => b.facility?.name)));
}, [bookings]);
```

❌ **Bad:**
```tsx
const facilities = Array.from(new Set(bookings.map(b => b.facility?.name)));
// Recalculates on every render
```

### 3. Use Callbacks for Handlers

✅ **Good:**
```tsx
const handleSelect = useCallback((id: string) => {
  setSelected(prev => [...prev, id]);
}, []);
```

❌ **Bad:**
```tsx
const handleSelect = (id: string) => {
  setSelected(prev => [...prev, id]);
};
// New function on every render
```

### 4. Provide All Optional Handlers

✅ **Good:**
```tsx
<BookingDetailsPanel
  booking={booking}
  onClose={handleClose}
  onCancel={handleCancel}    // Provide if applicable
  onShare={handleShare}        // Provide if applicable
  onAddToCalendar={handleAdd}  // Provide if applicable
/>
```

✅ **Also Good:**
```tsx
<BookingDetailsPanel
  booking={booking}
  onClose={handleClose}
  // onCancel not provided - button won't show
/>
```

### 5. Handle Loading and Error States

✅ **Good:**
```tsx
if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage onRetry={refetch} />;
return <BookingsList />;
```

---

## TypeScript Tips

### Type Imports

Always import types from the correct locations:

```tsx
import type { BookingWithDetails } from '@/services/supabase/bookings.service';
import type { BookingFilters, RecurringBookingGroup } from '@/hooks/bookings';
import type { Database } from '@/types/database';

type BookingStatus = Database['public']['Enums']['booking_status'];
```

### Props Type Safety

Use readonly for props to prevent mutations:

```tsx
interface MyComponentProps {
  readonly booking: BookingWithDetails;  // ✅ Readonly
  readonly onClick: () => void;          // ✅ Readonly
}
```

---

## Accessibility Checklist

When using these components, ensure:

- [ ] All interactive elements have `aria-label`
- [ ] Modals can be closed with ESC key
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus is trapped in modals
- [ ] Screen readers announce changes
- [ ] Color is not the only indicator (use icons too)
- [ ] Sufficient color contrast (WCAG AA minimum)

---

## Troubleshooting

### Issue: Components not rendering

**Check:**
1. Is the import path correct?
2. Are all required props provided?
3. Is the data in the correct format?
4. Check browser console for errors

### Issue: Filters not working

**Check:**
1. Are you using `useBookingListPage` hook?
2. Are filter setters being called?
3. Check React DevTools for state updates
4. Verify filter values are correct type

### Issue: Performance problems

**Check:**
1. Are expensive calculations memoized?
2. Is React Query caching enabled?
3. Are there too many bookings rendering at once?
4. Consider pagination or virtual scrolling

---

## Support

For issues or questions:
1. Check this guide first
2. Review the component source code
3. Check React DevTools for state/props
4. Consult the migration summary document

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
