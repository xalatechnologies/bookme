-- Add 3 zones for each facility that doesn't have enough zones
-- This script works with any facility UUIDs

-- First, let's see what we have
SELECT
  f.id,
  f.name,
  f.slug,
  COUNT(z.id) as current_zones
FROM facilities f
LEFT JOIN zones z ON f.id = z.facility_id
WHERE f.status = 'published'
GROUP BY f.id, f.name, f.slug
ORDER BY f.name;

-- Now add zones for each facility
-- You'll need to replace the facility IDs below with the actual IDs from the query above

-- Example for facility 1 (replace FACILITY_ID_HERE with actual UUID):
/*
INSERT INTO zones (
  id, org_id, facility_id, name, description, capacity,
  price_per_hour_cents, created_at
)
VALUES
  (
    gen_random_uuid(),
    (SELECT org_id FROM facilities WHERE id = 'FACILITY_ID_HERE'),
    'FACILITY_ID_HERE'::uuid,
    'Zone 1',
    'First bookable zone',
    50,
    50000,
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT org_id FROM facilities WHERE id = 'FACILITY_ID_HERE'),
    'FACILITY_ID_HERE'::uuid,
    'Zone 2',
    'Second bookable zone',
    50,
    50000,
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT org_id FROM facilities WHERE id = 'FACILITY_ID_HERE'),
    'FACILITY_ID_HERE'::uuid,
    'Zone 3',
    'Third bookable zone',
    50,
    50000,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
*/

-- Repeat the INSERT for each facility, changing:
-- 1. FACILITY_ID_HERE to the actual facility ID
-- 2. Zone names to match the facility (e.g., "Hovedhall", "Halv Hall", etc.)
-- 3. Capacity and price to appropriate values
