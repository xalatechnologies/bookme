-- Migration: Add Recurring Bookings Support
-- Description: Enables pattern-based recurring bookings with occurrence tracking

-- Recurrence frequency enum
do $$ begin
  create type recurrence_frequency as enum ('daily', 'weekly', 'biweekly', 'monthly', 'custom');
exception when duplicate_object then null; end $$;

-- Recurring booking series
create table recurring_bookings (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  facility_id uuid not null references facilities(id) on delete restrict,
  zone_id uuid references zones(id) on delete restrict,

  -- Recurrence configuration
  recurrence_frequency recurrence_frequency not null default 'weekly',
  recurrence_interval int not null default 1 check (recurrence_interval > 0), -- e.g., every 2 weeks
  recurrence_days int[] not null default '{}', -- Days of week (0-6) for weekly/biweekly
  recurrence_day_of_month int check (recurrence_day_of_month between 1 and 31), -- For monthly

  -- Date range
  starts_date date not null,
  ends_date date, -- null = indefinite (will use max_occurrences)
  max_occurrences int check (max_occurrences is null or max_occurrences > 0),

  -- Time slots (array of time ranges)
  time_slots jsonb not null, -- ["08:00-09:00", "09:00-10:00"]

  -- Booking details
  purpose text not null,
  attendees int not null default 1 check (attendees > 0),
  activity_type text not null,
  actor_type text not null check (actor_type in (
    'private-person', 'lag-foreninger', 'paraply', 'private-firma', 'kommunale-enheter'
  )),
  additional_info text,

  -- Status and pricing
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  base_price_cents bigint not null check (base_price_cents >= 0),
  total_price_cents bigint not null check (total_price_cents >= 0),
  discount_cents bigint not null default 0 check (discount_cents >= 0),
  currency text not null default 'NOK',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on recurring_bookings(user_id);
create index on recurring_bookings(facility_id);
create index on recurring_bookings(zone_id);
create index on recurring_bookings(org_id);
create index on recurring_bookings(status);
create index on recurring_bookings(starts_date, ends_date);

comment on table recurring_bookings is 'Recurring booking series with pattern definition';
comment on column recurring_bookings.recurrence_days is 'Array of day numbers (0=Sunday through 6=Saturday) for weekly/biweekly patterns';
comment on column recurring_bookings.time_slots is 'JSON array of time slot strings like ["08:00-09:00"]';

-- Individual occurrences of recurring bookings
create table recurring_booking_occurrences (
  id uuid primary key default uuid_generate_v4(),
  recurring_booking_id uuid not null references recurring_bookings(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null, -- Links to actual confirmed booking

  occurrence_date date not null,
  time_slot text not null, -- "08:00-09:00"
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'skipped')),
  price_cents bigint not null check (price_cents >= 0),
  currency text not null default 'NOK',

  cancelled_at timestamptz,
  cancellation_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(recurring_booking_id, occurrence_date, time_slot)
);

create index on recurring_booking_occurrences(recurring_booking_id);
create index on recurring_booking_occurrences(booking_id);
create index on recurring_booking_occurrences(occurrence_date);
create index on recurring_booking_occurrences(status);
create index on recurring_booking_occurrences(recurring_booking_id, occurrence_date);

comment on table recurring_booking_occurrences is 'Individual occurrences generated from recurring booking patterns';
comment on column recurring_booking_occurrences.status is 'pending = not yet confirmed, confirmed = booking created, cancelled = user cancelled, skipped = not created';

-- Add recurring booking reference to main bookings table
alter table bookings
  add column recurring_booking_id uuid references recurring_bookings(id) on delete set null,
  add column is_recurring boolean not null default false;

create index on bookings(recurring_booking_id);
create index on bookings(is_recurring);

comment on column bookings.recurring_booking_id is 'If this booking is part of a recurring series';
comment on column bookings.is_recurring is 'Quick flag to identify recurring bookings';

-- RLS Policies
alter table recurring_bookings enable row level security;

create policy "Users can view own recurring bookings"
  on recurring_bookings for select
  using (user_id = auth.uid());

create policy "Users can create recurring bookings"
  on recurring_bookings for insert
  with check (user_id = auth.uid());

create policy "Users can update own recurring bookings"
  on recurring_bookings for update
  using (user_id = auth.uid());

create policy "Org members can view org recurring bookings"
  on recurring_bookings for select
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
    and role in ('owner', 'admin', 'staff')
  ));

-- RLS for occurrences
alter table recurring_booking_occurrences enable row level security;

create policy "Users can view own occurrences"
  on recurring_booking_occurrences for select
  using (exists(
    select 1 from recurring_bookings rb
    where rb.id = recurring_booking_occurrences.recurring_booking_id
    and rb.user_id = auth.uid()
  ));

create policy "Users can update own occurrences"
  on recurring_booking_occurrences for update
  using (exists(
    select 1 from recurring_bookings rb
    where rb.id = recurring_booking_occurrences.recurring_booking_id
    and rb.user_id = auth.uid()
  ));

create policy "Org staff can view org occurrences"
  on recurring_booking_occurrences for select
  using (exists(
    select 1 from recurring_bookings rb
    where rb.id = recurring_booking_occurrences.recurring_booking_id
    and rb.org_id in (
      select org_id from memberships
      where user_id = auth.uid()
      and role in ('owner', 'admin', 'staff')
    )
  ));

-- RPC function to generate occurrences for a recurring booking
create or replace function generate_recurring_occurrences(
  p_recurring_booking_id uuid,
  p_max_occurrences int default 52 -- Limit to 1 year by default
)
returns int
language plpgsql
security definer
as $$
declare
  rb recurring_bookings%rowtype;
  occurrence_date date;
  slot text;
  occurrence_count int := 0;
  days_to_check int := 0;
  max_days int := 730; -- 2 years max
begin
  select * into rb from recurring_bookings where id = p_recurring_booking_id;

  if rb.id is null then
    raise exception 'Recurring booking not found';
  end if;

  if rb.status != 'active' then
    raise exception 'Recurring booking is not active';
  end if;

  occurrence_date := rb.starts_date;

  while (rb.ends_date is null or occurrence_date <= rb.ends_date)
    and occurrence_count < p_max_occurrences
    and days_to_check < max_days loop

    -- Check if this date matches the recurrence pattern
    case rb.recurrence_frequency
      when 'daily' then
        if (occurrence_date - rb.starts_date) % rb.recurrence_interval = 0 then
          -- Create occurrence for each time slot
          foreach slot in array (select jsonb_array_elements_text(rb.time_slots)) loop
            insert into recurring_booking_occurrences (
              recurring_booking_id, occurrence_date, time_slot,
              price_cents, currency
            ) values (
              rb.id, occurrence_date, slot,
              rb.base_price_cents, rb.currency
            ) on conflict (recurring_booking_id, occurrence_date, time_slot) do nothing;

            if found then
              occurrence_count := occurrence_count + 1;
            end if;
          end loop;
        end if;
        occurrence_date := occurrence_date + '1 day'::interval;

      when 'weekly', 'biweekly' then
        if extract(dow from occurrence_date)::int = any(rb.recurrence_days) then
          -- For biweekly, check if it's the right week
          if rb.recurrence_frequency = 'weekly' or
             ((occurrence_date - rb.starts_date) / 7) % rb.recurrence_interval = 0 then

            foreach slot in array (select jsonb_array_elements_text(rb.time_slots)) loop
              insert into recurring_booking_occurrences (
                recurring_booking_id, occurrence_date, time_slot,
                price_cents, currency
              ) values (
                rb.id, occurrence_date, slot,
                rb.base_price_cents, rb.currency
              ) on conflict (recurring_booking_id, occurrence_date, time_slot) do nothing;

              if found then
                occurrence_count := occurrence_count + 1;
              end if;
            end loop;
          end if;
        end if;
        occurrence_date := occurrence_date + '1 day'::interval;

      when 'monthly' then
        if extract(day from occurrence_date)::int = rb.recurrence_day_of_month then
          foreach slot in array (select jsonb_array_elements_text(rb.time_slots)) loop
            insert into recurring_booking_occurrences (
              recurring_booking_id, occurrence_date, time_slot,
              price_cents, currency
            ) values (
              rb.id, occurrence_date, slot,
              rb.base_price_cents, rb.currency
            ) on conflict (recurring_booking_id, occurrence_date, time_slot) do nothing;

            if found then
              occurrence_count := occurrence_count + 1;
            end if;
          end loop;
        end if;
        occurrence_date := occurrence_date + '1 day'::interval;

      else
        raise exception 'Unsupported recurrence frequency: %', rb.recurrence_frequency;
    end case;

    days_to_check := days_to_check + 1;
  end loop;

  return occurrence_count;
end;
$$;

comment on function generate_recurring_occurrences is 'Generates occurrence records for a recurring booking pattern';

-- Trigger to generate occurrences when recurring booking is created
create or replace function trigger_generate_occurrences()
returns trigger
language plpgsql
as $$
begin
  if NEW.status = 'active' then
    perform generate_recurring_occurrences(NEW.id);
  end if;
  return NEW;
end;
$$;

create trigger after_recurring_booking_insert
after insert on recurring_bookings
for each row execute function trigger_generate_occurrences();

comment on trigger after_recurring_booking_insert on recurring_bookings is 'Automatically generates occurrences when recurring booking is created';

-- Function to confirm an occurrence (create actual booking)
create or replace function confirm_recurring_occurrence(p_occurrence_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_occurrence recurring_booking_occurrences%rowtype;
  v_recurring recurring_bookings%rowtype;
  v_booking_id uuid;
  v_starts timestamptz;
  v_ends timestamptz;
  v_tz text;
begin
  select * into v_occurrence from recurring_booking_occurrences where id = p_occurrence_id;
  if v_occurrence.id is null then
    raise exception 'Occurrence not found';
  end if;

  if v_occurrence.status != 'pending' then
    raise exception 'Occurrence is not in pending status';
  end if;

  select * into v_recurring from recurring_bookings where id = v_occurrence.recurring_booking_id;

  -- Get organization timezone
  select o.timezone into v_tz
  from facilities f
  join organizations o on o.id = f.org_id
  where f.id = v_recurring.facility_id;

  -- Parse time slot and create timestamps
  v_starts := (v_occurrence.occurrence_date::text || ' ' || split_part(v_occurrence.time_slot, '-', 1))::timestamp at time zone v_tz;
  v_ends := (v_occurrence.occurrence_date::text || ' ' || split_part(v_occurrence.time_slot, '-', 2))::timestamp at time zone v_tz;

  -- Create the actual booking
  insert into bookings (
    org_id, user_id, facility_id, zone_id,
    starts_at, ends_at,
    total_cents, currency,
    notes, status,
    recurring_booking_id, is_recurring
  ) values (
    v_recurring.org_id, v_recurring.user_id, v_recurring.facility_id, v_recurring.zone_id,
    v_starts, v_ends,
    v_occurrence.price_cents, v_occurrence.currency,
    v_recurring.purpose, 'pending',
    v_recurring.id, true
  ) returning id into v_booking_id;

  -- Update occurrence
  update recurring_booking_occurrences
  set status = 'confirmed',
      booking_id = v_booking_id,
      updated_at = now()
  where id = p_occurrence_id;

  return v_booking_id;
end;
$$;

comment on function confirm_recurring_occurrence is 'Confirms a recurring occurrence by creating an actual booking';
