-- Automatically add 3 zones to each published facility that has fewer than 3 zones

DO $$
DECLARE
  facility_record RECORD;
  current_zone_count INTEGER;
  zone_names TEXT[][] := ARRAY[
    ARRAY['Zone A', 'Main area'],
    ARRAY['Zone B', 'Secondary area'],
    ARRAY['Zone C', 'Additional space']
  ];
  i INTEGER;
BEGIN
  -- Loop through all published facilities
  FOR facility_record IN
    SELECT f.id, f.name, f.org_id, f.capacity
    FROM facilities f
    WHERE f.status = 'published'
  LOOP
    -- Count current zones for this facility
    SELECT COUNT(*) INTO current_zone_count
    FROM zones
    WHERE facility_id = facility_record.id;

    RAISE NOTICE 'Facility: % (%) has % zones', facility_record.name, facility_record.id, current_zone_count;

    -- Add zones until the facility has 3 zones
    FOR i IN (current_zone_count + 1)..3 LOOP
      INSERT INTO zones (
        id,
        org_id,
        facility_id,
        name,
        description,
        capacity,
        price_per_hour_cents,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        facility_record.org_id,
        facility_record.id,
        facility_record.name || ' - ' || zone_names[i][1],
        zone_names[i][2],
        GREATEST(facility_record.capacity / 3, 10), -- At least 10 capacity
        50000, -- 500 kr/hour default price
        NOW()
      );

      RAISE NOTICE 'Added zone % for facility %', i, facility_record.name;
    END LOOP;
  END LOOP;
END $$;

-- Verify the result
SELECT
  f.name as facility_name,
  f.slug,
  COUNT(z.id) as zone_count,
  STRING_AGG(z.name, ', ' ORDER BY z.name) as zone_names
FROM facilities f
LEFT JOIN zones z ON f.id = z.facility_id
WHERE f.status = 'published'
GROUP BY f.id, f.name, f.slug
ORDER BY f.name;
