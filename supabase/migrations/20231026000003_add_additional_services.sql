-- Migration: Add Additional Services/Equipment
-- Description: Support for additional services, equipment, catering, etc. that can be added to bookings

-- Service enums
do $$ begin
  create type service_category as enum ('equipment', 'catering', 'technical', 'cleaning', 'security', 'other');
  create type service_price_type as enum ('per-hour', 'per-day', 'per-booking', 'flat-rate');
  create type service_availability as enum ('available', 'on-request', 'unavailable');
exception when duplicate_object then null; end $$;

-- Additional services catalog
create table additional_services (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  category service_category not null,
  price_type service_price_type not null,
  price_cents bigint not null check (price_cents >= 0),
  currency text not null default 'NOK',
  availability service_availability not null default 'available',
  min_quantity int not null default 1 check (min_quantity > 0),
  max_quantity int check (max_quantity is null or max_quantity >= min_quantity),
  requires_approval boolean not null default false,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on additional_services(org_id);
create index on additional_services(category);
create index on additional_services(availability);

comment on table additional_services is 'Catalog of additional services/equipment available for bookings';
comment on column additional_services.price_type is 'How the service is priced: per-hour, per-day, per-booking, or flat-rate';
comment on column additional_services.requires_approval is 'If true, service requests must be approved by staff';

-- Service availability per facility (if not org-wide)
create table facility_additional_services (
  facility_id uuid not null references facilities(id) on delete cascade,
  service_id uuid not null references additional_services(id) on delete cascade,
  is_included boolean not null default false, -- Included in base facility price
  override_price_cents bigint check (override_price_cents is null or override_price_cents >= 0),
  override_availability service_availability,
  created_at timestamptz not null default now(),
  primary key (facility_id, service_id)
);

create index on facility_additional_services(facility_id);
create index on facility_additional_services(service_id);
create index on facility_additional_services(is_included);

comment on table facility_additional_services is 'Associates services with specific facilities and allows price overrides';
comment on column facility_additional_services.is_included is 'If true, service is included in base facility booking price';
comment on column facility_additional_services.override_price_cents is 'Override org-level pricing for this facility';

-- Booking services (what was actually ordered with a booking)
create table booking_additional_services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  service_id uuid not null references additional_services(id) on delete restrict,
  quantity int not null default 1 check (quantity > 0),
  price_cents bigint not null check (price_cents >= 0),
  total_price_cents bigint not null check (total_price_cents >= 0),
  currency text not null default 'NOK',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index on booking_additional_services(booking_id);
create index on booking_additional_services(service_id);
create index on booking_additional_services(status);

comment on table booking_additional_services is 'Additional services ordered with a specific booking';
comment on column booking_additional_services.status is 'pending = awaiting approval if required, approved = confirmed, rejected = denied';

-- RLS Policies for additional_services
alter table additional_services enable row level security;

create policy "Public can view available services"
  on additional_services for select
  using (availability in ('available', 'on-request'));

create policy "Org members can view all org services"
  on additional_services for select
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
  ));

create policy "Org staff can manage services"
  on additional_services for all
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
    and role in ('owner', 'admin', 'staff')
  ));

-- RLS for facility_additional_services
alter table facility_additional_services enable row level security;

create policy "Public can view published facility services"
  on facility_additional_services for select
  using (exists(
    select 1 from facilities f
    where f.id = facility_additional_services.facility_id
    and f.status = 'published'
  ));

create policy "Org staff can manage facility services"
  on facility_additional_services for all
  using (exists(
    select 1 from facilities f
    join memberships m on m.org_id = f.org_id
    where f.id = facility_additional_services.facility_id
    and m.user_id = auth.uid()
    and m.role in ('owner', 'admin', 'staff')
  ));

-- RLS for booking_additional_services
alter table booking_additional_services enable row level security;

create policy "Users can view services on own bookings"
  on booking_additional_services for select
  using (exists(
    select 1 from bookings b
    where b.id = booking_additional_services.booking_id
    and b.user_id = auth.uid()
  ));

create policy "Users can add services to own bookings"
  on booking_additional_services for insert
  with check (exists(
    select 1 from bookings b
    where b.id = booking_id
    and b.user_id = auth.uid()
  ));

create policy "Org staff can view all booking services"
  on booking_additional_services for select
  using (exists(
    select 1 from bookings b
    join facilities f on f.id = b.facility_id
    join memberships m on m.org_id = f.org_id
    where b.id = booking_additional_services.booking_id
    and m.user_id = auth.uid()
    and m.role in ('owner', 'admin', 'staff')
  ));

create policy "Org staff can manage booking services"
  on booking_additional_services for all
  using (exists(
    select 1 from bookings b
    join facilities f on f.id = b.facility_id
    join memberships m on m.org_id = f.org_id
    where b.id = booking_additional_services.booking_id
    and m.user_id = auth.uid()
    and m.role in ('owner', 'admin', 'staff')
  ));

-- Helper function: Get available services for a facility
create or replace function get_facility_services(p_facility_id uuid)
returns table(
  service_id uuid,
  name text,
  description text,
  category service_category,
  price_type service_price_type,
  price_cents bigint,
  is_included boolean,
  availability service_availability
)
language sql stable as
$$
  select
    s.id,
    s.name,
    s.description,
    s.category,
    s.price_type,
    coalesce(fas.override_price_cents, s.price_cents) as price_cents,
    coalesce(fas.is_included, false) as is_included,
    coalesce(fas.override_availability, s.availability) as availability
  from additional_services s
  left join facility_additional_services fas on fas.service_id = s.id and fas.facility_id = p_facility_id
  where s.org_id = (select org_id from facilities where id = p_facility_id)
    and coalesce(fas.override_availability, s.availability) in ('available', 'on-request')
  order by s.category, s.name
$$;

comment on function get_facility_services is 'Returns all available services for a facility with facility-specific pricing';

-- Trigger to update booking total when services are added
create or replace function update_booking_total_with_services()
returns trigger
language plpgsql
security definer
as $$
declare
  v_services_total bigint;
begin
  -- Calculate total of all approved services
  select coalesce(sum(total_price_cents), 0)
  into v_services_total
  from booking_additional_services
  where booking_id = coalesce(NEW.booking_id, OLD.booking_id)
    and status = 'approved';

  -- Update booking total (assuming base price is already set)
  -- Note: This is a simplified version; you may want more complex logic
  update bookings
  set price_breakdown = jsonb_set(
    coalesce(price_breakdown, '{}'::jsonb),
    '{additional_services}',
    to_jsonb(v_services_total)
  )
  where id = coalesce(NEW.booking_id, OLD.booking_id);

  return null;
end;
$$;

create trigger update_booking_services_total
after insert or update or delete on booking_additional_services
for each row execute function update_booking_total_with_services();

comment on trigger update_booking_services_total on booking_additional_services is 'Updates booking price breakdown when services change';
