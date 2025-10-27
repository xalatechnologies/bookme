-- Migration: Enhance Facilities Schema
-- Description: Adds missing fields from frontend to facilities table

-- Add missing facility fields
alter table facilities
  add column facility_type text,
  add column capacity int,
  add column rating numeric(3,2) check (rating >= 0 and rating <= 5),
  add column review_count int not null default 0,
  add column area_description text,
  add column accessibility_features jsonb default '[]';

-- Rename title to name for consistency with frontend
alter table facilities rename column title to name;

comment on column facilities.facility_type is 'Type of facility: Idrettshall, Kulturhus, Møterom, etc.';
comment on column facilities.capacity is 'Maximum capacity (people)';
comment on column facilities.rating is 'Average rating from reviews (0-5)';
comment on column facilities.review_count is 'Total number of reviews';
comment on column facilities.area_description is 'General area/neighborhood description';
comment on column facilities.accessibility_features is 'Array of accessibility feature strings';

-- Add indexes for common queries
create index on facilities(facility_type);
create index on facilities(capacity);
create index on facilities(rating desc);
create index on facilities(review_count desc);
create index on facilities(status, rating desc);

-- Update existing facilities with default values
update facilities set
  facility_type = 'General',
  capacity = 50,
  rating = 0.0,
  review_count = 0
where facility_type is null;

-- Make required fields not null after defaults are set
alter table facilities
  alter column facility_type set not null,
  alter column capacity set not null;

-- Add weekly availability schedule (similar to zones)
create table facility_availability (
  id uuid primary key default uuid_generate_v4(),
  facility_id uuid not null references facilities(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  starts_time time not null,
  ends_time time not null check (ends_time > starts_time),
  created_at timestamptz not null default now(),
  unique(facility_id, day_of_week)
);

create index on facility_availability(facility_id);
create index on facility_availability(day_of_week);

comment on table facility_availability is 'Weekly recurring availability schedule for entire facility';

-- RLS for facility_availability
alter table facility_availability enable row level security;

create policy "Public can view published facility availability"
  on facility_availability for select
  using (exists(
    select 1 from facilities f
    where f.id = facility_availability.facility_id
    and f.status = 'published'
  ));

create policy "Org members can manage facility availability"
  on facility_availability for all
  using (exists(
    select 1 from facilities f
    join memberships m on m.org_id = f.org_id
    where f.id = facility_availability.facility_id
    and m.user_id = auth.uid()
    and m.role in ('owner', 'admin', 'staff')
  ));

-- Helper function: Calculate average rating for a facility
create or replace function update_facility_rating(p_facility_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_avg_rating numeric;
  v_count int;
begin
  select avg(rating), count(*)
  into v_avg_rating, v_count
  from reviews
  where facility_id = p_facility_id;

  update facilities
  set rating = coalesce(v_avg_rating, 0.0),
      review_count = v_count
  where id = p_facility_id;
end;
$$;

comment on function update_facility_rating is 'Recalculates and updates facility rating and review count';

-- Trigger to auto-update ratings when reviews are added/updated/deleted
create or replace function trigger_update_facility_rating()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'DELETE' then
    perform update_facility_rating(OLD.facility_id);
  else
    perform update_facility_rating(NEW.facility_id);
  end if;
  return null;
end;
$$;

create trigger update_facility_rating_trigger
after insert or update or delete on reviews
for each row execute function trigger_update_facility_rating();

comment on trigger update_facility_rating_trigger on reviews is 'Automatically updates facility ratings when reviews change';
