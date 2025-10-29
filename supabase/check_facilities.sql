-- Check existing facilities and their zones
SELECT
  f.id,
  f.name,
  f.slug,
  f.status,
  COUNT(z.id) as zone_count
FROM facilities f
LEFT JOIN zones z ON f.id = z.facility_id
GROUP BY f.id, f.name, f.slug, f.status
ORDER BY f.name;
