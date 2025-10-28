# Calendar Feature Domain

Complete feature domain for calendar and availability management.

## Overview

The calendar domain handles:
- Week/day/month calendar views
- Time slot selection and availability
- Booking conflict detection
- Calendar-based facility booking

## Architecture

```
src/components/features/calendar/
├── components/              # All UI components
│   ├── EnhancedCalendar/
│   ├── FacilityCalendar/
│   ├── SimpleCalendar/
│   ├── CalendarView/
│   └── EventTooltip/
├── hooks/                   # Feature hooks
│   └── index.ts            # Re-exports useCalendarState, useCalendarView, etc.
├── types.ts                 # Calendar types (116 lines)
├── constants.ts             # Complete constants (192 lines)
├── index.ts                 # Barrel export
└── README.md                # This file
```

## Quick Start

```typescript
import {
  // Components
  EnhancedCalendar,
  FacilityCalendar,
  CalendarView,
  
  // Hooks
  useCalendarState,
  useCalendarView,
  
  // Types
  TimeSlotStatus,
  ICalendarWeek,
  
  // Constants
  TIME_SLOT_STATUS,
  TIME_SLOT_COLORS,
  CALENDAR_I18N_KEYS,
  CALENDAR_PERMISSIONS,
  hasCalendarPermission
} from '@/components/features/calendar';
```

## Constants (192 lines)

- **Business Logic**: TIME_SLOT_STATUS, CALENDAR_CONFIG, VIEW_MODES
- **Localization**: I18N_NAMESPACE, CALENDAR_I18N_KEYS
- **RBAC**: CALENDAR_PERMISSIONS, hasCalendarPermission()
- **Design**: CALENDAR_DESIGN (grid, slots, typography)
- **Animations**: CALENDAR_ANIMATIONS (slot transitions)
- **Performance**: CALENDAR_PERFORMANCE (cache, debounce)
