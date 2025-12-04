# Storage Migration Guide: localStorage → Supabase

## Overview

This guide documents the gradual migration strategy from localStorage to Supabase for the Booknor application. The migration is designed to be **zero-downtime** and **zero-data-loss**, with three distinct phases that can be controlled via environment variables.

## Architecture

### Migration Phases

The migration follows a **3-phase approach** for maximum safety:

#### Phase 1: Fallback (READ with Fallback)
**Environment**: `VITE_STORAGE_MIGRATION_PHASE=fallback`

- **Read**: Try Supabase first, fallback to localStorage if Supabase fails
- **Write**: localStorage only
- **Risk**: Zero (no data loss possible)
- **Purpose**: Test Supabase reads without committing to writes

```typescript
// Phase 1 Behavior
const bookings = await fetchBookings();
// 1. Try: supabase.from('bookings').select()
// 2. If fails: localStorage.getItem('bookings')
// 3. Return whichever succeeds
```

#### Phase 2: Dual-Write (WRITE to Both)
**Environment**: `VITE_STORAGE_MIGRATION_PHASE=dual-write`

- **Read**: Supabase with localStorage fallback
- **Write**: Both Supabase AND localStorage
- **Risk**: Very low (both layers maintained)
- **Purpose**: Ensure Supabase writes work before removing localStorage

```typescript
// Phase 2 Behavior
await addBooking(booking);
// 1. Write to localStorage (immediate)
// 2. Write to Supabase (with retry)
// 3. If Supabase fails, localStorage still has data
```

#### Phase 3: Supabase-Only (FINAL)
**Environment**: `VITE_STORAGE_MIGRATION_PHASE=supabase-only`

- **Read**: Supabase only
- **Write**: Supabase only
- **Risk**: Low (after validation in Phase 2)
- **Purpose**: Complete migration, remove localStorage dependency

```typescript
// Phase 3 Behavior
await addBooking(booking);
// 1. Write to Supabase only
// 2. No localStorage fallback
// 3. Optional: Clear old localStorage data
```

## Implementation

### Core Utilities

#### 1. Migration Configuration
Location: `/src/utils/storageMigration.ts`

```typescript
import { migrationConfig, getMigrationPhase } from '@/utils/storageMigration';

// Get current phase
const phase = getMigrationPhase(); // 'fallback' | 'dual-write' | 'supabase-only'

// Check migration health
const health = await getMigrationHealth(userId);
console.log({
  phase: health.phase,
  supabaseConnected: health.supabaseConnected,
  dataConsistent: health.dataConsistent,
  localBookingsCount: health.localBookingsCount,
  supabaseBookingsCount: health.supabaseBookingsCount,
});

// Validate data consistency
const isConsistent = await validateDataConsistency(userId);
if (!isConsistent) {
  console.warn('Data mismatch between localStorage and Supabase');
}
```

#### 2. One-Time Migration
Run this utility once at the start of Phase 1 to copy existing localStorage data to Supabase:

```typescript
import { migrateBookingsToSupabase } from '@/utils/storageMigration';

const result = await migrateBookingsToSupabase(userId);
console.log({
  success: result.success,
  migrated: result.migrated,
  errors: result.errors,
});
```

### Hooks

#### 1. useStorageMigration
Monitor and control the migration process.

```typescript
import { useStorageMigration } from '@/hooks/shared';

const {
  phase,                    // Current migration phase
  health,                   // Migration health status
  isChecking,               // Loading state
  error,                    // Error state
  checkHealth,              // Manual health check
  validateConsistency,      // Validate data sync
  migrateToSupabase,       // Trigger migration
  clearLocalStorage,       // Clear localStorage (Phase 3)
} = useStorageMigration(userId, true);

// Check health
useEffect(() => {
  if (health && !health.dataConsistent) {
    console.warn('Data inconsistency detected!');
  }
}, [health]);

// Trigger migration
const handleMigrate = async () => {
  const result = await migrateToSupabase();
  if (result.success) {
    console.log(`Migrated ${result.migrated} bookings`);
  }
};
```

#### 2. useBookings
Replace direct localStorage access with this hook.

**Before (localStorage only):**
```typescript
// OLD CODE - Direct localStorage access
const bookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');

const addBooking = (booking) => {
  const existing = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
  localStorage.setItem('pendingBookings', JSON.stringify([...existing, booking]));
};
```

**After (Migration-aware):**
```typescript
// NEW CODE - Migration-aware hook
import { useBookings } from '@/hooks/shared';

const {
  bookings,                 // All bookings
  isLoading,                // Loading state
  error,                    // Error state
  addBooking,               // Add new booking
  updateBooking,            // Update existing booking
  deleteBooking,            // Delete booking
  syncWithLocalStorage,    // Manual sync utility
  refetch,                  // Refresh bookings
} = useBookings(userId, 'pending', true);

// Add a booking (automatically handles migration phase)
const handleAddBooking = async (booking: IStoredBooking) => {
  await addBooking(booking);
};

// Update a booking
const handleApprove = async (id: string) => {
  await updateBooking(id, {
    status: 'approved',
    processedBy: adminId,
    processedAt: new Date().toISOString(),
  });
};

// Delete a booking
const handleDelete = async (id: string) => {
  await deleteBooking(id);
};
```

#### 3. useUserPreferences
Manage user preferences with automatic migration.

```typescript
import { useUserPreferences } from '@/hooks/shared';

const {
  preferences,              // User preferences object
  isLoading,                // Loading state
  error,                    // Error state
  updatePreferences,        // Update all preferences
  updateLanguage,           // Update language only
  updateFilters,            // Update filters only
  updateUISettings,         // Update UI settings only
  resetPreferences,         // Reset to defaults
  refetch,                  // Refresh preferences
} = useUserPreferences(userId, true);

// Update language
const handleLanguageChange = async (lang: 'en' | 'no') => {
  await updateLanguage(lang);
};

// Update filters
const handleFilterChange = async (filters: IBookingFilters) => {
  await updateFilters(filters);
};

// Update UI settings
const handleViewModeChange = async (mode: 'grid' | 'list') => {
  await updateUISettings({ viewMode: mode });
};
```

#### 4. useDraftBooking
Auto-save draft bookings with migration support.

```typescript
import { useDraftBooking } from '@/hooks/shared';

const {
  draft,                    // Current draft data
  isLoading,                // Loading state
  isSaving,                 // Saving indicator
  error,                    // Error state
  hasDraft,                 // Boolean: has draft
  lastSaved,                // Last save timestamp
  saveDraft,                // Save draft manually
  clearDraft,               // Clear draft
  refetch,                  // Refresh draft
} = useDraftBooking(
  userId,
  bookingId,               // Optional: for editing existing
  true,                    // Auto-save enabled
  3000                     // Auto-save delay (3 seconds)
);

// Form updates automatically trigger auto-save
const [formData, setFormData] = useState(draft || {});

useEffect(() => {
  if (Object.keys(formData).length > 0) {
    saveDraft(formData);
  }
}, [formData, saveDraft]);

// Clear draft on successful submission
const handleSubmit = async () => {
  await submitBooking(formData);
  await clearDraft();
};
```

## Migration Steps

### Step 1: Preparation
1. Ensure Supabase is configured and connected
2. Set environment variable: `VITE_STORAGE_MIGRATION_PHASE=fallback`
3. Deploy database migrations (tables: `bookings`, `user_preferences`, `draft_bookings`)

### Step 2: Phase 1 - Test Reads
1. Run one-time migration to copy localStorage → Supabase:
   ```typescript
   const result = await migrateBookingsToSupabase(userId);
   ```
2. Monitor health:
   ```typescript
   const health = await getMigrationHealth(userId);
   ```
3. Validate consistency:
   ```typescript
   const isConsistent = await validateDataConsistency(userId);
   ```
4. **Test**: Ensure Supabase reads work correctly
5. **Duration**: 1-2 weeks

### Step 3: Phase 2 - Dual Write
1. Set environment variable: `VITE_STORAGE_MIGRATION_PHASE=dual-write`
2. Deploy updated application
3. Monitor for write errors
4. Validate data consistency regularly
5. **Test**: Create, update, delete operations in both storage layers
6. **Duration**: 2-4 weeks

### Step 4: Phase 3 - Supabase Only
1. Confirm data consistency across all users
2. Set environment variable: `VITE_STORAGE_MIGRATION_PHASE=supabase-only`
3. Deploy updated application
4. Optional: Clear localStorage for all users:
   ```typescript
   await clearLocalStorageBookings(userId, true);
   ```
5. **Duration**: Permanent

## Database Schema

### Required Tables

#### bookings
```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  facility_id TEXT,
  facility_name TEXT,
  start_date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  duration NUMERIC,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  price_cents INTEGER,
  purpose TEXT,
  description TEXT,
  contact_person TEXT,
  booker_name TEXT,
  booker_email TEXT,
  submitted_at TIMESTAMPTZ,
  processed_by TEXT,
  processed_at TIMESTAMPTZ,
  is_recurring BOOLEAN DEFAULT false,
  parent_booking_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
```

#### user_preferences
```sql
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES auth.users(id),
  language TEXT CHECK (language IN ('en', 'no')) DEFAULT 'no',
  filters JSONB DEFAULT '{}',
  ui_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### draft_bookings
```sql
CREATE TABLE draft_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  booking_id TEXT,
  session_id TEXT NOT NULL,
  draft_data JSONB NOT NULL,
  last_saved TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_draft_bookings_user_id ON draft_bookings(user_id);
CREATE INDEX idx_draft_bookings_booking_id ON draft_bookings(booking_id);
CREATE INDEX idx_draft_bookings_expires_at ON draft_bookings(expires_at);

-- Auto-delete expired drafts
CREATE OR REPLACE FUNCTION delete_expired_drafts()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM draft_bookings WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_expired_drafts
AFTER INSERT OR UPDATE ON draft_bookings
EXECUTE FUNCTION delete_expired_drafts();
```

## Environment Variables

Add to `.env.local`:

```bash
# Storage Migration Configuration
VITE_STORAGE_MIGRATION_PHASE=fallback  # fallback | dual-write | supabase-only
VITE_ENABLE_MIGRATION_LOGGING=true     # Enable detailed logs
VITE_VALIDATE_STORAGE_CONSISTENCY=true # Enable consistency checks

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Error Handling

### Retry Logic
All Supabase operations include automatic retry with exponential backoff:

```typescript
// Configured in storageMigration.ts
retryAttempts: 3
retryDelayMs: 1000  // 1s, 2s, 4s
```

### Error Types

```typescript
import { MigrationError } from '@/utils/storageMigration';

try {
  await addBooking(booking);
} catch (error) {
  if (error instanceof MigrationError) {
    console.error('Migration error:', {
      phase: error.phase,
      operation: error.operation,
      originalError: error.originalError,
    });
  }
}
```

### Fallback Behavior

**Phase 1 & 2**: Automatic fallback to localStorage on Supabase failure
**Phase 3**: No fallback, errors propagate to UI

## Monitoring

### Health Dashboard Component

```typescript
import { useStorageMigration } from '@/hooks/shared';

export const MigrationHealthDashboard = () => {
  const { health, checkHealth } = useStorageMigration(userId, true);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold mb-2">Migration Health</h3>
      <div className="space-y-2 text-sm">
        <div>Phase: {health?.phase}</div>
        <div>Supabase: {health?.supabaseConnected ? '✅' : '❌'}</div>
        <div>Consistent: {health?.dataConsistent ? '✅' : '⚠️'}</div>
        <div>Local: {health?.localBookingsCount} bookings</div>
        <div>Supabase: {health?.supabaseBookingsCount} bookings</div>
      </div>
      <button onClick={checkHealth}>Refresh</button>
    </div>
  );
};
```

### Logging

Enable detailed logging:
```bash
VITE_ENABLE_MIGRATION_LOGGING=true
```

View logs in browser console:
```
[Storage Migration] Starting data consistency validation
[Storage Migration] Booking count mismatch { local: 10, supabase: 8 }
[Storage Migration Error] Failed to save draft to Supabase
```

## Testing

### Unit Tests
```typescript
import { getMigrationPhase, validateDataConsistency } from '@/utils/storageMigration';

describe('Storage Migration', () => {
  it('should return correct migration phase', () => {
    const phase = getMigrationPhase();
    expect(['fallback', 'dual-write', 'supabase-only']).toContain(phase);
  });

  it('should validate data consistency', async () => {
    const isConsistent = await validateDataConsistency('user-id');
    expect(typeof isConsistent).toBe('boolean');
  });
});
```

### Integration Tests
```typescript
import { useBookings } from '@/hooks/shared';

describe('useBookings Hook', () => {
  it('should add booking in dual-write mode', async () => {
    const { addBooking } = useBookings('user-id', 'pending', false);

    const booking = { /* ... */ };
    await addBooking(booking);

    // Verify in both storage layers
    const localBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
    expect(localBookings).toContainEqual(expect.objectContaining({ id: booking.id }));

    const { data } = await supabase.from('bookings').select('*').eq('id', booking.id);
    expect(data).toHaveLength(1);
  });
});
```

## Troubleshooting

### Issue: Data Inconsistency
**Symptom**: `health.dataConsistent` is false

**Solution**:
1. Check migration health: `await getMigrationHealth(userId)`
2. Run consistency validation: `await validateDataConsistency(userId)`
3. Manually trigger migration: `await migrateBookingsToSupabase(userId)`
4. Verify: `await validateDataConsistency(userId)`

### Issue: Supabase Write Failures
**Symptom**: Bookings save to localStorage but not Supabase

**Solution**:
1. Check Supabase connection: `health.supabaseConnected`
2. Verify auth token: `await supabase.auth.getSession()`
3. Check RLS policies on tables
4. Review error logs for specific error messages

### Issue: localStorage Quota Exceeded
**Symptom**: "QuotaExceededError" in console

**Solution**:
1. Clear old data: `await clearLocalStorageBookings(userId, true)`
2. Move to Phase 3 (supabase-only) sooner
3. Implement cleanup strategy for old bookings

## Best Practices

1. **Always use the hooks** instead of direct localStorage/Supabase access
2. **Monitor health** during Phase 1 and 2 transitions
3. **Validate consistency** before moving to next phase
4. **Enable logging** during migration (disable in production after Phase 3)
5. **Test thoroughly** in each phase before advancing
6. **Communicate** phase changes to users if downtime expected
7. **Keep Phase 2** running for at least 2 weeks to ensure stability
8. **Backup data** before starting Phase 3

## Rollback Strategy

If issues occur in any phase:

**Phase 1 → localStorage only**:
```bash
VITE_STORAGE_MIGRATION_PHASE=fallback
# No changes to write behavior, safe rollback
```

**Phase 2 → Phase 1**:
```bash
VITE_STORAGE_MIGRATION_PHASE=fallback
# localStorage writes continue, Supabase is optional
```

**Phase 3 → Phase 2**:
```bash
VITE_STORAGE_MIGRATION_PHASE=dual-write
# Re-sync data from Supabase to localStorage
await syncWithLocalStorage();
```

## Support

For issues or questions:
1. Check this guide first
2. Review example implementations in `/src/examples/IntegrationExamples.tsx`
3. Check migration health dashboard
4. Review browser console logs with `VITE_ENABLE_MIGRATION_LOGGING=true`
5. Contact development team

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Example Implementations](/src/examples/IntegrationExamples.tsx)
- [Migration Utilities](/src/utils/storageMigration.ts)
- [Migration Hooks](/src/hooks/shared/)
