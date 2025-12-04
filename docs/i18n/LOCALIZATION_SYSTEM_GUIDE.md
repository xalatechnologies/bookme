# Database-Driven Localization System

## Overview

This guide covers the comprehensive database-driven localization system for translating database values (facility types, statuses, categories, etc.) in the Booknor application.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [React Hooks](#react-hooks)
4. [Components](#components)
5. [Usage Examples](#usage-examples)
6. [Migration Guide](#migration-guide)
7. [Admin Management](#admin-management)
8. [Best Practices](#best-practices)

---

## System Architecture

### Overview

The localization system consists of three main layers:

```
┌─────────────────────────────────────────┐
│          React Components               │
│  (LocalizedSelect, LocalizedMultiSelect)│
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          React Hooks                    │
│  (useLocalizedDbValueEnhanced)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Database Layer                 │
│  (localized_db_values table)            │
│  (Helper functions & views)             │
└─────────────────────────────────────────┘
```

### Key Features

- **Multi-language support**: English (en) and Norwegian (no) by default
- **React Query caching**: 30-minute cache with background refresh
- **Search functionality**: Full-text search with relevance scoring
- **Type safety**: Full TypeScript support with generic types
- **Performance optimization**: Materialized views and indexes
- **Admin UI**: Manage translations through admin interface

---

## Database Schema

### Primary Table: `localized_db_values`

```sql
CREATE TABLE localized_db_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,        -- 'facility_type', 'booking_status', etc.
  entity_key TEXT NOT NULL,         -- 'sports_hall', 'pending', etc.
  language_code TEXT NOT NULL,      -- 'en', 'no'
  label TEXT NOT NULL,              -- Translated label
  description TEXT,                 -- Optional description
  sort_order INT,                   -- Display order
  is_active BOOLEAN DEFAULT TRUE,   -- Enable/disable values
  metadata JSONB DEFAULT '{}',      -- Additional data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_key, language_code)
);
```

### Available Entity Types

| Entity Type | Description | Example Keys |
|------------|-------------|--------------|
| `facility_type` | Types of facilities | `idrettshall`, `kulturhus`, `møterom` |
| `booking_status` | Booking statuses | `pending`, `paid`, `cancelled` |
| `booking_type` | Booking types | `regular`, `recurring`, `group` |
| `ticket_status` | Support ticket statuses | `open`, `in-progress`, `resolved` |
| `ticket_priority` | Ticket priorities | `low`, `medium`, `high`, `urgent` |
| `ticket_category` | Ticket categories | `booking`, `technical`, `billing` |
| `message_type` | Message types | `system`, `booking`, `news` |
| `duration` | Duration options | `1`, `2`, `4`, `8` (hours) |
| `payment_method` | Payment methods | `visa`, `mastercard`, `invoice` |
| `payment_status` | Payment statuses | `pending`, `succeeded`, `failed` |
| `time_slot` | Time slots | `morning`, `afternoon`, `evening` |
| `capacity_range` | Capacity ranges | `small`, `medium`, `large` |
| `location` | Locations/areas | `drammen_sentrum`, `stromsø` |
| `accessibility` | Accessibility features | `wheelchair`, `elevator`, `ramp` |
| `recurrence_pattern` | Recurrence patterns | `daily`, `weekly`, `monthly` |
| `day_of_week` | Days of week | `0`-`6` (Sunday-Saturday) |

### Helper Functions

#### `get_localized_values_by_type`
Retrieves all values for an entity type and language.

```sql
SELECT * FROM get_localized_values_by_type('facility_type', 'en');
```

#### `get_localized_db_value`
Gets a single localized value.

```sql
SELECT get_localized_db_value('booking_status', 'pending', 'no');
-- Returns: 'Ventende'
```

#### `search_localized_values`
Searches with relevance scoring.

```sql
SELECT * FROM search_localized_values('location', 'drammen', 'no', 10);
```

#### `get_available_entity_types`
Lists all entity types with statistics.

```sql
SELECT * FROM get_available_entity_types();
```

---

## React Hooks

### `useLocalizedDbValueEnhanced`

The primary hook for fetching localized values.

#### Basic Usage

```tsx
import { useLocalizedDbValueEnhanced } from '@/hooks/shared/useLocalizedDbValueEnhanced';

function MyComponent() {
  const { options, loading, getValue } = useLocalizedDbValueEnhanced('facility_type');

  return (
    <div>
      {options.map(option => (
        <div key={option.value}>{option.label}</div>
      ))}
    </div>
  );
}
```

#### With Search

```tsx
const { options, search, isSearching } = useLocalizedDbValueEnhanced('location', {
  searchEnabled: true
});

async function handleSearch(term: string) {
  const results = await search(term);
  console.log(results);
}
```

#### Return Values

```typescript
interface UseLocalizedDbValueResult {
  options: readonly LocalizedOption[];     // All options
  loading: boolean;                        // Loading state
  error: Error | null;                     // Error state
  getValue: (key: string) => string;       // Get label by key
  getOption: (key: string) => LocalizedOption | undefined;
  getOptions: () => readonly LocalizedOption[];
  refresh: () => Promise<void>;            // Refresh cache
  search: (term: string) => Promise<readonly LocalizedOption[]>;
  isSearching: boolean;                    // Search loading state
}
```

### `useLocalizedDbValueBatch`

Batch fetch multiple values efficiently.

```tsx
import { useLocalizedDbValueBatch } from '@/hooks/shared/useLocalizedDbValueEnhanced';

function StatusDisplay({ statuses }: { statuses: string[] }) {
  const labels = useLocalizedDbValueBatch('booking_status', statuses);

  return (
    <div>
      {statuses.map(status => (
        <span key={status}>{labels[status]}</span>
      ))}
    </div>
  );
}
```

### `useLocalizedDbSingleValue`

Optimized hook for fetching a single value.

```tsx
import { useLocalizedDbSingleValue } from '@/hooks/shared/useLocalizedDbValueEnhanced';

function StatusBadge({ status }: { status: string }) {
  const { label, loading } = useLocalizedDbSingleValue('booking_status', status);

  return <Badge>{loading ? '...' : label}</Badge>;
}
```

### `usePrefetchLocalizedValues`

Preload data before user interaction.

```tsx
import { usePrefetchLocalizedValues } from '@/hooks/shared/useLocalizedDbValueEnhanced';

function App() {
  // Prefetch common entity types on app load
  usePrefetchLocalizedValues([
    'facility_type',
    'booking_status',
    'location'
  ]);

  return <YourApp />;
}
```

---

## Components

### `LocalizedSelectEnhanced`

Enhanced select component with search and loading states.

#### Basic Usage

```tsx
import { LocalizedSelectEnhanced } from '@/components/common/LocalizedSelectEnhanced';

function FacilityFilter() {
  const [type, setType] = useState('');

  return (
    <LocalizedSelectEnhanced
      entityType="facility_type"
      value={type}
      onValueChange={setType}
      placeholder="Select facility type"
    />
  );
}
```

#### With Search

```tsx
<LocalizedSelectEnhanced
  entityType="location"
  value={location}
  onValueChange={setLocation}
  searchable
  placeholder="Search locations..."
/>
```

#### With "All" Option

```tsx
<LocalizedSelectEnhanced
  entityType="booking_status"
  value={status}
  onValueChange={setStatus}
  includeAll
  allValue="all"
/>
```

#### Props

```typescript
interface LocalizedSelectProps {
  entityType: LocalizedEntityType;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeAll?: boolean;          // Include "All" option
  allValue?: string;             // Value for "All" option
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  searchable?: boolean;          // Enable search functionality
}
```

### `LocalizedMultiSelect`

Multi-select component with badge display.

```tsx
import { LocalizedMultiSelect } from '@/components/common/LocalizedSelectEnhanced';

function AccessibilityFilter() {
  const [features, setFeatures] = useState<string[]>([]);

  return (
    <LocalizedMultiSelect
      entityType="accessibility"
      value={features}
      onValueChange={setFeatures}
      maxSelections={5}
      searchable
      placeholder="Select accessibility features"
    />
  );
}
```

#### Props

```typescript
interface LocalizedMultiSelectProps {
  entityType: LocalizedEntityType;
  value: readonly string[];
  onValueChange: (value: readonly string[]) => void;
  maxSelections?: number;         // Limit number of selections
  // ... same as LocalizedSelectProps
}
```

---

## Usage Examples

### Example 1: Simple Facility Type Filter

```tsx
import { LocalizedSelectEnhanced } from '@/components/common/LocalizedSelectEnhanced';

export function FacilityTypeFilter() {
  const [facilityType, setFacilityType] = useState('all');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Facility Type</label>
      <LocalizedSelectEnhanced
        entityType="facility_type"
        value={facilityType}
        onValueChange={setFacilityType}
        includeAll
        className="w-full"
      />
    </div>
  );
}
```

### Example 2: Booking Status with Badge

```tsx
import { useLocalizedDbSingleValue } from '@/hooks/shared/useLocalizedDbValueEnhanced';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export function BookingStatusBadge({ status }: StatusBadgeProps) {
  const { label, loading } = useLocalizedDbSingleValue('booking_status', status);

  const getVariant = () => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) return <Badge variant="outline">...</Badge>;

  return <Badge variant={getVariant()}>{label}</Badge>;
}
```

### Example 3: Multi-Language Day Selector

```tsx
import { LocalizedMultiSelect } from '@/components/common/LocalizedSelectEnhanced';

export function RecurrenceDaySelector() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Days</label>
      <LocalizedMultiSelect
        entityType="day_of_week"
        value={selectedDays}
        onValueChange={setSelectedDays}
        placeholder="Choose days for recurring booking"
      />
    </div>
  );
}
```

### Example 4: Dynamic Search with Results

```tsx
import { useState } from 'react';
import { useLocalizedDbValueEnhanced } from '@/hooks/shared/useLocalizedDbValueEnhanced';

export function LocationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const { search, isSearching } = useLocalizedDbValueEnhanced('location', {
    searchEnabled: true
  });
  const [results, setResults] = useState<LocalizedOption[]>([]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      const searchResults = await search(term);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search locations..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      {isSearching && <div>Searching...</div>}
      <ul className="mt-2 space-y-1">
        {results.map(result => (
          <li key={result.value} className="p-2 hover:bg-gray-100 rounded">
            {result.label}
            {result.description && (
              <span className="text-sm text-gray-500"> - {result.description}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 5: Table with Localized Status Column

```tsx
import { useLocalizedDbValueBatch } from '@/hooks/shared/useLocalizedDbValueEnhanced';

interface Booking {
  id: string;
  facilityName: string;
  status: string;
}

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const statuses = bookings.map(b => b.status);
  const statusLabels = useLocalizedDbValueBatch('booking_status', statuses);

  return (
    <table>
      <thead>
        <tr>
          <th>Facility</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map(booking => (
          <tr key={booking.id}>
            <td>{booking.facilityName}</td>
            <td>{statusLabels[booking.status]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Migration Guide

### Step 1: Identify Hardcoded Options

Run the migration scanner:

```bash
npx tsx scripts/migrate-to-localized-values.ts --scan
```

### Step 2: Add Values to Database

Create a migration file or use the admin UI:

```sql
-- supabase/migrations/20251029000002_add_custom_entity_type.sql

INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, sort_order) VALUES
  ('custom_type', 'option1', 'en', 'Option 1', 1),
  ('custom_type', 'option1', 'no', 'Alternativ 1', 1),
  ('custom_type', 'option2', 'en', 'Option 2', 2),
  ('custom_type', 'option2', 'no', 'Alternativ 2', 2);
```

### Step 3: Update Component

**Before:**
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**After:**
```tsx
<LocalizedSelectEnhanced
  entityType="custom_type"
  value={value}
  onValueChange={setValue}
  placeholder="Select option"
/>
```

### Step 4: Test

1. Test in English: Verify labels show "Option 1", "Option 2"
2. Switch to Norwegian: Verify labels show "Alternativ 1", "Alternativ 2"
3. Test search functionality if enabled

### Step 5: Generate Migration Guide

```bash
npx tsx scripts/migrate-to-localized-values.ts --guide
```

---

## Admin Management

### Viewing Entity Types

```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function EntityTypesList() {
  const { data: entityTypes } = useQuery({
    queryKey: ['entity-types'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_available_entity_types');
      return data;
    }
  });

  return (
    <div>
      {entityTypes?.map(type => (
        <div key={type.entity_type}>
          <h3>{type.entity_type}</h3>
          <p>{type.value_count} values in {type.languages.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}
```

### Adding New Values

```tsx
async function addLocalizedValue(data: {
  entity_type: string;
  entity_key: string;
  language_code: string;
  label: string;
  description?: string;
  sort_order?: number;
}) {
  const { error } = await supabase
    .from('localized_db_values')
    .insert({
      ...data,
      is_active: true,
    });

  if (error) throw error;
}
```

### Bulk Import from JSON

```bash
npx tsx scripts/migrate-to-localized-values.ts --import values.json
```

### Export to JSON

```bash
npx tsx scripts/migrate-to-localized-values.ts --export backup.json
```

---

## Best Practices

### 1. Entity Type Naming

- Use lowercase with underscores: `facility_type`, `booking_status`
- Be descriptive and consistent
- Group related types with prefixes: `ticket_status`, `ticket_priority`

### 2. Entity Key Naming

- Use lowercase with underscores or hyphens
- Keep keys consistent across languages
- Use descriptive names: `wheelchair_accessible` not `acc1`

### 3. Sort Order

- Always specify `sort_order` for consistent display
- Use increments of 10 (10, 20, 30) to allow insertions
- Set 0 for "All" options to appear first

### 4. Descriptions

- Provide descriptions for complex options
- Keep descriptions concise (one sentence)
- Translate descriptions for all languages

### 5. Metadata Usage

- Store structured data in metadata field
- Use for filtering, calculations, or additional context
- Keep metadata consistent across languages

### 6. Caching Strategy

- Use default 30-minute cache for most cases
- Increase cache time for rarely-changing values
- Use prefetch for critical data on app load

### 7. Error Handling

- Always check for errors in hooks
- Provide fallback values (entity_key as label)
- Log errors for debugging

### 8. Performance

- Use batch fetching for multiple values
- Enable search only when needed
- Utilize materialized views for heavy reads

### 9. Type Safety

- Always use `LocalizedEntityType` for entity types
- Create specific key types for critical entity types
- Use type guards for metadata validation

### 10. Testing

- Test language switching
- Verify fallback behavior
- Test with inactive values
- Test search functionality

---

## Troubleshooting

### Issue: Options not loading

**Solution:**
1. Check database connection
2. Verify entity_type exists in database
3. Check RLS policies allow read access
4. Inspect browser console for errors

### Issue: Wrong language displayed

**Solution:**
1. Check i18n language setting
2. Verify values exist for that language
3. Check language_code in database

### Issue: Search not working

**Solution:**
1. Ensure `searchEnabled: true` in hook options
2. Verify `search_localized_values` function exists
3. Check trigram extension is enabled

### Issue: Cache not refreshing

**Solution:**
```tsx
const { refresh } = useLocalizedDbValueEnhanced('entity_type');
await refresh();
```

Or clear all cache:
```tsx
import { clearLocalizedCache } from '@/hooks/shared/useLocalizedDbValueEnhanced';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
clearLocalizedCache(queryClient);
```

---

## API Reference

See [Type Definitions](../src/types/localization.ts) for complete TypeScript interfaces.

---

## Contributing

When adding new entity types:

1. Add type to `LocalizedEntityType` in `src/types/localization.ts`
2. Create migration with initial values for both languages
3. Update this documentation with examples
4. Add to entity type list in this guide

---

## Support

For issues or questions:
- Check this documentation
- Review existing migrations in `supabase/migrations/`
- Check component examples in codebase
- Consult team for custom requirements
