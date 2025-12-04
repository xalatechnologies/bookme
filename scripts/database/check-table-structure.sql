-- Check the structure of localized_db_values table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'localized_db_values'
ORDER BY ordinal_position;

-- Also check what data is already in the table
SELECT * FROM localized_db_values LIMIT 5;
