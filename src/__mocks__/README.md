# Mock Data & Test Fixtures

This directory contains mock data and test fixtures for development, testing, and database seeding.

## Directory Structure

```
__mocks__/
├── fixtures/                 # Test fixtures and mock data
│   ├── facilities.fixture.ts # Sample facility data
│   ├── bookings.fixture.ts   # Sample booking data
│   ├── zones.fixture.ts      # Sample zone data
│   ├── services.fixture.ts   # Sample additional services
│   ├── dashboardData.ts      # Admin dashboard mock data
│   ├── facilitiesData.ts     # Admin facilities mock data
│   └── trendData.ts          # Trend chart mock data
└── seeds/                    # Database seed scripts
    └── (future seed scripts)
```

## Usage

### For Testing

```typescript
import { coreFacilities } from '@/__mocks__/fixtures/facilities.fixture';

// Use in tests
describe('Facility Component', () => {
  it('renders facilities', () => {
    render(<FacilityList facilities={coreFacilities} />);
  });
});
```

### For Development (Fallback Data)

⚠️ **WARNING**: Mock data should NOT be used in production components.

Mock data can be used as fallback during development:

```typescript
import { useFacilities } from '@/services/supabase/facilities.service';

// ✅ CORRECT: Use real Supabase data
const { data: facilities, isLoading } = useFacilities();

// ❌ WRONG: Don't import mock data in production components
// import { coreFacilities } from '@/__mocks__/fixtures/facilities.fixture';
```

### For Database Seeding

```bash
# Run seed script (when implemented)
npm run seed
```

## Important Notes

1. **Production Code**: Never import mock data directly in production components
2. **Testing Only**: Use fixtures primarily for unit/integration tests
3. **Type Safety**: All fixtures export proper TypeScript types
4. **Temporary**: Consider replacing with proper database seeding tools (e.g., Prisma seed)

## Migration from `/src/data`

This directory replaces the old `/src/data` directory structure:

- `/src/data/coreFacilities.ts` → `/src/__mocks__/fixtures/facilities.fixture.ts`
- `/src/data/bookings/` → `/src/__mocks__/fixtures/bookings.fixture.ts`
- `/src/data/zones/` → `/src/__mocks__/fixtures/zones.fixture.ts`
- `/src/data/admin/` → `/src/__mocks__/fixtures/*Data.ts`

## Future Improvements

- [ ] Add proper test fixture factories
- [ ] Implement database seeding with Supabase CLI
- [ ] Add fixture generators for dynamic test data
- [ ] Create MSW (Mock Service Worker) handlers
