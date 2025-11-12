-- Booknor Backend Seed Data
-- This file seeds the database with test data for development

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

INSERT INTO organizations (id, name, slug, timezone, status)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Drammen Kommune', 'drammen-kommune', 'Europe/Oslo', 'active'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Booknor Demo Organization', 'booknor-demo', 'Europe/Oslo', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FACILITIES
-- ============================================================================

INSERT INTO facilities (
  id, org_id, name, description, facility_type, status,
  address, city, postal_code, country,
  capacity, rating, review_count,
  amenities, images, location
)
VALUES
  -- Drammen Idrettshall
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Drammen Idrettshall',
    'Moderne idrettshall med full utstyr for ballsport og trening. Perfekt for fotball, håndball, basketball og volleyball.',
    'sports',
    'published',
    'Bragernes Torg 2',
    'Drammen',
    '3017',
    'NO',
    200,
    4.5,
    45,
    '["Garderober", "Dusj", "Parkering", "Lyd/lys", "Tribuner"]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center"
    ]'::jsonb,
    ST_SetSRID(ST_MakePoint(10.2045, 59.7436), 4326)::geography
  ),

  -- Strømsø Kulturhus
  (
    '44444444-4444-4444-4444-444444444444'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Strømsø Kulturhus',
    'Fleksibelt kulturhus med scene og sal. Ideelt for konserter, teaterforestillinger, møter og kulturarrangementer.',
    'conference',
    'published',
    'Gamle Kirkegate 18',
    'Drammen',
    '3019',
    'NO',
    150,
    4.2,
    38,
    '["Scene", "Lyd/lys", "Projektor", "Kjøkken", "Garderober"]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&crop=center"
    ]'::jsonb,
    ST_SetSRID(ST_MakePoint(10.2134, 59.7389), 4326)::geography
  ),

  -- Bragernes Møterom
  (
    '55555555-5555-5555-5555-555555555555'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Bragernes Møterom',
    'Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for bedriftsmøter og presentasjoner.',
    'conference',
    'published',
    'Nedre Storgate 15',
    'Drammen',
    '3015',
    'NO',
    25,
    4.7,
    52,
    '["Projektor", "Tavle", "WiFi", "Kaffe/te", "Video konferanse"]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&crop=center"
    ]'::jsonb,
    ST_SetSRID(ST_MakePoint(10.2034, 59.7445), 4326)::geography
  ),

  -- Konnerud Fotballbane
  (
    '66666666-6666-6666-6666-666666666666'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Konnerud Fotballbane',
    'Moderne kunstgressbane med flombelysning. Perfekt for fotballkamper og trening året rundt.',
    'sports',
    'published',
    'Konnerudgata 80',
    'Drammen',
    '3045',
    'NO',
    100,
    4.4,
    67,
    '["Garderober", "Dusj", "Flombelysning", "Parkering", "Tribuner"]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&h=600&fit=crop&crop=center"
    ]'::jsonb,
    ST_SetSRID(ST_MakePoint(10.1845, 59.7234), 4326)::geography
  ),

  -- Drammen Svømmehall
  (
    '77777777-7777-7777-7777-777777777777'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Drammen Svømmehall',
    'Moderne svømmeanlegg med 25m basseng, barnebasseng og badstue. Åpent for svømmetrening og arrangementer.',
    'sports',
    'published',
    'Marienlystveien 2',
    'Drammen',
    '3016',
    'NO',
    80,
    4.6,
    89,
    '["25m basseng", "Barnebasseng", "Badstue", "Garderober", "Dusj", "Parkering"]'::jsonb,
    '[
      "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&h=600&fit=crop&crop=center"
    ]'::jsonb,
    ST_SetSRID(ST_MakePoint(10.2123, 59.7467), 4326)::geography
  )

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ZONES (Areas within facilities)
-- ============================================================================

INSERT INTO zones (
  id, org_id, facility_id, name, description, capacity,
  price_per_hour_cents, created_at
)
VALUES
  -- Drammen Idrettshall zones (3 zones)
  (
    '88888888-8888-8888-8888-888888888888'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Hovedhall',
    'Full idrettshall med alle fasiliteter',
    200,
    85000,
    NOW()
  ),
  (
    '99999999-9999-9999-9999-999999999999'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Halv Hall',
    'Halv idrettshall med nett skillevegg',
    100,
    55000,
    NOW()
  ),
  (
    '11111111-8888-8888-8888-888888888888'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Treningsrom',
    'Mindre treningsrom med grunnleggende utstyr',
    50,
    35000,
    NOW()
  ),

  -- Strømsø Kulturhus zones (3 zones)
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Store Sal',
    'Hovedsal med scene og full lyd/lys',
    150,
    120000,
    NOW()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Lille Sal',
    'Mindre sal for møter og mindre arrangementer',
    40,
    60000,
    NOW()
  ),
  (
    '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Galleri',
    'Utstillingsrom og galleri for kunstutstillinger',
    30,
    45000,
    NOW()
  ),

  -- Bragernes Møterom zones (3 zones)
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
  ),

  -- Konnerud Fotballbane zones (3 zones)
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid,
    'Full Bane',
    'Full 11-er fotballbane',
    100,
    75000,
    NOW()
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid,
    'Halv Bane',
    '7-er fotballbane',
    50,
    40000,
    NOW()
  ),
  (
    '66666666-cccc-cccc-cccc-cccccccccccc'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    '66666666-6666-6666-6666-666666666666'::uuid,
    'Mini Bane',
    'Mini fotballbane for barn og ung-fotball',
    30,
    25000,
    NOW()
  ),

  -- Drammen Svømmehall zones (3 zones)
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

-- ============================================================================
-- ADDITIONAL SERVICES
-- ============================================================================

INSERT INTO additional_services (
  id, org_id, name, description, price_cents, price_type, category, created_at
)
VALUES
  -- Sports facility services
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Utstyr Leie',
    'Leie av baller, nett, vester og annet treningsutstyr',
    15000,
    'per-booking',
    'equipment',
    NOW()
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Dommer',
    'Profesjonell dommer for kamper',
    50000,
    'per-booking',
    'other',
    NOW()
  ),
  (
    '10101010-1010-1010-1010-101010101010'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Ekstra Renhold',
    'Grundig renhold etter arrangement',
    30000,
    'per-booking',
    'cleaning',
    NOW()
  ),

  -- Conference/cultural facility services
  (
    '20202020-2020-2020-2020-202020202020'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Lyd/Lys Tekniker',
    'Profesjonell lyd og lys tekniker',
    80000,
    'per-hour',
    'technical',
    NOW()
  ),
  (
    '30303030-3030-3030-3030-303030303030'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Grunnleggende Servering',
    'Kaffe, te, vann og kjeks',
    2500,
    'flat-rate',
    'catering',
    NOW()
  ),
  (
    '40404040-4040-4040-4040-404040404040'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Lunsj Servering',
    'Komplett lunsj for møtedeltakere',
    15000,
    'flat-rate',
    'catering',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FACILITY_ADDITIONAL_SERVICES (Many-to-many relationship)
-- ============================================================================

INSERT INTO facility_additional_services (facility_id, service_id)
VALUES
  -- Drammen Idrettshall services
  ('33333333-3333-3333-3333-333333333333'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid),
  ('33333333-3333-3333-3333-333333333333'::uuid, '10101010-1010-1010-1010-101010101010'::uuid),

  -- Konnerud Fotballbane services
  ('66666666-6666-6666-6666-666666666666'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid),

  -- Strømsø Kulturhus services
  ('44444444-4444-4444-4444-444444444444'::uuid, '20202020-2020-2020-2020-202020202020'::uuid),
  ('44444444-4444-4444-4444-444444444444'::uuid, '30303030-3030-3030-3030-303030303030'::uuid),
  ('44444444-4444-4444-4444-444444444444'::uuid, '40404040-4040-4040-4040-404040404040'::uuid),

  -- Bragernes Møterom services
  ('55555555-5555-5555-5555-555555555555'::uuid, '30303030-3030-3030-3030-303030303030'::uuid),
  ('55555555-5555-5555-5555-555555555555'::uuid, '40404040-4040-4040-4040-404040404040'::uuid)
ON CONFLICT (facility_id, service_id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 'Seed data inserted successfully!' AS status;
SELECT COUNT(*) AS organizations FROM organizations;
SELECT COUNT(*) AS facilities FROM facilities;
SELECT COUNT(*) AS zones FROM zones;
SELECT COUNT(*) AS additional_services FROM additional_services;
SELECT COUNT(*) AS facility_services FROM facility_additional_services;
