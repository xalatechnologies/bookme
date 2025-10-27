-- BookMe Seed Data Migration
-- This file contains seed data converted from the existing mock data files
-- Original files:
--   - src/data/coreFacilities.ts
--   - src/data/zones/dummyZones.ts
--   - src/data/bookings/dummyBookings.ts
--   - src/data/additionalServices/dummyServices.ts

-- ============================================================================
-- ORGANIZATIONS (Required for multi-tenancy)
-- ============================================================================

INSERT INTO organizations (id, name, slug, created_at)
VALUES
  ('org-drammen-001', 'Drammen Kommune', 'drammen-kommune', NOW()),
  ('org-seed-001', 'BookMe Demo Organization', 'bookme-demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FACILITIES (from coreFacilities.ts)
-- ============================================================================

-- Insert Drammen Idrettshall
INSERT INTO facilities (
  id, org_id, name, description, type, address, capacity, price_per_hour,
  amenities, images, coordinates, rating, status, created_at
)
VALUES (
  'fac-drammen-idrettshall-001',
  'org-drammen-001',
  'Drammen Idrettshall',
  'Moderne idrettshall med full utstyr for ballsport og trening. Perfekt for fotball, håndball, basketball og volleyball.',
  'sports',
  'Bragernes Torg 2, 3017 Drammen',
  200,
  850,
  ARRAY['Garderober', 'Dusj', 'Parkering', 'Lyd/lys', 'Tribuner'],
  ARRAY[
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center'
  ],
  '{"lat": 59.7436, "lng": 10.2045}',
  4.5,
  'published',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert Strømsø Kulturhus
INSERT INTO facilities (
  id, org_id, name, description, type, address, capacity, price_per_hour,
  amenities, images, coordinates, rating, status, created_at
)
VALUES (
  'fac-stromso-kulturhus-001',
  'org-drammen-001',
  'Strømsø Kulturhus',
  'Fleksibelt kulturhus med scene og sal. Ideelt for konserter, teaterforestillinger, møter og kulturarrangementer.',
  'conference',
  'Gamle Kirkegate 18, 3019 Drammen',
  150,
  1200,
  ARRAY['Scene', 'Lyd/lys', 'Projektor', 'Kjøkken', 'Garderober'],
  ARRAY[
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&crop=center'
  ],
  '{"lat": 59.7389, "lng": 10.2134}',
  4.2,
  'published',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert Bragernes Møterom
INSERT INTO facilities (
  id, org_id, name, description, type, address, capacity, price_per_hour,
  amenities, images, coordinates, rating, status, created_at
)
VALUES (
  'fac-bragernes-moterom-001',
  'org-drammen-001',
  'Bragernes Møterom',
  'Profesjonelt møterom i hjertet av Drammen. Utstyrt med moderne teknologi for bedriftsmøter og presentasjoner.',
  'conference',
  'Nedre Storgate 15, 3015 Drammen',
  25,
  600,
  ARRAY['Projektor', 'Tavle', 'WiFi', 'Kaffe/te', 'Video konferanse'],
  ARRAY[
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&crop=center'
  ],
  '{"lat": 59.7445, "lng": 10.2034}',
  4.7,
  'published',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert Konnerud Fotballbane
INSERT INTO facilities (
  id, org_id, name, description, type, address, capacity, price_per_hour,
  amenities, images, coordinates, rating, status, created_at
)
VALUES (
  'fac-konnerud-fotballbane-001',
  'org-drammen-001',
  'Konnerud Fotballbane',
  'Moderne kunstgressbane med flombelysning. Perfekt for fotballkamper og trening året rundt.',
  'sports',
  'Konnerudgata 80, 3045 Drammen',
  100,
  750,
  ARRAY['Garderober', 'Dusj', 'Flombelysning', 'Parkering', 'Tribuner'],
  ARRAY[
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&h=600&fit=crop&crop=center'
  ],
  '{"lat": 59.7234, "lng": 10.1845}',
  4.4,
  'published',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert Drammen Svømmehall
INSERT INTO facilities (
  id, org_id, name, description, type, address, capacity, price_per_hour,
  amenities, images, coordinates, rating, status, created_at
)
VALUES (
  'fac-drammen-svommehall-001',
  'org-drammen-001',
  'Drammen Svømmehall',
  'Moderne svømmeanlegg med 25m basseng, barnebasseng og badstue. Åpent for svømmetrening og arrangementer.',
  'sports',
  'Marienlystveien 2, 3016 Drammen',
  80,
  950,
  ARRAY['25m basseng', 'Barnebasseng', 'Badstue', 'Garderober', 'Dusj', 'Parkering'],
  ARRAY[
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&h=600&fit=crop&crop=center'
  ],
  '{"lat": 59.7467, "lng": 10.2123}',
  4.6,
  'published',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ZONES (from dummyZones.ts)
-- ============================================================================

-- Zones for Drammen Idrettshall
INSERT INTO zones (id, facility_id, name, description, capacity, price_adjustment, features, created_at)
VALUES
  (
    'zone-idrettshall-main',
    'fac-drammen-idrettshall-001',
    'Hovedhall',
    'Full idrettshall med alle fasiliteter',
    200,
    0,
    ARRAY['Fullsize bane', 'Tribuner', 'Lyd/lys'],
    NOW()
  ),
  (
    'zone-idrettshall-half',
    'fac-drammen-idrettshall-001',
    'Halv Hall',
    'Halv idrettshall med nett skillevegg',
    100,
    -300,
    ARRAY['Halv bane', 'Nett skillevegg'],
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Zones for Strømsø Kulturhus
INSERT INTO zones (id, facility_id, name, description, capacity, price_adjustment, features, created_at)
VALUES
  (
    'zone-kulturhus-hall',
    'fac-stromso-kulturhus-001',
    'Store Sal',
    'Hovedsal med scene og full lyd/lys',
    150,
    0,
    ARRAY['Scene', 'Fullsize lyd/lys', 'Projektor'],
    NOW()
  ),
  (
    'zone-kulturhus-small',
    'fac-stromso-kulturhus-001',
    'Lille Sal',
    'Mindre sal for møter og mindre arrangementer',
    40,
    -600,
    ARRAY['Møtebord', 'Projektor', 'WiFi'],
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Zones for Konnerud Fotballbane
INSERT INTO zones (id, facility_id, name, description, capacity, price_adjustment, features, created_at)
VALUES
  (
    'zone-fotballbane-full',
    'fac-konnerud-fotballbane-001',
    'Full Bane',
    'Full 11-er fotballbane',
    100,
    0,
    ARRAY['11-er', 'Flombelysning', 'Kunstgress'],
    NOW()
  ),
  (
    'zone-fotballbane-half',
    'fac-konnerud-fotballbane-001',
    'Halv Bane',
    '7-er fotballbane',
    50,
    -350,
    ARRAY['7-er', 'Flombelysning', 'Kunstgress'],
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ADDITIONAL SERVICES (from dummyServices.ts)
-- ============================================================================

-- Services for sports facilities
INSERT INTO additional_services (id, facility_id, name, description, price, category, created_at)
VALUES
  (
    'service-equipment-rental',
    'fac-drammen-idrettshall-001',
    'Utstyr Leie',
    'Leie av baller, nett, vester og annet treningsutstyr',
    150,
    'equipment',
    NOW()
  ),
  (
    'service-referee',
    'fac-konnerud-fotballbane-001',
    'Dommer',
    'Profesjonell dommer for kamper',
    500,
    'staff',
    NOW()
  ),
  (
    'service-cleaning',
    'fac-drammen-idrettshall-001',
    'Ekstra Renhold',
    'Grundig renhold etter arrangement',
    300,
    'cleaning',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Services for conference/cultural facilities
INSERT INTO additional_services (id, facility_id, name, description, price, category, created_at)
VALUES
  (
    'service-av-equipment',
    'fac-stromso-kulturhus-001',
    'Lyd/Lys Tekniker',
    'Profesjonell lyd og lys tekniker',
    800,
    'staff',
    NOW()
  ),
  (
    'service-catering-basic',
    'fac-bragernes-moterom-001',
    'Grunnleggende Servering',
    'Kaffe, te, vann og kjeks',
    250,
    'catering',
    NOW()
  ),
  (
    'service-catering-lunch',
    'fac-bragernes-moterom-001',
    'Lunsj Servering',
    'Komplett lunsj for møtedeltakere',
    400,
    'catering',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE USERS (for testing)
-- ============================================================================

-- Note: These will be created through Supabase Auth
-- You can create test users through the Supabase dashboard or auth.signUp()
-- This is just documentation of what users should exist for testing

-- Test User 1: test-user@example.com
-- Test User 2: admin@drammen.no
-- Test User 3: booking-manager@example.com

-- ============================================================================
-- SAMPLE BOOKINGS (from dummyBookings.ts)
-- ============================================================================

-- Note: Bookings require valid user_id from auth.users
-- These are example bookings - actual user_ids will be different
-- You should create these through the application after authentication

/*
Example bookings to create after auth setup:

INSERT INTO bookings (
  facility_id, user_id, start_time, end_time,
  total_price, status, created_at
)
VALUES (
  'fac-drammen-idrettshall-001',
  '<actual-user-id>',
  '2024-11-15 18:00:00',
  '2024-11-15 20:00:00',
  1700,
  'confirmed',
  NOW()
);
*/

-- ============================================================================
-- AVAILABILITY SETTINGS
-- ============================================================================

-- These would typically be managed through facility settings
-- For now, availability is checked against existing bookings
-- Future: Add facility_availability table for recurring availability patterns

-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================

-- Organizations: 2
-- Facilities: 5
-- Zones: 6
-- Additional Services: 6
-- Total Records: 19

-- Next Steps:
-- 1. Run this seed file: psql -d your_db < supabase/seed.sql
-- 2. Create test users through Supabase Auth
-- 3. Create sample bookings through the application
-- 4. Update frontend to use Supabase services instead of mock data

SELECT 'Seed data inserted successfully!' AS status;
