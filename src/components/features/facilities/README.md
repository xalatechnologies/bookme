# Facilities Feature Domain

Complete feature domain for facility management in the Booknor application.

## Overview

The facilities domain handles all functionality related to facility browsing, management, and administration:
- Facility browsing and search
- Facility details and gallery
- Map-based discovery
- Admin facility management (CRUD)
- Zone and amenity configuration

## Architecture

```
src/components/features/facilities/
├── components/              # All UI components
│   ├── FacilityCard/       # Facility display card
│   ├── FacilityDetail/     # Detail pages
│   ├── FacilityImageGallery/ # Image galleries
│   ├── FacilitySearch/     # Search & filters
│   ├── FacilityEditForm/   # Admin forms
│   └── FacilityMap/        # Map integration
├── hooks/                   # Feature-specific hooks
│   ├── useFacility.ts      # Facility data fetching
│   └── index.ts            # Hook exports
├── types.ts                 # All facility types
├── constants.ts             # Complete constants (447 lines)
├── index.ts                 # Barrel export
└── README.md                # This file
```

## Quick Start

```typescript
import {
  // Components
  FacilityCard,
  FacilityDetailLayout,
  
  // Hooks
  useFacility,
  
  // Types
  FacilityStatus,
  FacilityCategory,
  FacilityFilters,
  
  // Constants
  FACILITY_STATUS,
  FACILITY_I18N_KEYS,
  FACILITY_PERMISSIONS,
  FACILITY_DESIGN,
  FACILITY_ANIMATIONS,
  hasFacilityPermission
} from '@/components/features/facilities';
```

## Constants Overview

The [constants.ts](constants.ts) file (447 lines) includes:

### Business Logic
- `FACILITY_STATUS` - Status values
- `FACILITY_CATEGORIES` - Category types
- `DEFAULT_FACILITY_FILTERS` - Filter defaults
- `FACILITY_VALIDATION` - Form validation rules
- `MAP_CONFIG`, `GALLERY_CONFIG` - Component configs

### Localization (i18n) 🌍
- `I18N_NAMESPACE = 'facilities'`
- `FACILITY_I18N_KEYS` - All translation keys

### RBAC & Permissions 🔐
- `FACILITY_PERMISSIONS` - 14 permission types
- `hasFacilityPermission()` - Permission helper

### Design Tokens 🎨
- `FACILITY_DESIGN` - Card, typography, spacing, buttons
- Category/status color mappings

### Animations 🎬
- `FACILITY_ANIMATIONS` - Durations, transitions, variants
- Card hover effects, image loading

### Performance ⚡
- `FACILITY_PERFORMANCE` - Cache times, debounce delays
- Image optimization, map clustering

## Related Domains

- **Bookings**: Facility booking functionality
- **Calendar**: Availability calendar
- **Dashboard**: Facility statistics
