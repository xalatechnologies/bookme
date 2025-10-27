-- Enable PostGIS extension for geospatial data
create extension if not exists postgis;

-- Enable pg_trgm extension for text search
create extension if not exists pg_trgm;