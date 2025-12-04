# Storage Migration Quick Reference

## TL;DR

Replace localStorage with migration-aware hooks for zero-downtime migration to Supabase.

## Quick Start

### 1. Replace localStorage reads

**Before:**
```typescript
const bookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
```

**After:**
```typescript
import { useBookings } from '@/hooks/shared';

const { bookings, isLoading } = useBookings(userId, 'pending', true);
```

### 2. Replace localStorage writes

**Before:**
```typescript
const addBooking = (booking) => {
  const existing = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
  localStorage.setItem('pendingBookings', JSON.stringify([...existing, booking]));
};
```

**After:**
```typescript
const { addBooking } = useBookings(userId, 'pending', false);

await addBooking(booking);
```

### 3. Use preferences hook

**Before:**
```typescript
const language = localStorage.getItem('language') || 'no';
localStorage.setItem('language', 'en');
```

**After:**
```typescript
import { useUserPreferences } from '@/hooks/shared';

const { preferences, updateLanguage } = useUserPreferences(userId, true);

await updateLanguage('en');
```

## Migration Phases

| Phase | Env Var | Behavior | Risk |
|-------|---------|----------|------|
| **Phase 1: Fallback** | `VITE_STORAGE_MIGRATION_PHASE=fallback` | Read Supabase → fallback localStorage<br/>Write localStorage only | Zero |
| **Phase 2: Dual-Write** | `VITE_STORAGE_MIGRATION_PHASE=dual-write` | Read Supabase → fallback localStorage<br/>Write both | Low |
| **Phase 3: Supabase-Only** | `VITE_STORAGE_MIGRATION_PHASE=supabase-only` | Read/Write Supabase only | Very Low |

## Available Hooks

### useBookings
```typescript
const {
  bookings,              // Booking array
  isLoading,             // Loading state
  error,                 // Error object
  addBooking,            // Add function
  updateBooking,         // Update function
  deleteBooking,         // Delete function
  refetch,               // Refresh function
} = useBookings(userId, 'all', true);
```

### useUserPreferences
```typescript
const {
  preferences,           // Preferences object
  isLoading,             // Loading state
  updateLanguage,        // Update language
  updateFilters,         // Update filters
  updateUISettings,      // Update UI settings
} = useUserPreferences(userId, true);
```

### useDraftBooking
```typescript
const {
  draft,                 // Draft data
  hasDraft,              // Has draft boolean
  isSaving,              // Saving indicator
  saveDraft,             // Save function
  clearDraft,            // Clear function
} = useDraftBooking(userId, bookingId, true, 3000);
```

### useStorageMigration
```typescript
const {
  phase,                 // Current phase
  health,                // Health status
  checkHealth,           // Check health function
  migrateToSupabase,    // Migrate function
} = useStorageMigration(userId, true);
```

## Common Tasks

### Check migration health
```typescript
const { health } = useStorageMigration(userId, true);

if (!health.dataConsistent) {
  console.warn('Data sync issue detected');
}
```

### Manual migration trigger
```typescript
const { migrateToSupabase } = useStorageMigration(userId, false);

const result = await migrateToSupabase();
console.log(`Migrated ${result.migrated} bookings`);
```

### Auto-save form draft
```typescript
const { saveDraft } = useDraftBooking(userId, undefined, true, 3000);

// Draft auto-saves every 3 seconds when form changes
const [formData, setFormData] = useState({});

useEffect(() => {
  if (Object.keys(formData).length > 0) {
    saveDraft(formData);
  }
}, [formData, saveDraft]);
```

## Environment Setup

Add to `.env.local`:

```bash
# Start with Phase 1
VITE_STORAGE_MIGRATION_PHASE=fallback
VITE_ENABLE_MIGRATION_LOGGING=true
VITE_VALIDATE_STORAGE_CONSISTENCY=true

# Supabase config
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

## Database Setup

Run migration:
```bash
npx supabase migration up
```

Or manually apply:
```bash
psql -f supabase/migrations/20241028_storage_migration_tables.sql
```

## Migration Checklist

### Phase 1: Preparation (Week 1-2)
- [ ] Deploy database tables
- [ ] Set `VITE_STORAGE_MIGRATION_PHASE=fallback`
- [ ] Run one-time migration for existing users
- [ ] Monitor health dashboard
- [ ] Validate consistency

### Phase 2: Dual-Write (Week 3-6)
- [ ] Set `VITE_STORAGE_MIGRATION_PHASE=dual-write`
- [ ] Deploy updated application
- [ ] Monitor for write errors
- [ ] Validate consistency weekly
- [ ] Test all CRUD operations

### Phase 3: Supabase-Only (Week 7+)
- [ ] Confirm 100% data consistency
- [ ] Set `VITE_STORAGE_MIGRATION_PHASE=supabase-only`
- [ ] Deploy updated application
- [ ] Optional: Clear localStorage
- [ ] Monitor for 1 week
- [ ] Remove migration code (optional)

## Error Handling

### Supabase Connection Failed
```typescript
const { error } = useBookings(userId, 'all', true);

if (error) {
  console.error('Booking fetch failed:', error);
  // In Phase 1-2: Automatic fallback to localStorage
  // In Phase 3: Show error to user
}
```

### Data Inconsistency
```typescript
const { health, migrateToSupabase } = useStorageMigration(userId, true);

if (!health.dataConsistent) {
  // Trigger re-migration
  await migrateToSupabase();
}
```

### localStorage Quota Exceeded
```typescript
try {
  await addBooking(booking);
} catch (error) {
  if (error.message.includes('Quota')) {
    // Clear old data or move to Phase 3
    await clearLocalStorageBookings(userId, true);
  }
}
```

## Monitoring

### Health Dashboard Component
```typescript
import { useStorageMigration } from '@/hooks/shared';

const MigrationHealth = () => {
  const { health } = useStorageMigration(userId, true);

  return (
    <div>
      <div>Phase: {health?.phase}</div>
      <div>Supabase: {health?.supabaseConnected ? '✅' : '❌'}</div>
      <div>Consistent: {health?.dataConsistent ? '✅' : '⚠️'}</div>
      <div>Local: {health?.localBookingsCount}</div>
      <div>Supabase: {health?.supabaseBookingsCount}</div>
    </div>
  );
};
```

## Rollback

### From Phase 2 → Phase 1
```bash
# Just change env var, no data loss
VITE_STORAGE_MIGRATION_PHASE=fallback
```

### From Phase 3 → Phase 2
```bash
# Change env var and re-sync
VITE_STORAGE_MIGRATION_PHASE=dual-write

# Then manually sync
const { syncWithLocalStorage } = useBookings(userId);
await syncWithLocalStorage();
```

## Testing

### Unit Tests
```typescript
import { validateDataConsistency } from '@/utils/storageMigration';

it('should validate consistency', async () => {
  const isConsistent = await validateDataConsistency('user-id');
  expect(isConsistent).toBe(true);
});
```

### Integration Tests
```typescript
import { useBookings } from '@/hooks/shared';

it('should add booking', async () => {
  const { addBooking } = useBookings('user-id');
  await addBooking(mockBooking);
  // Verify in both storage layers
});
```

## Performance Tips

1. **Use auto-fetch wisely**: Only enable on dashboard pages
   ```typescript
   const { bookings } = useBookings(userId, 'all', false); // Manual fetch
   ```

2. **Debounce draft saves**: Default 3s is good, increase if needed
   ```typescript
   useDraftBooking(userId, undefined, true, 5000); // 5s delay
   ```

3. **Filter early**: Use bookingType parameter
   ```typescript
   useBookings(userId, 'pending', true); // Only pending bookings
   ```

4. **Batch operations**: Use Supabase batch inserts in Phase 2+

## Support

- **Documentation**: `/docs/STORAGE_MIGRATION_GUIDE.md`
- **Examples**: `/src/examples/IntegrationExamples.tsx`
- **Tests**: `/src/utils/__tests__/storageMigration.test.ts`

## Common Mistakes

❌ **DON'T: Mix localStorage and hooks**
```typescript
// BAD
const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
const { addBooking } = useBookings(userId);
```

✅ **DO: Use hooks exclusively**
```typescript
// GOOD
const { bookings, addBooking } = useBookings(userId, 'all', true);
```

❌ **DON'T: Skip Phase 2**
```typescript
// BAD: Phase 1 → Phase 3 directly
VITE_STORAGE_MIGRATION_PHASE=supabase-only
```

✅ **DO: Follow all phases**
```typescript
// GOOD: Phase 1 → Phase 2 → Phase 3
// Week 1: fallback
// Week 3: dual-write
// Week 7: supabase-only
```

❌ **DON'T: Clear localStorage without validation**
```typescript
// BAD
await clearLocalStorageBookings(userId, false);
```

✅ **DO: Always validate first**
```typescript
// GOOD
await clearLocalStorageBookings(userId, true);
```

## Quick Commands

```bash
# Check current phase
grep VITE_STORAGE_MIGRATION_PHASE .env.local

# Run database migration
npx supabase migration up

# Run tests
npm test storageMigration

# Check Supabase connection
npx supabase status

# View migration logs
# Set VITE_ENABLE_MIGRATION_LOGGING=true
# Then check browser console
```

## Need Help?

1. Check the full guide: `/docs/STORAGE_MIGRATION_GUIDE.md`
2. Review examples: `/src/examples/IntegrationExamples.tsx`
3. Run health check: Use `useStorageMigration` hook
4. Enable logging: Set `VITE_ENABLE_MIGRATION_LOGGING=true`
5. Contact: Development team
