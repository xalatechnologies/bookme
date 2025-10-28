-- Enable UUID extension
create extension if not exists "uuid-ossp" schema extensions;

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto schema extensions;

-- Enable PostGIS extension for geospatial data
create extension if not exists postgis;

-- Enable pg_trgm extension for text search
create extension if not exists pg_trgm;