-- Check if facilities were seeded correctly with slugs
SELECT id, name, slug, facility_type, status, org_id
FROM facilities
ORDER BY name;

-- Check specifically for stromso-kulturhus
SELECT * FROM facilities WHERE slug = 'stromso-kulturhus';

-- Check all slugs
SELECT slug FROM facilities ORDER BY slug;
