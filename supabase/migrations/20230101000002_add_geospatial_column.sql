-- Add geospatial column to facilities table
alter table facilities add column location geography(point, 4326);