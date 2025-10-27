# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookMe is a comprehensive facility reservation and booking platform built with React 19, TypeScript, and Tailwind CSS. It features both user-facing booking functionality and administrative facility management, with support for recurring bookings, group reservations, and real-time availability tracking.

Primary language is **Norwegian (NO)** with English (EN) as secondary. All UI text must be internationalized.

## Development Commands

### Core Development
```bash
# Start Vite development server (port 3000)
npm run dev

# Build for production
npm run build

# Run linting and type checking
npm run lint

# Preview production build locally
npm run preview

# Clean build artifacts
npm run clean
```

### Development Best Practices
- **Hot Module Replacement (HMR)** is enabled - most changes reflect instantly without restart
- Only restart dev server when modifying configuration files (vite.config.ts, tsconfig.json, tailwind.config.ts)
- Use `npm run dev -- --force` to force rebuild dependencies without full restart
- Stop only the dev server on port 3000: `npx kill-port 3000`
- Avoid `pkill -f "vite"` as it kills all Vite processes system-wide

## High-Level Architecture

### State Management Strategy

This codebase uses a **hybrid state management approach**:

**Zustand Stores** (for complex, persistent state):
- All stores use `persist` middleware with localStorage
- All stores include DevTools integration for debugging
- Located in `src/stores/`
- Key stores:
  - `facilityStore` - Facility data with CRUD operations, publish/draft/archive status
  - `cartStore` - Shopping cart for booking items with pricing calculations
  - `slotSelectionStore` - Time slot selection with conflict checking
  - `recurringBookingStore` - Recurring booking patterns and occurrences
  - `groupStore` - Group bookings with members, invitations, and access control
  - `messageStore` - Messaging threads and notifications
  - `favoritesStore` - User favorites with usage tracking
  - `supportStore` - Support ticket management

**React Contexts** (for simple, global state):
- `LanguageContext` - i18n language selection (NO/EN)
- `AdminAuthContext` - Admin authentication with role-based access control
- `UserProfileContext` - User profile data with dual-phase loading
- `CartContext` - Wraps cartStore and adds validation/logging layer (hybrid pattern)

**Decision Rule**: Use Zustand for complex state with frequent updates; use Context for simple toggles and authentication state.

### Persistence Architecture

**Automatic Persistence (Zustand)**:
- All Zustand stores auto-persist to localStorage via `persist` middleware
- Storage keys: `cart-store`, `facility-store`, `favorites-store`, etc.
- Includes versioning for future migrations (currently version: 1)

**Manual Persistence (Contexts)**:
- `LanguageContext` → `bookme-language`
- `AdminAuthContext` → `adminUser`
- `UserProfileContext` → `user-profile` (uses dual-phase loading to prevent race conditions)

**Dual-Phase Loading Pattern** (UserProfileContext):
```typescript
// Phase 1: Load from localStorage on mount
useEffect(() => {
  const saved = localStorage.getItem('user-profile');
  if (saved) setProfile(JSON.parse(saved));
  setIsLoadedFromStorage(true);
}, []);

// Phase 2: Only save after initial load complete
useEffect(() => {
  if (isLoadedFromStorage) {
    localStorage.setItem('user-profile', JSON.stringify(profile));
  }
}, [profile, isLoadedFromStorage]);
```

This prevents race conditions and localStorage corruption on first render.

### Internationalization (i18n)

**Structure**:
```
src/i18n/
├── hooks/useTranslation.ts    # Main translation hook
├── translations/
│   ├── common.ts              # Shared UI text (actions, status, navigation)
│   ├── facility.ts            # Facility-specific translations
│   └── booking.ts             # Booking process translations
└── types.ts                   # Type definitions
```

**Usage Pattern**:
```typescript
import { useTranslation } from '@/i18n';

const { t, language } = useTranslation();

// Dot notation for nested keys
t('actions.save')  // Returns: "Lagre" (NO) or "Save" (EN)

// With parameters
t('booking.duration', { days: 3 })  // Replaces {{days}} with 3

// With fallback
t('missing.key', {}, 'Default text')
```

**Fallback Chain**: NO → EN → fallback parameter → key itself

**All new features must include translations** in both NO and EN.

### Component Organization

```
src/components/
├── ui/                   # shadcn/ui primitives (Button, Card, Input, Dialog, etc.)
├── facility/             # Facility display and management (14 components)
│   ├── FacilityCard, FacilityListItem, FacilityHeader
│   ├── FacilityDetailLayout, AirBnbStyleGallery
│   └── FacilityEditForm (admin)
├── booking/              # Booking flow (12 components)
│   ├── BookingForm, StepByStepBooking
│   ├── SelectedSlotsDisplay, PriceCalculation
│   ├── RecurrencePatternSelector, RecurringBookingModal
│   └── BookingActionButtons
├── calendar/             # Calendar and scheduling (15 components)
│   ├── EnhancedCalendar, FacilityCalendar, SimpleCalendar
│   ├── TimeSlotGrid, CalendarFilters
│   └── useDragSelection (hook)
├── admin/                # Admin-specific features
│   ├── Dashboard components (KPICard, TrendCard, Quick Actions)
│   ├── FacilityEditForm, FieldConfigModal
│   └── AdminLayout, AdminGuard
├── user/                 # User-specific features
│   └── UserLayout, Dashboard components
├── map/                  # Mapbox integration (MapContainer, MapMarkers, FacilityMiniMap)
├── search/               # GlobalSearch, SearchFilter, ViewHeader
├── group/                # GroupBookingFlow, GroupInvitationModal, GroupManagementCard
├── messaging/            # MessageInbox, MessageThread, MessageComposer
├── support/              # SupportTicketForm, TicketList, TicketDetail
└── accessibility/        # ScreenReaderOnly and a11y utilities
```

**UI Component Library**: Uses **shadcn/ui** built on Radix UI primitives with Tailwind CSS styling.

### Page Structure

**User Routes** (`src/pages/user/`):
- Dashboard, Facilities, Bookings, Calendar, History
- Favorites, Profile, Messages, Notifications
- Receipts, Help

**Admin Routes** (`src/pages/admin/`):
- Overview (dashboard with KPIs)
- Facilities (management with inline editing)
- Bookings, Approvals, Users/Roles
- Settings, Notifications, Integrations
- Reports, Audit Logs, Data Retention

**Layout Strategy**:
- `UserLayout` and `AdminLayout` provide consistent navigation
- Both use `SidebarContext` for collapsible sidebar state
- Admin routes use lazy loading with Suspense

### Key Architectural Patterns

**1. Store-Context Hybrid** (CartContext):
- CartContext wraps cartStore without duplicating state
- Adds validation and pricing calculation layer
- Delegates to Zustand store for state management
- Single source of truth maintained

**2. Dual-Phase Loading** (UserProfileContext):
- Prevents race conditions on localStorage reads/writes
- Two-phase: Load first, then enable auto-save
- Uses `isLoadedFromStorage` flag as gate

**3. Versioned Persistence** (Zustand stores):
- All stores include `version: 1` for future migrations
- Prepared for schema evolution and breaking changes

**4. Selective Persistence** (facilityStore):
- Uses `partialize` to exclude non-serializable data
- Only persists data, not methods/functions

## TypeScript & Code Standards

### Strict Requirements
- **TypeScript strict mode** enabled with `noImplicitReturns` and `noFallthroughCasesInSwitch`
- **Explicit return types** required: All components must return `: JSX.Element`
- **Readonly interfaces** for all props and state types
- **No `any` types** - use proper type inference or explicit types
- **Functional components only** - no class components
- **Named exports preferred** over default exports

### Component Pattern
```typescript
interface ComponentNameProps {
  readonly title: string;
  readonly description?: string;
  readonly onAction?: () => void;
}

export const ComponentName = ({
  title,
  description,
  onAction
}: ComponentNameProps): JSX.Element => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {description && <p className="text-gray-600 dark:text-gray-400">{description}</p>}
    </div>
  );
};
```

### Styling Standards
- **Tailwind CSS only** - no inline styles or CSS modules
- **Professional sizing**: Minimum h-12 for buttons, h-14 for inputs
- **Modern borders**: rounded-lg, rounded-xl, rounded-2xl
- **Shadows**: shadow-md, shadow-lg, shadow-xl (no smaller)
- **Spacing**: gap-4, gap-6, gap-8, space-y-4, space-y-6
- **Dark mode required**: All components must support dark: prefix classes
- **Mobile-first approach**: Use responsive breakpoints (md:, lg:)

### Accessibility Requirements
- **WCAG 2.1 AA compliance** required for all components
- All interactive elements need `aria-label` or `aria-labelledby`
- Proper semantic HTML (button, nav, main, aside, etc.)
- Keyboard navigation support with visible focus indicators
- Form controls must have associated labels with `htmlFor`

## Booking Flow Architecture

**Step-by-step booking process**:
1. **Facility Selection** → Browse grid/list/map views
2. **Time Slot Selection** → EnhancedCalendar or TimeSlotGrid
3. **Booking Details** → BookingForm with:
   - Booking type (one-time or recurring)
   - Actor type (private-person, lag-foreninger, paraply, private-firma, kommunale-enheter)
   - Activity type (sport, culture, meeting, event, etc.)
   - Purpose and attendees count
4. **Price Calculation** → Automatic with VAT (25%)
5. **Cart/Submission** → Add to cart or direct checkout

**Recurring Bookings**:
- Defined by `RecurrencePattern` in `src/utils/recurrenceEngine.ts`
- Supports weekly, monthly, custom patterns
- Generates individual occurrences with status tracking
- Managed via `recurringBookingStore`

**Group Bookings**:
- Managed via `groupStore`
- Supports members, invitations, and shared bookings
- Cost splitting between members
- Role-based access (owner, admin, member)

## Map Integration (Mapbox)

**Key Components**:
- `MapContainer` - Initializes Mapbox with token validation
- `MapMarkers` - Places facility pins on interactive map
- `FacilityMiniMap` - Small embedded static maps on facility cards

**Configuration**:
- Token managed via environment variable
- Centered on Drammen region coordinates
- Error states for invalid tokens or network issues
- Geocoding integration for address → coordinates conversion

## Testing and Validation Checklist

When adding new features, verify:
- [ ] TypeScript strict mode passes with no errors
- [ ] All components have readonly props interfaces
- [ ] Explicit `: JSX.Element` return type on components
- [ ] Translations added for both NO and EN
- [ ] Dark mode styling implemented and tested
- [ ] Responsive design works on mobile (test at 375px width)
- [ ] Keyboard navigation functional
- [ ] ARIA labels present on interactive elements
- [ ] localStorage persistence working (if applicable)
- [ ] Build completes without errors: `npm run build`
- [ ] Lint passes: `npm run lint`

## Common Patterns and Utilities

### Custom Hooks (`src/hooks/`)
- `useSlotSelection` - Time slot selection logic with conflict checking
- `useCalendarEnhancements` - Enhanced calendar state
- `useFacility` - Facility data fetching
- `useAvailabilityStatus` - Check facility availability
- `useDragSelection` - Calendar drag-to-select
- `useOfflineStatus` - Offline mode detection

### Utility Functions (`src/utils/`)
- `recurrenceEngine.ts` - Recurring booking pattern generation
- `offlineStorage.ts` - Offline action queue management
- `cn()` from `lib/utils.ts` - Tailwind class merging utility

### Data Access Layer (`src/dal/`)
- Abstraction layer for future backend integration
- Currently wraps mock data from `src/data/`

## Path Aliases

TypeScript path mapping configured:
```typescript
"@/*" resolves to "src/*"
```

Example:
```typescript
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import { facilityStore } from '@/stores/facilityStore';
```

## Important Implementation Notes

### Race Condition Prevention
When working with localStorage and React state:
1. Load from localStorage in initial useEffect
2. Set a flag when loading is complete
3. Only write to localStorage after flag is true
4. See `UserProfileContext` for reference implementation

### Store Creation Pattern
All Zustand stores should follow this middleware stack:
```typescript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface StoreState {
  // state properties with readonly
  readonly items: readonly Item[];
  // action methods
  readonly addItem: (item: Item) => void;
}

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        addItem: (item) => set((state) => ({
          items: [...state.items, item]
        }))
      }),
      {
        name: 'store-name',  // localStorage key
        version: 1            // for future migrations
      }
    ),
    { name: 'store-name' }
  )
);
```

### Mapbox Token Management
Mapbox token should be configured via environment variable:
```bash
VITE_MAPBOX_TOKEN=your_token_here
```

Access in code:
```typescript
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
```

## Known Limitations and Future Considerations

- **No backend integration**: Currently using localStorage and mock data
- **No authentication**: Mock auth in AdminAuthContext
- **Message store growth**: No pagination or archival logic
- **localStorage cleanup**: No automatic pruning of old data
- **Offline sync**: useOfflineStatus exists but not fully integrated
- **Security**: localStorage data not encrypted (includes auth tokens)

## Dependencies of Note

- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.9.3** - Strict mode enabled
- **Tailwind CSS 3.4.0** - Utility-first styling
- **Radix UI** - Headless UI primitives via shadcn/ui
- **Zustand 5.0.8** - State management with middleware
- **React Router DOM 7.9.3** - Client-side routing
- **Mapbox GL JS 3.15.0** - Interactive maps
- **date-fns 2.30.0** - Date manipulation (no moment.js)
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications

## File Naming Conventions

- **Components**: PascalCase (e.g., `FacilityCard.tsx`)
- **Utilities**: camelCase (e.g., `recurrenceEngine.ts`)
- **Stores**: camelCase with "Store" suffix (e.g., `facilityStore.ts`)
- **Types**: PascalCase (e.g., `Booking.ts`, `Facility.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `useSlotSelection.ts`)

## Docker & Supabase Local Development

This project has a companion Docker-based Supabase setup for local backend development located at:
`/Volumes/Development/Xala Products/bookme`

### Local Supabase Stack

The Docker Compose setup includes a full Supabase stack:

**Services**:
- **studio** (port 54323) - Supabase Studio dashboard for database/auth/storage management
- **kong** (port 54321) - API gateway routing requests
- **auth** - GoTrue authentication service
- **rest** - PostgREST for RESTful database API
- **realtime** - PostgreSQL change notifications
- **storage** - File storage service
- **imgproxy** - Image transformation
- **meta** - PostgreSQL metadata service
- **functions** - Edge Functions runtime
- **analytics** - Logflare analytics (port 4000)
- **db** (port 54322) - PostgreSQL with Supabase extensions
- **mailpit** (ports 8025, 1025) - Email testing service

### Quick Start with Docker

```bash
# Navigate to Docker project
cd "/Volumes/Development/Xala Products/bookme"

# Start all Supabase services
./scripts/start-dev.sh
# Or manually: docker-compose up -d

# Apply database migrations
./scripts/apply-migrations.sh

# Access services:
# - Supabase Studio: http://localhost:54323
# - Supabase API: http://localhost:54321
# - Mailpit: http://localhost:8025

# Stop services
./scripts/stop-dev.sh
# Or manually: docker-compose down

# Reset database and reapply migrations
./scripts/reset-db.sh
```

### Database Migrations

Located in `supabase/migrations/` (ordered execution):

1. `20230101000000_enable_extensions.sql` - PostgreSQL extensions (PostGIS, pg_trgm, etc.)
2. `20230101000001_core_schema.sql` - Core tables (facilities, bookings, users, etc.)
3. `20230101000002_add_geospatial_column.sql` - Geospatial support
4. `20230101000003_security_setup.sql` - Security helpers and functions
5. `20230101000004_rls_policies.sql` - Row Level Security policies
6. `20230101000005_indexes_triggers.sql` - Performance indexes and triggers
7. `20230101000006_rpc_functions.sql` - RPC functions for booking logic
8. `20230101000007_storage_policies.sql` - File storage policies
9. `20230101000008_seed_data.sql` - Minimal seed data

### Environment Variables (Docker Setup)

Key variables in `.env`:
```bash
POSTGRES_PASSWORD=postgres
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=<anonymous-jwt-token>
SERVICE_ROLE_KEY=<service-role-jwt-token>
SITE_URL=http://localhost:3000
API_EXTERNAL_URL=http://localhost:54321
```

### Connecting Frontend to Local Supabase

When developing locally, point the frontend to the local Supabase instance:

```typescript
// In your frontend .env or configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon-key-from-docker-env>
```

### Database Schema Management

When making schema changes:
1. Create a new migration file in `supabase/migrations/`
2. Apply migrations: `./scripts/apply-migrations.sh`
3. Test changes in Supabase Studio: http://localhost:54323
4. Commit migration files to version control

### Troubleshooting Docker Setup

- **Port conflicts**: Modify ports in `docker-compose.yml` and `.env`
- **Service logs**: `docker-compose logs [service-name]`
- **Remove all data**: `docker-compose down -v`
- **Restart specific service**: `docker-compose restart [service-name]`

## Project Comparison: Three BookMe Variants

There are three BookMe projects in the Xala ecosystem:

### 1. **bookme** (Current - Vite/React)
- **Location**: `~/Documents/xaheen/bookme`
- **Stack**: React 19 + Vite + TypeScript + Tailwind CSS
- **State**: Zustand + React Context with localStorage persistence
- **Features**: Full client-side booking, recurring bookings, group bookings, map integration
- **Primary Language**: Norwegian (NO) with English (EN)
- **No backend**: Currently uses mock data and localStorage

### 2. **book-me** (Next.js SaaS)
- **Location**: `~/Documents/xaheen/book-me`
- **Stack**: Next.js 15 + React 19 + TypeScript + Tailwind v4 + Flowbite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Features**: Multi-tenant SaaS, RBAC, dynamic pricing, real-time availability
- **Architecture**: Separation of concerns (presentational vs container components)
- **Testing**: Jest + React Testing Library

### 3. **bookme** (Docker/Supabase)
- **Location**: `/Volumes/Development/Xala Products/bookme`
- **Purpose**: Local Supabase backend for development
- **Stack**: Docker Compose with full Supabase stack
- **Features**: Database migrations, RPC functions, RLS policies, storage setup
- **Usage**: Backend infrastructure for either frontend variant

**Integration Pattern**: The Vite/React frontend (this project) can be connected to the Docker Supabase backend by updating environment variables to point to `http://localhost:54321`.

**See `INTEGRATION_GUIDE.md` for complete step-by-step instructions on connecting the frontend to Supabase.**

## VS Code Configuration

Recommended extensions for this project:
- TypeScript and JavaScript Language Features (built-in)
- Tailwind CSS IntelliSense
- ESLint
- Prettier (if configured)
- Docker (for managing Supabase containers)

Path aliases are configured in both `tsconfig.json` and `vite.config.ts` for proper IDE support.
