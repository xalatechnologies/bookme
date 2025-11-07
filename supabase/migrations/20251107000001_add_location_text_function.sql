-- Add RPC function to convert facility location to text format
create or replace function get_facility_location_text(facility_id uuid)
returns text
language sql
stable
as
$$
  select ST_AsText(location) from facilities where id = facility_id and location is not null
$$;

-- Add RPC function to get published facilities with location text
create or replace function get_published_facilities_with_location_text(org_id uuid)
returns table (
  id uuid,
  name text,
  facility_type text,
  address text,
  capacity int,
  images jsonb,
  location_text text,
  org_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  description text,
  rating numeric,
  review_count int,
  slug text,
  amenities jsonb,
  accessibility_features jsonb,
  area_description text,
  city text,
  postal_code text,
  country text,
  contact_email text,
  contact_phone text
)
language sql
stable
as
$$
  select 
    f.id,
    f.name,
    f.facility_type,
    f.address,
    f.capacity,
    f.images,
    ST_AsText(f.location) as location_text,
    f.org_id,
    f.status,
    f.created_at,
    f.updated_at,
    f.description,
    f.rating,
    f.review_count,
    f.slug,
    f.amenities,
    f.accessibility_features,
    f.area_description,
    f.city,
    f.postal_code,
    f.country,
    f.contact_email,
    f.contact_phone
  from facilities f
  where f.org_id = org_id and f.status = 'published' and f.location is not null
$$;

-- Add RPC function to get all facilities with location text (for admin)
create or replace function get_all_facilities_with_location_text(org_id uuid)
returns table (
  id uuid,
  name text,
  facility_type text,
  address text,
  capacity int,
  images jsonb,
  location_text text,
  org_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  description text,
  rating numeric,
  review_count int,
  slug text,
  amenities jsonb,
  accessibility_features jsonb,
  area_description text,
  city text,
  postal_code text,
  country text,
  contact_email text,
  contact_phone text
)
language sql
stable
as
$$
  select 
    f.id,
    f.name,
    f.facility_type,
    f.address,
    f.capacity,
    f.images,
    ST_AsText(f.location) as location_text,
    f.org_id,
    f.status,
    f.created_at,
    f.updated_at,
    f.description,
    f.rating,
    f.review_count,
    f.slug,
    f.amenities,
    f.accessibility_features,
    f.area_description,
    f.city,
    f.postal_code,
    f.country,
    f.contact_email,
    f.contact_phone
  from facilities f
  where f.org_id = org_id and f.location is not null
$$;