# Bookings Feature Domain

Complete feature domain for booking management in the BookMe application.

## Overview

The bookings domain handles all functionality related to facility reservations:
- One-time and recurring bookings
- Multi-step booking wizard
- Price calculation with actor/activity-based pricing
- Booking management (view, edit, cancel)
- Booking status tracking and workflows

## Architecture

```
src/components/features/bookings/
├── components/              # All UI components
│   ├── BookingCard/        # Booking display card
│   ├── BookingForm/        # Main booking form
│   ├── StepByStepBooking/  # Multi-step wizard
│   ├── RecurringBookingModal/  # Recurring bookings
│   └── BookingFiltersBar.tsx  # Filter UI
├── hooks/                   # Feature-specific hooks
│   ├── useBookingFilters.ts   # Filter/sort logic
│   ├── useBookingSteps.ts     # Wizard state
│   ├── useBookingStats.ts     # Analytics
│   └── index.ts               # Hook exports
├── types.ts                 # All booking types
├── constants.ts             # Status mappings, defaults
├── index.ts                 # Barrel export
└── README.md                # This file
```

## Components

### BookingCard
Displays a single booking with status, date, price, and actions.

**Usage:**
```tsx
import { BookingCard } from '@/components/features/bookings';

<BookingCard
  booking={myBooking}
  onEdit={handleEdit}
  onCancel={handleCancel}
  onView={handleView}
/>
```

### BookingForm
Main booking form with time slot selection and details input.

**Usage:**
```tsx
import { BookingForm } from '@/components/features/bookings';

<BookingForm
  facilityId={facilityId}
  facilityName={facilityName}
  zoneId={zoneId}
  selectedSlots={selectedSlots}
  onSlotsChange={setSelectedSlots}
  onAddToCart={handleAddToCart}
  onCompleteBooking={handleComplete}
/>
```

### StepByStepBooking
Multi-step wizard for guided booking creation.

**Usage:**
```tsx
import { StepByStepBooking } from '@/components/features/bookings';

<StepByStepBooking
  facility={facility}
  onComplete={handleBookingComplete}
/>
```

### RecurringBookingModal
Modal for creating recurring/repeating bookings.

**Usage:**
```tsx
import { RecurringBookingModal } from '@/components/features/bookings';

<RecurringBookingModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  facility={facility}
  initialSlot={selectedSlot}
  onCreateBooking={handleCreate}
/>
```

### BookingDetailsPanel
Detailed view panel for a single booking.

**Usage:**
```tsx
import { BookingDetailsPanel } from '@/components/features/bookings';

<BookingDetailsPanel
  booking={booking}
  onClose={handleClose}
/>
```

### RecurringBookingGroup
Display and manage a group of recurring bookings.

**Usage:**
```tsx
import { RecurringBookingGroup } from '@/components/features/bookings';

<RecurringBookingGroup
  parentBooking={parentBooking}
  occurrences={occurrences}
  onManage={handleManage}
/>
```

### BookingFiltersBar
Filter bar for booking lists.

**Usage:**
```tsx
import { BookingFiltersBar } from '@/components/features/bookings';

<BookingFiltersBar
  filters={filters}
  onFilterChange={handleFilterChange}
  onClearFilters={handleClear}
/>
```

## Hooks

### useBookingFilters
Filters and sorts bookings based on criteria.

**Usage:**
```tsx
import { useBookingFilters } from '@/components/features/bookings';

const { data: bookings } = useUserBookings(userId);
const filteredBookings = useBookingFilters(bookings, {
  status: 'paid',
  dateRange: 'upcoming',
  sortBy: 'date-asc'
});
```

**Filter Options:**
- `status`: `'pending' | 'approved' | 'paid' | 'cancelled' | 'all'`
- `dateRange`: `'all' | 'today' | 'week' | 'month' | 'past' | 'upcoming'`
- `facilityId`: Filter by facility
- `search`: Search by facility name or booking ID
- `sortBy`: `'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'created'`

### useBookingSteps
Manages multi-step wizard state.

**Usage:**
```tsx
import { useBookingSteps } from '@/components/features/bookings';

const {
  currentStep,
  nextStep,
  previousStep,
  goToStep,
  isFirstStep,
  isLastStep
} = useBookingSteps(totalSteps);
```

### useBookingStats
Calculates statistics and analytics.

**Usage:**
```tsx
import { useBookingStats } from '@/components/features/bookings';

const stats = useBookingStats(bookings);
// Returns: { totalBookings, totalRevenue, upcomingBookings, etc. }
```

## Types

All booking types are centralized in `types.ts`:

```tsx
import type {
  BookingType,
  ActorType,
  ActivityType,
  IBookingFormData,
  ISelectedTimeSlot,
  IPricingCalculation
} from '@/components/features/bookings';
```

**Key Types:**
- `BookingType`: `'one-time' | 'recurring'`
- `ActorType`: Actor category for pricing (`'private-person' | 'lag-foreninger' | ...`)
- `ActivityType`: Activity category (`'sport' | 'kultur' | 'møte' | ...`)
- `IBookingFormData`: Complete booking form data
- `ISelectedTimeSlot`: Selected time slot information
- `IPricingCalculation`: Price breakdown and totals

## Constants

Common constants are in `constants.ts`:

```tsx
import {
  BOOKING_STATUS,
  BOOKING_STATUS_VARIANT,
  ACTOR_TYPES,
  ACTIVITY_TYPES,
  DEFAULT_BOOKING,
  PRICING_CONFIG,
  VALIDATION
} from '@/components/features/bookings';
```

**Available Constants:**
- `BOOKING_STATUS`: All booking status values
- `BOOKING_STATUS_VARIANT`: Status → Badge variant mapping
- `ACTOR_TYPES`: List of actor types
- `ACTIVITY_TYPES`: List of activity types
- `DEFAULT_BOOKING`: Default form values
- `TIME_SLOT_CONFIG`: Time slot configuration
- `PRICING_CONFIG`: Pricing rules (VAT, defaults)
- `VALIDATION`: Form validation rules
- `RECURRENCE_LIMITS`: Recurring booking limits
- `DISPLAY_LIMITS`: UI pagination limits

## Examples

### Create a Booking Flow

```tsx
import {
  StepByStepBooking,
  useBookingSteps,
  DEFAULT_BOOKING
} from '@/components/features/bookings';

function BookingWizard() {
  const { currentStep, nextStep, previousStep } = useBookingSteps(3);
  const [formData, setFormData] = useState(DEFAULT_BOOKING);

  return (
    <StepByStepBooking
      facility={facility}
      onComplete={handleComplete}
    />
  );
}
```

### Display Filtered Bookings

```tsx
import {
  BookingCard,
  BookingFiltersBar,
  useBookingFilters
} from '@/components/features/bookings';

function MyBookings() {
  const [filters, setFilters] = useState({});
  const { data: bookings } = useUserBookings(userId);
  const filteredBookings = useBookingFilters(bookings, filters);

  return (
    <>
      <BookingFiltersBar
        filters={filters}
        onFilterChange={setFilters}
      />
      {filteredBookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </>
  );
}
```

### Calculate Booking Price

```tsx
import {
  PRICING_CONFIG,
  type IPricingCalculation
} from '@/components/features/bookings';

function calculatePrice(slots: ISelectedTimeSlot[]): IPricingCalculation {
  const basePrice = slots.reduce((sum, slot) => 
    sum + (slot.pricePerHour * slot.duration / 60), 0
  );
  const vatAmount = basePrice * PRICING_CONFIG.VAT_RATE;
  const totalPrice = basePrice + vatAmount;

  return {
    basePrice,
    totalPrice,
    vatAmount,
    finalPrice: totalPrice,
    breakdown: [],
    requiresApproval: false
  };
}
```

## Data Flow

```
User Action → Component → Hook → Service → Supabase
                ↓
            State Update
                ↓
           UI Re-render
```

**Example:**
1. User selects time slot → `BookingForm`
2. Component calls `onSlotsChange` → Updates local state
3. User submits → `onCompleteBooking` called
4. Service layer (`bookings.service.ts`) → API call
5. Supabase creates booking → Returns data
6. Component updates → UI shows success

## Integration

### With Services
```tsx
import { bookingsService } from '@/services/supabase/bookings.service';
import { BookingForm } from '@/components/features/bookings';

async function handleCreateBooking(data: IBookingFormData) {
  const booking = await bookingsService.createBooking(data);
  // Handle success
}
```

### With State Management
```tsx
import { useCartStore } from '@/stores/cartStore';
import { BookingForm } from '@/components/features/bookings';

function AddToCart() {
  const { addToCart } = useCartStore();

  const handleAddToCart = (data: IBookingFormData) => {
    addToCart({
      // Map booking data to cart item
    });
  };

  return <BookingForm onAddToCart={handleAddToCart} />;
}
```

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { BookingCard } from '@/components/features/bookings';

describe('BookingCard', () => {
  it('renders booking information', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText(mockBooking.facility.name)).toBeInTheDocument();
  });
});
```

## Future Enhancements

- [ ] Add booking modification/rescheduling
- [ ] Implement booking conflicts detection
- [ ] Add waiting list functionality
- [ ] Support for package deals/bundles
- [ ] Multi-facility bookings
- [ ] Guest booking (no login required)

## Related Domains

- **Facilities**: Provides facility and zone data
- **Calendar**: Displays bookings in calendar view
- **Messaging**: Booking-related notifications
- **Dashboard**: Booking statistics and management

## Maintainers

This domain is maintained by the Booking Team.

For questions or issues, please see the main project README or contact the team lead.
