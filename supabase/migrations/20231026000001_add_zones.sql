-- Migration: Add Zones/Areas Support
-- Description: Adds support for sub-facility bookable zones/areas with individual pricing and availability

-- Zones/Areas within facilities
create table zones (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  capacity int not null default 1,
  area_sqm numeric, -- Area in square meters
  price_per_hour_cents bigint not null check (price_per_hour_cents >= 0),
  amenities jsonb default '[]',
  status text not null default 'active' check (status in ('active', 'inactive', 'maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on zones(facility_id);
create index on zones(org_id);
create index on zones(status);

comment on table zones is 'Bookable zones or areas within a facility (e.g., tennis court 1, meeting room A)';
comment on column zones.area_sqm is 'Area in square meters for display purposes';
comment on column zones.amenities is 'Array of amenity strings specific to this zone';

-- Zone availability schedules (recurring weekly)
create table zone_availability (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references zones(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sunday, 6=Saturday
  starts_time time not null,
  ends_time time not null check (ends_time > starts_time),
  created_at timestamptz not null default now(),
  unique(zone_id, day_of_week)
);

create index on zone_availability(zone_id);
create index on zone_availability(day_of_week);

comment on table zone_availability is 'Weekly recurring availability schedule for zones';
comment on column zone_availability.day_of_week is '0=Sunday through 6=Saturday';

-- Update bookings to reference zones
alter table bookings
  add column zone_id uuid references zones(id) on delete restrict;

create index on bookings(zone_id);

comment on column bookings.zone_id is 'Optional reference to specific zone within facility';

-- Update pricing_rules to support zone-specific pricing
alter table pricing_rules
  add column zone_id uuid references zones(id) on delete cascade;

create index on pricing_rules(zone_id);

comment on column pricing_rules.zone_id is 'If set, pricing rule applies to specific zone instead of entire facility';

-- RLS Policies for zones
alter table zones enable row level security;

create policy "Public can view active zones"
  on zones for select
  using (status = 'active');

create policy "Org members can view all org zones"
  on zones for select
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
  ));

create policy "Org staff can manage zones"
  on zones for all
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
    and role in ('owner', 'admin', 'staff')
  ));

-- RLS for zone_availability
alter table zone_availability enable row level security;

create policy "Public can view zone availability"
  on zone_availability for select
  using (exists(
    select 1 from zones z
    where z.id = zone_availability.zone_id
    and z.status = 'active'
  ));

create policy "Org staff can manage zone availability"
  on zone_availability for all
  using (exists(
    select 1 from zones z
    join memberships m on m.org_id = z.org_id
    where z.id = zone_availability.zone_id
    and m.user_id = auth.uid()
    and m.role in ('owner', 'admin', 'staff')
  ));

-- Helper function: Get zone availability for a specific day
create or replace function get_zone_availability(p_zone_id uuid, p_date date)
returns table(starts_time time, ends_time time)
language sql stable as
$$
  select za.starts_time, za.ends_time
  from zone_availability za
  where za.zone_id = p_zone_id
    and za.day_of_week = extract(dow from p_date)::int
$$;

comment on function get_zone_availability is 'Returns availability times for a zone on a specific date';

-- Helper function: Check if zone is available at given time
create or replace function is_zone_available(
  p_zone_id uuid,
  p_starts timestamptz,
  p_ends timestamptz
)
returns boolean
language plpgsql stable as
$$
declare
  v_day_of_week int;
  v_local_start time;
  v_local_end time;
  v_tz text;
begin
  -- Get organization timezone
  select o.timezone into v_tz
  from zones z
  join facilities f on f.id = z.facility_id
  join organizations o on o.id = f.org_id
  where z.id = p_zone_id;

  -- Convert to local time
  v_day_of_week := extract(dow from p_starts at time zone v_tz)::int;
  v_local_start := (p_starts at time zone v_tz)::time;
  v_local_end := (p_ends at time zone v_tz)::time;

  -- Check if there's availability for this day and time
  return exists (
    select 1 from zone_availability za
    where za.zone_id = p_zone_id
      and za.day_of_week = v_day_of_week
      and za.starts_time <= v_local_start
      and za.ends_time >= v_local_end
  );
end;
$$;

comment on function is_zone_available is 'Checks if zone is available during the specified time range';

-- Update has_overlap function to consider zones
drop function if exists has_overlap(uuid, timestamptz, timestamptz);
create or replace function has_overlap(
  p_facility uuid,
  p_starts timestamptz,
  p_ends timestamptz,
  p_zone_id uuid default null
)
returns boolean language sql stable as
$$
  select exists (
    select 1 from bookings b
    where b.facility_id = p_facility
      and (p_zone_id is null or b.zone_id = p_zone_id)
      and b.status in ('awaiting_payment','paid','completed','refunded')
      and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_starts, p_ends, '[)')
  )
$$;

comment on function has_overlap is 'Check for booking conflicts. If zone_id provided, checks only that zone.';