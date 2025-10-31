-- Add missing zones for all facilities (3 zones each)

-- Add 3rd zone for Drammen Idrettshall
INSERT INTO zones (
  id, org_id, facility_id, name, description, capacity,
  price_per_hour_cents, created_at
)
VALUES
  (
    '11111111-8888-8888-8888-888888888888'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Treningsrom',
    'Mindre treningsrom med grunnleggende utstyr',
    50,
    35000,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Add 3rd zone for Strømsø Kulturhus
INSERT INTO zones (
  id, org_id, facility_id, name, description, capacity,
  price_per_hour_cents, created_at
)
VALUES
  (
    '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Galleri',
    'Utstillingsrom og galleri for kunstutstillinger',
    30,
    45000,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Add 3 zones for Bragernes Møterom
INSERT INTO zones (
  id, org_id, facility_id, name, description, capacity,
  price_per_hour_cents, created_at
)
VALUES
  (
    '33333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'Hovedrom',
    'Stort møterom med full konferanseutstyr',
    25,
    50000,
    NOW()
  ),
  (
    '44444444-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'Lite Møterom',
    'Mindre møterom for mindre grupper',
    10,
    30000,
    NOW()
  ),
  (
    '55555555-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'Pauserom',
    'Pauserom med kjøkken og sittegrupper',
    15,
    20000,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Add 3rd zone for Konnerud Fotballbane
INSERT INTO zones (
  id, org_id, facility_id, name, description, capacity,
  price_per_hour_cents, created_at
)
VALUES
  (
    '66666666-cccc-cccc-cccc-cccccccccccc'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid,
    'Mini Bane',
    'Mini fotballbane for barn og ung-fotball',
    30,
    25000,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Add 3 zones for Drammen Svømmehall
INSERT INTO zones (
  id, org_id, facility_id, name, description, capacity,
  price_per_hour_cents, created_at
)
VALUES
  (
    '77777777-dddd-dddd-dddd-dddddddddddd'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '77777777-7777-7777-7777-777777777777'::uuid,
    'Hovedbasseng',
    '25m basseng med 6 baner for svømmetrening',
    60,
    90000,
    NOW()
  ),
  (
    '88888888-dddd-dddd-dddd-dddddddddddd'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '77777777-7777-7777-7777-777777777777'::uuid,
    'Barnebasseng',
    'Grunt basseng for barn og svømmeopplæring',
    30,
    45000,
    NOW()
  ),
  (
    '99999999-dddd-dddd-dddd-dddddddddddd'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '77777777-7777-7777-7777-777777777777'::uuid,
    'Varmtvannsbasseng',
    'Varmtvannsbasseng for avslapning og terapi',
    20,
    60000,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Verify zones were added
SELECT f.name as facility_name, COUNT(z.id) as zone_count
FROM facilities f
LEFT JOIN zones z ON f.id = z.facility_id
WHERE f.status = 'published'
GROUP BY f.id, f.name
ORDER BY f.name;
