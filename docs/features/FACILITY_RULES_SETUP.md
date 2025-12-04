# Facility Rules System Setup

This document explains how to set up and use the new facility rules system.

## Overview

The facility rules system allows administrators to add, edit, and manage rules for each facility. These rules are stored in Supabase and displayed both in the admin edit page and the public facility detail page.

## Database Migration

### Step 1: Apply the SQL Migration

You need to apply the SQL migration to create the `facility_rules` table in Supabase.

**Option 1: Using Supabase Dashboard (Recommended)**

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `/supabase/migrations/20251204000001_create_facility_rules.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

**Option 2: Using Supabase CLI**

```bash
# From the project root directory
supabase db push
```

This will apply all pending migrations including the facility rules migration.

### Step 2: Verify the Migration

After applying the migration, verify it was successful:

```sql
-- Check that the table exists
SELECT * FROM facility_rules LIMIT 1;

-- Check the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'facility_rules';
```

## Features

### Admin Features

1. **Add Rules**: Click "Legg til regel" in the Rules tab to add a new rule
2. **Edit Rules**: 
   - Change the rule text in the textarea
   - Select rule type (Booking, Sikkerhet, Generelt, Kansellering)
   - Toggle "Påkrevd" checkbox to mark rules as required
3. **Delete Rules**: Click the trash icon to delete a rule
4. **Auto-save**: All changes are automatically saved to Supabase

### Rule Types

- **Booking**: Rules related to booking procedures
- **Sikkerhet** (Safety): Safety-related rules
- **Generelt** (General): General facility rules
- **Kansellering** (Cancellation): Cancellation policy rules

### Public Display

- Rules are displayed in the facility detail page under the "Regler" tab
- Rules are shown with appropriate icons:
  - ✓ Green checkmark for booking/general rules
  - ✗ Red X for safety/cancellation rules
- Required rules are marked with a "Påkrevd" badge
- If no custom rules exist, default rules are shown

## Usage

### Adding Rules (Admin)

1. Navigate to Admin > Facilities
2. Click "Edit" on a facility
3. Go to the "Regler" tab
4. Click "Legg til regel"
5. Enter the rule text
6. Select the rule type
7. Check "Påkrevd" if the rule is mandatory
8. The rule is automatically saved

### Viewing Rules (Public)

1. Go to any facility detail page
2. Click on the "Regler" tab
3. All facility rules are displayed

## Database Schema

```sql
CREATE TABLE facility_rules (
  id uuid PRIMARY KEY,
  facility_id uuid REFERENCES facilities(id) ON DELETE CASCADE,
  rule_text text NOT NULL,
  rule_type text NOT NULL DEFAULT 'booking',
  is_required boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

## API Reference

### Service Functions

The facility rules service (`/src/services/supabase/facilityRules.service.ts`) provides:

- `useFacilityRules(facilityId)` - Fetch all rules for a facility
- `useCreateFacilityRule()` - Create a new rule
- `useUpdateFacilityRule()` - Update an existing rule
- `useDeleteFacilityRule()` - Delete a rule
- `useReorderFacilityRules()` - Reorder rules (for future drag-and-drop)

### Example Usage

```typescript
import { useFacilityRules, useCreateFacilityRule } from '@/services/supabase/facilityRules.service';

// Fetch rules
const { data: rules, isLoading } = useFacilityRules(facilityId);

// Create a rule
const createMutation = useCreateFacilityRule();
createMutation.mutate({
  facility_id: facilityId,
  rule_text: 'No smoking allowed',
  rule_type: 'safety',
  is_required: true,
  sort_order: 0,
});
```

## Notes

- Rules are automatically ordered by `sort_order`
- RLS (Row Level Security) policies ensure:
  - Anyone can view rules for published facilities
  - Only org staff and admins can manage rules
  - Rules are deleted when the facility is deleted (CASCADE)
- The system falls back to default rules if no custom rules exist

## Troubleshooting

### Migration fails

If the migration fails, check:
1. You have the necessary permissions in Supabase
2. The helper functions (like `is_org_staff`, `is_platform_admin`) exist
3. The `facilities` table exists

### Rules not showing

1. Check that the facility is published (`status = 'published'`)
2. Verify RLS policies allow you to view the rules
3. Check browser console for errors

### Cannot add/edit rules

1. Ensure you're logged in as an admin or org staff member
2. Check that the facility has been saved (has an ID)
3. Verify your user has the correct role in the organization
