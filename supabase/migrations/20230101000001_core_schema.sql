-- Roles at platform and org scopes (platform role lives in JWT; org role lives in memberships)
do $$ begin
  create type platform_role as enum ('platform_admin', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type org_role as enum ('owner','admin','staff','customer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending','awaiting_payment','paid','cancelled','expired','completed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_channel as enum ('email','sms','none');
exception when duplicate_object then null; end $$;

-- Tenancy anchor
create table organizations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique not null,
  timezone      text not null default 'Europe/Oslo',
  status        text not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Users' profile mirror (non-PII; auth.users holds emails)
create table profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone        text,
  default_org  uuid references organizations(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Memberships: org-scoped roles
create table memberships (
  org_id     uuid not null references organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       org_role not null default 'customer',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- Catalog
create table facilities (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references organizations(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'draft',     -- 'published' exposes publicly
  address      text,
  city         text,
  postal_code  text,
  country      text default 'NO',
  -- We'll add the geospatial point later after PostGIS is enabled
  amenities    jsonb default '[]',
  images       jsonb default '[]',                -- fallback; we still use storage
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table tags (
  id        uuid primary key default uuid_generate_v4(),
  name      text not null unique
);

create table facility_tags (
  facility_id uuid not null references facilities(id) on delete cascade,
  tag_id      uuid not null references tags(id) on delete cascade,
  primary key (facility_id, tag_id)
);

-- Availability rules and blackouts
create table availability_rules (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references organizations(id) on delete cascade,
  facility_id  uuid not null references facilities(id) on delete cascade,
  -- Recurring spec: day_of_week 0..6, local start/end (stored as time without tz)
  recurring    boolean not null default true,
  day_of_week  int check (day_of_week between 0 and 6),
  starts_time  time,
  ends_time    time,
  -- Ad-hoc window (UTC)
  starts_at    timestamptz,
  ends_at      timestamptz,
  capacity     int not null default 1,
  created_at   timestamptz not null default now()
);

create table blackouts (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references organizations(id) on delete cascade,
  facility_id  uuid not null references facilities(id) on delete cascade,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  reason       text,
  created_at   timestamptz not null default now()
);

-- Booking core
create table bookings (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references organizations(id) on delete cascade,
  facility_id   uuid not null references facilities(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete restrict,
  status        booking_status not null default 'pending',
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  total_cents   bigint not null check (total_cents >= 0),
  currency      text not null default 'NOK',
  price_breakdown jsonb,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Prevent overlapping confirmed bookings using exclusion; we allow overlap for pending/awaiting_payment
-- We enforce via trigger + unique partial index approach
create index on bookings (facility_id, starts_at, ends_at);
create index on bookings (status);
create index on bookings (user_id);
-- Removed problematic GiST index for now

-- Payments (webhook-driven)
create table payments (
  id            uuid primary key default uuid_generate_v4(),
  booking_id    uuid not null references bookings(id) on delete cascade,
  provider      text not null,                    -- 'stripe' | 'vipps' | ...
  intent_id     text not null,
  amount_cents  bigint not null,
  currency      text not null default 'NOK',
  status        text not null,                    -- 'initiated' | 'succeeded' | 'failed' | 'refunded'
  raw           jsonb,
  created_at    timestamptz not null default now(),
  unique (provider, intent_id)
);

-- Reviews and favorites
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references organizations(id) on delete cascade,
  facility_id uuid not null references facilities(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  booking_id  uuid not null references bookings(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (booking_id)  -- one review per booking
);

create table favorites (
  user_id     uuid not null references auth.users(id) on delete cascade,
  facility_id uuid not null references facilities(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, facility_id)
);

-- Notifications (outbox for edge function worker)
create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  channel     notification_channel not null default 'email',
  subject     text not null,
  body        text not null,
  send_at     timestamptz not null default now(),
  meta        jsonb,
  created_at  timestamptz not null default now(),
  sent_at     timestamptz
);

-- Auditing
create table audit_events (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid references organizations(id) on delete set null,
  actor_id   uuid references auth.users(id) on delete set null,
  action     text not null,                 -- 'booking.create' | 'booking.status_change' | ...
  entity     text not null,                 -- 'booking' | 'facility' | ...
  entity_id  uuid not null,
  details    jsonb,
  created_at timestamptz not null default now()
);

-- Error log for webhooks/jobs
create table error_log (
  id         uuid primary key default uuid_generate_v4(),
  scope      text not null,                 -- 'payments_webhook' | 'scheduler' | ...
  ref        text,
  payload    jsonb,
  error      text,
  created_at timestamptz not null default now(),
  retry_after timestamptz
);

create table pricing_rules (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references organizations(id) on delete cascade,
  facility_id  uuid not null references facilities(id) on delete cascade,
  price_per_hour_cents bigint not null check (price_per_hour_cents >= 0),
  min_hours    numeric not null default 1.0 check (min_hours > 0),
  weekend_multiplier numeric not null default 1.0,
  peak_multiplier    numeric not null default 1.0,
  peak_starts  time,         -- optional local time window
  peak_ends    time,
  currency     text not null default 'NOK',
  created_at   timestamptz not null default now()
);

create index on pricing_rules (facility_id);