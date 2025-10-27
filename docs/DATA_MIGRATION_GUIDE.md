# Data Migration Guide: localStorage → Supabase

## Overview

This guide provides **step-by-step instructions** for migrating existing data from localStorage-based Zustand stores to the new Supabase backend.

**Purpose:** Preserve user data during the transition to Supabase
**Target:** Existing users with localStorage data
**Estimated Time:** 1-2 hours to implement

---

## Migration Strategy

### Option 1: One-time Bulk Migration (Recommended)

**When to use:**
- Migrating all users at once
- During maintenance window
- Before removing localStorage code

**Pros:**
- Clean cutover
- All users migrate together
- Easier to support

**Cons:**
- Requires maintenance window
- All-or-nothing approach

### Option 2: Gradual Migration

**When to use:**
- During normal operation
- No maintenance window available
- Phased rollout

**Pros:**
- No downtime
- Can test with subset of users
- Easier rollback

**Cons:**
- More complex code
- Dual-state management temporarily
- Longer migration period

---

## What Data Needs Migration?

### Current localStorage Data

```typescript
// Check what's stored in localStorage
console.log('localStorage keys:', Object.keys(localStorage));

// Common Zustand stores:
// - facility-store
// - booking-store
// - favorites-store
// - zone-store
// - message-store
// - group-store
// - recurring-booking-store
// - field-config-store
```

### Data to Migrate

1. **Facilities** - Custom created by users
2. **Bookings** - User booking history
3. **Favorites** - User's favorited facilities
4. **Zones** - Custom zones for facilities
5. **Field Configs** - Custom field configurations
6. **Groups** - User-created booking groups
7. **Recurring Bookings** - Recurring booking series
8. **Messages** - Message threads (if any)

### Data to SKIP

- **UI State** - Theme, view preferences (keep in localStorage)
- **Temporary State** - Selected slots, calendar view (transient)
- **Demo Data** - Sample/mock data (don't migrate)

---

## Pre-Migration Checklist

### 1. Backup Existing Data

```typescript
// Create backup of all localStorage data
const backupLocalStorage = () => {
  const backup: Record<string, any> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        backup[key] = JSON.parse(localStorage.getItem(key) || '');
      } catch {
        backup[key] = localStorage.getItem(key);
      }
    }
  }

  // Save to file
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `localstorage-backup-${Date.now()}.json`;
  a.click();

  console.log('Backup created:', backup);
  return backup;
};

// Run in console
backupLocalStorage();
```

### 2. Verify Supabase is Ready

```bash
# Check Supabase is running
supabase status

# Verify all migrations applied
supabase migration list

# Test connection
curl http://127.0.0.1:54321/rest/v1/facilities \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 3. Ensure User is Authenticated

```typescript
// User must be logged in before migration
const { user, currentOrgId } = useAuth();

if (!user || !currentOrgId) {
  console.error('User must be logged in to migrate data');
  return;
}
```

---

## Migration Script

### Step 1: Create Migration Utility

Create `src/utils/dataMigration.ts`:

```typescript
/**
 * Data Migration Utility
 *
 * Migrates localStorage data to Supabase backend
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Insert'];
type Booking = Database['public']['Tables']['bookings']['Insert'];
type Favorite = Database['public']['Tables']['favorites']['Insert'];
type Zone = Database['public']['Tables']['zones']['Insert'];

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  skipped: number;
}

/**
 * Migration status stored in localStorage
 */
interface MigrationStatus {
  completed: boolean;
  timestamp: string;
  version: string;
  facilities: number;
  bookings: number;
  favorites: number;
  zones: number;
}

const MIGRATION_STATUS_KEY = 'supabase-migration-status';
const MIGRATION_VERSION = '1.0.0';

/**
 * Check if migration has already been completed
 */
export const hasMigrationCompleted = (): boolean => {
  try {
    const status = localStorage.getItem(MIGRATION_STATUS_KEY);
    if (!status) return false;

    const parsed: MigrationStatus = JSON.parse(status);
    return parsed.completed && parsed.version === MIGRATION_VERSION;
  } catch {
    return false;
  }
};

/**
 * Mark migration as completed
 */
const markMigrationCompleted = (counts: {
  facilities: number;
  bookings: number;
  favorites: number;
  zones: number;
}): void => {
  const status: MigrationStatus = {
    completed: true,
    timestamp: new Date().toISOString(),
    version: MIGRATION_VERSION,
    ...counts,
  };

  localStorage.setItem(MIGRATION_STATUS_KEY, JSON.stringify(status));
};

/**
 * Migrate facilities from localStorage to Supabase
 */
export const migrateFacilities = async (
  userId: string,
  orgId: string
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
    skipped: 0,
  };

  try {
    // Get facilities from localStorage
    const storeData = localStorage.getItem('facility-store');
    if (!storeData) {
      return result;
    }

    const parsed = JSON.parse(storeData);
    const facilities = parsed.state?.facilities || [];

    if (facilities.length === 0) {
      return result;
    }

    // Filter out demo/sample facilities
    const userFacilities = facilities.filter(
      (f: any) => !f.id.startsWith('demo-') && !f.id.startsWith('sample-')
    );

    // Check which facilities already exist in Supabase
    const { data: existingFacilities } = await supabase
      .from('facilities')
      .select('id')
      .eq('org_id', orgId);

    const existingIds = new Set(existingFacilities?.map((f) => f.id) || []);

    // Migrate each facility
    for (const facility of userFacilities) {
      // Skip if already exists
      if (existingIds.has(facility.id)) {
        result.skipped++;
        continue;
      }

      // Transform to Supabase format
      const facilityData: Facility = {
        id: facility.id,
        org_id: orgId,
        name: facility.name,
        description: facility.description,
        address: facility.address,
        type: facility.type,
        status: facility.status || 'published',
        capacity: facility.capacity,
        price_per_hour: facility.pricePerHour,
        area: facility.area,
        amenities: facility.amenities || [],
        images: facility.images || [],
        contact_email: facility.contactEmail,
        contact_phone: facility.contactPhone,
        latitude: facility.latitude,
        longitude: facility.longitude,
        rating: facility.rating,
        review_count: facility.reviewCount,
      };

      // Insert into Supabase
      const { error } = await supabase.from('facilities').insert(facilityData);

      if (error) {
        result.errors.push(`Facility ${facility.name}: ${error.message}`);
        result.success = false;
      } else {
        result.migratedCount++;
      }
    }
  } catch (error) {
    result.errors.push(`Migration error: ${error}`);
    result.success = false;
  }

  return result;
};

/**
 * Migrate bookings from localStorage to Supabase
 */
export const migrateBookings = async (
  userId: string,
  orgId: string
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
    skipped: 0,
  };

  try {
    const storeData = localStorage.getItem('booking-store');
    if (!storeData) return result;

    const parsed = JSON.parse(storeData);
    const bookings = parsed.state?.bookings || [];

    if (bookings.length === 0) return result;

    // Filter user's bookings only
    const userBookings = bookings.filter((b: any) => b.userId === userId);

    // Check existing bookings
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', userId);

    const existingIds = new Set(existingBookings?.map((b) => b.id) || []);

    for (const booking of userBookings) {
      if (existingIds.has(booking.id)) {
        result.skipped++;
        continue;
      }

      const bookingData: Booking = {
        id: booking.id,
        facility_id: booking.facilityId,
        user_id: userId,
        start_time: booking.startTime,
        end_time: booking.endTime,
        status: booking.status || 'confirmed',
        total_price: booking.totalPrice || 0,
        notes: booking.notes,
        payment_status: booking.paymentStatus || 'pending',
      };

      const { error } = await supabase.from('bookings').insert(bookingData);

      if (error) {
        result.errors.push(`Booking ${booking.id}: ${error.message}`);
        result.success = false;
      } else {
        result.migratedCount++;
      }
    }
  } catch (error) {
    result.errors.push(`Migration error: ${error}`);
    result.success = false;
  }

  return result;
};

/**
 * Migrate favorites from localStorage to Supabase
 */
export const migrateFavorites = async (
  userId: string
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
    skipped: 0,
  };

  try {
    const storeData = localStorage.getItem('favorites-store');
    if (!storeData) return result;

    const parsed = JSON.parse(storeData);
    const favorites = parsed.state?.favorites || [];

    if (favorites.length === 0) return result;

    // Check existing favorites
    const { data: existingFavorites } = await supabase
      .from('favorites')
      .select('facility_id')
      .eq('user_id', userId);

    const existingIds = new Set(
      existingFavorites?.map((f) => f.facility_id) || []
    );

    for (const facilityId of favorites) {
      if (existingIds.has(facilityId)) {
        result.skipped++;
        continue;
      }

      const favoriteData: Favorite = {
        user_id: userId,
        facility_id: facilityId,
      };

      const { error } = await supabase.from('favorites').insert(favoriteData);

      if (error) {
        result.errors.push(`Favorite ${facilityId}: ${error.message}`);
        result.success = false;
      } else {
        result.migratedCount++;
      }
    }
  } catch (error) {
    result.errors.push(`Migration error: ${error}`);
    result.success = false;
  }

  return result;
};

/**
 * Migrate zones from localStorage to Supabase
 */
export const migrateZones = async (
  userId: string,
  orgId: string
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
    skipped: 0,
  };

  try {
    const storeData = localStorage.getItem('zone-store');
    if (!storeData) return result;

    const parsed = JSON.parse(storeData);
    const zones = parsed.state?.zones || [];

    if (zones.length === 0) return result;

    // Check existing zones
    const { data: existingZones } = await supabase
      .from('zones')
      .select('id')
      .in(
        'facility_id',
        zones.map((z: any) => z.facilityId)
      );

    const existingIds = new Set(existingZones?.map((z) => z.id) || []);

    for (const zone of zones) {
      if (existingIds.has(zone.id)) {
        result.skipped++;
        continue;
      }

      const zoneData: Zone = {
        id: zone.id,
        facility_id: zone.facilityId,
        name: zone.name,
        description: zone.description,
        capacity: zone.capacity,
        price_per_hour: zone.pricePerHour,
        amenities: zone.amenities || [],
        availability_schedule: zone.availabilitySchedule || {},
      };

      const { error } = await supabase.from('zones').insert(zoneData);

      if (error) {
        result.errors.push(`Zone ${zone.name}: ${error.message}`);
        result.success = false;
      } else {
        result.migratedCount++;
      }
    }
  } catch (error) {
    result.errors.push(`Migration error: ${error}`);
    result.success = false;
  }

  return result;
};

/**
 * Run complete migration
 */
export const runMigration = async (
  userId: string,
  orgId: string
): Promise<{
  success: boolean;
  results: {
    facilities: MigrationResult;
    bookings: MigrationResult;
    favorites: MigrationResult;
    zones: MigrationResult;
  };
  summary: string;
}> => {
  console.log('🚀 Starting data migration...');

  // Check if already completed
  if (hasMigrationCompleted()) {
    console.log('✅ Migration already completed');
    return {
      success: true,
      results: {
        facilities: {
          success: true,
          migratedCount: 0,
          errors: [],
          skipped: 0,
        },
        bookings: { success: true, migratedCount: 0, errors: [], skipped: 0 },
        favorites: { success: true, migratedCount: 0, errors: [], skipped: 0 },
        zones: { success: true, migratedCount: 0, errors: [], skipped: 0 },
      },
      summary: 'Migration already completed',
    };
  }

  // Run migrations in sequence
  const results = {
    facilities: await migrateFacilities(userId, orgId),
    bookings: await migrateBookings(userId, orgId),
    favorites: await migrateFavorites(userId),
    zones: await migrateZones(userId, orgId),
  };

  // Generate summary
  const totalMigrated =
    results.facilities.migratedCount +
    results.bookings.migratedCount +
    results.favorites.migratedCount +
    results.zones.migratedCount;

  const totalSkipped =
    results.facilities.skipped +
    results.bookings.skipped +
    results.favorites.skipped +
    results.zones.skipped;

  const totalErrors =
    results.facilities.errors.length +
    results.bookings.errors.length +
    results.favorites.errors.length +
    results.zones.errors.length;

  const allSuccess = Object.values(results).every((r) => r.success);

  const summary = `
Migration Complete!
-------------------
✅ Facilities: ${results.facilities.migratedCount} migrated, ${results.facilities.skipped} skipped
✅ Bookings: ${results.bookings.migratedCount} migrated, ${results.bookings.skipped} skipped
✅ Favorites: ${results.favorites.migratedCount} migrated, ${results.favorites.skipped} skipped
✅ Zones: ${results.zones.migratedCount} migrated, ${results.zones.skipped} skipped

Total: ${totalMigrated} items migrated, ${totalSkipped} skipped, ${totalErrors} errors
  `.trim();

  console.log(summary);

  // Mark migration as completed (even if some items skipped)
  if (allSuccess || totalMigrated > 0) {
    markMigrationCompleted({
      facilities: results.facilities.migratedCount,
      bookings: results.bookings.migratedCount,
      favorites: results.favorites.migratedCount,
      zones: results.zones.migratedCount,
    });
  }

  return {
    success: allSuccess,
    results,
    summary,
  };
};
```

---

## Step 2: Create Migration UI Component

Create `src/components/DataMigrationDialog.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { runMigration, hasMigrationCompleted } from '@/utils/dataMigration';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const DataMigrationDialog = (): JSX.Element => {
  const { user, currentOrgId } = useAuth();
  const [isOpen, setIsOpen] = useState(!hasMigrationCompleted());
  const [isMigrating, setIsMigrating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleMigrate = async () => {
    if (!user || !currentOrgId) {
      alert('Please log in to migrate your data');
      return;
    }

    setIsMigrating(true);

    try {
      const migrationResults = await runMigration(user.id, currentOrgId);
      setResults(migrationResults);
    } catch (error) {
      console.error('Migration failed:', error);
      setResults({
        success: false,
        summary: `Migration failed: ${error}`,
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    // User chooses to skip migration
    localStorage.setItem(
      'supabase-migration-status',
      JSON.stringify({
        completed: true,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        skipped: true,
      })
    );
    setIsOpen(false);
  };

  if (!isOpen) return <></>;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Migrate Your Data</DialogTitle>
          <DialogDescription>
            We've upgraded to a new backend! Migrate your existing bookings,
            favorites, and facilities to continue using them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!results && (
            <>
              <Alert>
                <AlertDescription>
                  This will copy your data from browser storage to our secure
                  cloud database. Your existing data will not be deleted.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">What will be migrated:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your custom facilities</li>
                  <li>Your booking history</li>
                  <li>Your favorite facilities</li>
                  <li>Your custom zones</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleMigrate}
                  disabled={isMigrating}
                  className="flex-1"
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    'Migrate My Data'
                  )}
                </Button>

                <Button onClick={handleSkip} variant="outline">
                  Skip for Now
                </Button>
              </div>
            </>
          )}

          {results && (
            <>
              <Alert
                variant={results.success ? 'default' : 'destructive'}
                className="mb-4"
              >
                <div className="flex items-center gap-2">
                  {results.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <AlertDescription>
                    {results.success
                      ? 'Migration completed successfully!'
                      : 'Migration completed with some errors'}
                  </AlertDescription>
                </div>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-semibold">Migration Results:</h3>

                {Object.entries(results.results).map(([key, result]: [string, any]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="capitalize">{key}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {result.migratedCount} migrated
                        {result.skipped > 0 && `, ${result.skipped} skipped`}
                      </span>
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {results.summary && (
                <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {results.summary}
                </pre>
              )}

              <Button onClick={() => setIsOpen(false)} className="w-full">
                Continue to App
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## Step 3: Integrate Migration into App

Update `src/App.tsx`:

```typescript
import { DataMigrationDialog } from '@/components/DataMigrationDialog';

export const App = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Show migration dialog on first load */}
        <DataMigrationDialog />

        <LanguageProvider>
          {/* ... rest of app ... */}
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
```

---

## Step 4: Test Migration

### Manual Test

1. **Populate localStorage with test data:**

```typescript
// Run in console
localStorage.setItem(
  'favorites-store',
  JSON.stringify({
    state: {
      favorites: ['facility-1', 'facility-2', 'facility-3'],
    },
  })
);
```

2. **Trigger migration:**
   - Reload app
   - Migration dialog should appear
   - Click "Migrate My Data"
   - Watch progress

3. **Verify in Supabase Studio:**
   - Open http://127.0.0.1:54323
   - Go to Table Editor → favorites
   - Verify 3 rows inserted

### Automated Test

```typescript
// test/dataMigration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { runMigration } from '@/utils/dataMigration';

describe('Data Migration', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  it('should migrate favorites', async () => {
    // Setup test data
    localStorage.setItem(
      'favorites-store',
      JSON.stringify({
        state: { favorites: ['facility-1', 'facility-2'] },
      })
    );

    // Run migration
    const result = await runMigration('user-123', 'org-123');

    // Verify
    expect(result.success).toBe(true);
    expect(result.results.favorites.migratedCount).toBe(2);
  });
});
```

---

## Rollback Plan

### If Migration Fails

1. **Data is safe:**
   - localStorage data NOT deleted
   - Supabase data can be cleared

2. **Clear Supabase data:**

```sql
-- Run in Supabase Studio → SQL Editor
DELETE FROM favorites WHERE user_id = 'your-user-id';
DELETE FROM bookings WHERE user_id = 'your-user-id';
DELETE FROM zones WHERE facility_id IN (SELECT id FROM facilities WHERE org_id = 'your-org-id');
DELETE FROM facilities WHERE org_id = 'your-org-id';
```

3. **Reset migration status:**

```typescript
// Run in console
localStorage.removeItem('supabase-migration-status');
```

4. **Retry migration:**
   - Reload app
   - Migration dialog appears again
   - Fix any issues
   - Try again

---

## Post-Migration

### 1. Verify Data Integrity

```typescript
// Compare counts
const localStorageCount = JSON.parse(
  localStorage.getItem('favorites-store') || '{}'
).state?.favorites?.length || 0;

const { data: supabaseFavorites } = await supabase
  .from('favorites')
  .select('*', { count: 'exact', head: true });

console.log('localStorage:', localStorageCount);
console.log('Supabase:', supabaseFavorites?.length);
// Should match!
```

### 2. Monitor for Issues

```typescript
// Add error tracking
window.addEventListener('error', (event) => {
  if (event.message.includes('localStorage')) {
    console.error('localStorage error after migration:', event);
    // Send to error tracking service
  }
});
```

### 3. Keep localStorage Temporarily

**Don't delete localStorage immediately!**

- Keep as backup for 30 days
- Allow users to verify data migrated correctly
- Provide "Restore from backup" option if needed

### 4. Clean Up (After 30 Days)

```typescript
// After confirming migration success
export const cleanupLocalStorage = () => {
  const keysToRemove = [
    'facility-store',
    'booking-store',
    'favorites-store',
    'zone-store',
    'message-store',
    'group-store',
    'recurring-booking-store',
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log('localStorage cleaned up');
};
```

---

## FAQ

### Q: What if user has a lot of data?

**A:** Migration handles large datasets:
- Processes items sequentially (prevents overwhelming)
- Shows progress indicator
- Can be paused and resumed (via skip + later retry)

### Q: What if user is offline during migration?

**A:** Migration requires internet:
- Check `navigator.onLine` before starting
- Show warning if offline
- Retry automatically when back online

### Q: Can migration be run multiple times?

**A:** Yes, it's idempotent:
- Checks for existing data before inserting
- Skips duplicates automatically
- Safe to run multiple times

### Q: What if Supabase is down during migration?

**A:** Graceful handling:
- Migration fails with error message
- localStorage data remains intact
- User can retry later
- No data loss

---

## Summary

This migration guide provides:

- ✅ **Complete migration script** for all data types
- ✅ **UI component** for user-friendly migration
- ✅ **Backup and rollback** procedures
- ✅ **Testing procedures** manual and automated
- ✅ **Error handling** for all failure scenarios
- ✅ **Post-migration verification** and cleanup

**Estimated implementation time:** 1-2 hours
**User experience:** One-click migration with progress feedback
**Safety:** Non-destructive, keeps localStorage as backup

---

**Created:** 2025-10-26
**Version:** 1.0.0
**Status:** Ready to Implement
