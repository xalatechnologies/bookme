# Schema Gap Analysis: Frontend vs Backend

This document analyzes the differences between the frontend TypeScript types and the backend Supabase database schema, identifying what migrations need to be added to support all frontend features.

## Executive Summary

The frontend has **several advanced features** not yet supported by the backend schema:

1. **Zones/Areas** - Sub-facility bookable spaces (missing entirely)
2. **Recurring Bookings** - Pattern-based repeat bookings (missing)
3. **Group Bookings** - Collaborative booking with cost sharing (missing)
4. **Messaging System** - Inter-user communication (missing)
5. **Support Tickets** - Help desk system (missing)
6. **Additional Services** - Extra services/equipment (missing)
7. **Cart/Checkout** - Multi-item shopping cart (partially missing)
8. **Enhanced Facility Fields** - Missing several frontend fields

---

## 1. Zones/Areas Feature

### Frontend Schema (`src/types/booking.ts`)

```typescript
interface Zone {
  id: string;
  name: string;
  facilityId: string;
  capacity: number;
  pricePerHour: number;
  area?: number; // Square meters
  description?: string;
  amenities: readonly string[];
  availability: {
    monday: { start: string; end: string; };
    tuesday: { start: string; end: string; };
    // ... all week days
  };
}
```

### Backend Schema

**MISSING** - No `zones` table exists

### Required Migration

```sql
-- Migration: 20231026000001_add_zones.sql

-- Zones/Areas within facilities
create table zones (
  id uuid primary key default uuid_generate_v4(),
  facility_id uuid not null references facilities(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  capacity int not null default 1,
  area_sqm numeric, -- Area in square meters
  price_per_hour_cents bigint not null,
  amenities jsonb default '[]',
  status text not null default 'active', -- 'active' | 'inactive' | 'maintenance'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on zones(facility_id);
create index on zones(org_id);

-- Zone availability schedules (recurring weekly)
create table zone_availability (
  id uuid primary key default uuid_generate_v4(),
  zone_id uuid not null references zones(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sunday, 6=Saturday
  starts_time time not null,
  ends_time time not null,
  created_at timestamptz not null default now(),
  unique(zone_id, day_of_week)
);

create index on zone_availability(zone_id);

-- Update bookings to reference zones
alter table bookings
  add column zone_id uuid references zones(id) on delete restrict;

create index on bookings(zone_id);

-- Update pricing_rules to reference zones
alter table pricing_rules
  add column zone_id uuid references zones(id) on delete cascade;

create index on pricing_rules(zone_id);

-- RLS Policies for zones
alter table zones enable row level security;

create policy "Public can view active zones"
  on zones for select
  using (status = 'active');

create policy "Org members can manage zones"
  on zones for all
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
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

create policy "Org members can manage zone availability"
  on zone_availability for all
  using (exists(
    select 1 from zones z
    join memberships m on m.org_id = z.org_id
    where z.id = zone_availability.zone_id
    and m.user_id = auth.uid()
  ));
```

---

## 2. Recurring Bookings Feature

### Frontend Schema (`src/types/recurringBooking.ts`)

```typescript
interface RecurringBooking {
  id: string;
  userId: string;
  facilityId: string;
  zoneId: string;
  recurrencePattern: RecurrencePattern; // weekly, biweekly, monthly, custom
  startDate: Date;
  endDate?: Date;
  timeSlots: readonly string[];
  status: 'active' | 'paused' | 'cancelled';
  occurrences: readonly {
    id: string;
    date: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
  }[];
  pricing: {
    basePrice: number;
    totalPrice: number;
    discount: number;
  };
  // ... plus booking details
}
```

### Backend Schema

**MISSING** - No recurring booking support

### Required Migration

```sql
-- Migration: 20231026000002_add_recurring_bookings.sql

-- Recurrence pattern enum
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
  recurrence_interval int not null default 1, -- e.g., every 2 weeks
  recurrence_days int[] not null default '{}', -- Days of week (0-6) for weekly/biweekly
  recurrence_day_of_month int, -- For monthly (1-31)

  -- Date range
  starts_date date not null,
  ends_date date, -- null = indefinite

  -- Time slots (array of time ranges)
  time_slots jsonb not null, -- ["08:00-09:00", "09:00-10:00"]

  -- Booking details
  purpose text not null,
  attendees int not null default 1,
  activity_type text not null,
  actor_type text not null, -- 'private-person', 'lag-foreninger', etc.
  additional_info text,

  -- Status and pricing
  status text not null default 'active', -- 'active' | 'paused' | 'cancelled'
  base_price_cents bigint not null,
  total_price_cents bigint not null,
  discount_cents bigint not null default 0,
  currency text not null default 'NOK',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on recurring_bookings(user_id);
create index on recurring_bookings(facility_id);
create index on recurring_bookings(zone_id);
create index on recurring_bookings(status);

-- Individual occurrences of recurring bookings
create table recurring_booking_occurrences (
  id uuid primary key default uuid_generate_v4(),
  recurring_booking_id uuid not null references recurring_bookings(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null, -- Links to actual booking

  occurrence_date date not null,
  time_slot text not null, -- "08:00-09:00"
  status text not null default 'pending', -- 'pending' | 'confirmed' | 'cancelled' | 'skipped'
  price_cents bigint not null,
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

-- Add recurring booking reference to main bookings table
alter table bookings
  add column recurring_booking_id uuid references recurring_bookings(id) on delete set null;

create index on bookings(recurring_booking_id);

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

-- RPC function to generate occurrences
create or replace function generate_recurring_occurrences(
  p_recurring_booking_id uuid,
  p_max_occurrences int default 52 -- Limit to 1 year by default
)
returns void
language plpgsql
security definer
as $$
declare
  rb recurring_bookings%rowtype;
  occurrence_date date;
  slot text;
  occurrence_count int := 0;
begin
  select * into rb from recurring_bookings where id = p_recurring_booking_id;

  if rb.id is null then
    raise exception 'Recurring booking not found';
  end if;

  occurrence_date := rb.starts_date;

  while (rb.ends_date is null or occurrence_date <= rb.ends_date)
    and occurrence_count < p_max_occurrences loop

    -- Check if this date matches the recurrence pattern
    if rb.recurrence_frequency = 'weekly' and
       extract(dow from occurrence_date)::int = any(rb.recurrence_days) then

      -- Create occurrence for each time slot
      foreach slot in array (select jsonb_array_elements_text(rb.time_slots)) loop
        insert into recurring_booking_occurrences (
          recurring_booking_id, occurrence_date, time_slot,
          price_cents, currency
        ) values (
          rb.id, occurrence_date, slot,
          rb.base_price_cents, rb.currency
        ) on conflict (recurring_booking_id, occurrence_date, time_slot) do nothing;

        occurrence_count := occurrence_count + 1;
      end loop;
    end if;

    -- Advance to next potential date
    if rb.recurrence_frequency = 'daily' then
      occurrence_date := occurrence_date + (rb.recurrence_interval || ' days')::interval;
    elsif rb.recurrence_frequency in ('weekly', 'biweekly') then
      occurrence_date := occurrence_date + '1 day'::interval;
    elsif rb.recurrence_frequency = 'monthly' then
      occurrence_date := occurrence_date + (rb.recurrence_interval || ' months')::interval;
    end if;
  end loop;
end;
$$;
```

---

## 3. Group Bookings Feature

### Frontend Schema (`src/types/group.ts`)

```typescript
interface BookingGroup {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: readonly {
    userId: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
  }[];
  invitations: readonly {
    email: string;
    status: 'pending' | 'accepted' | 'declined';
    invitedAt: string;
  }[];
  bookings: readonly string[];
  settings: { /* notification and permission settings */ };
}
```

### Backend Schema

**MISSING** - No group booking support

### Required Migration

```sql
-- Migration: 20231026000003_add_group_bookings.sql

-- Group role enum
do $$ begin
  create type group_role as enum ('owner', 'admin', 'member');
exception when duplicate_object then null; end $$;

-- Booking groups
create table booking_groups (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete restrict,

  -- Settings
  allow_member_bookings boolean not null default false,
  require_approval boolean not null default false,
  max_bookings_per_member int not null default 10,

  -- Notification preferences
  notify_new_bookings boolean not null default true,
  notify_cancellations boolean not null default true,
  notify_member_changes boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on booking_groups(org_id);
create index on booking_groups(owner_id);

-- Group members
create table booking_group_members (
  group_id uuid not null references booking_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role group_role not null default 'member',
  joined_at timestamptz not null default now(),
  last_active_at timestamptz,
  booking_count int not null default 0,
  is_active boolean not null default true,
  primary key (group_id, user_id)
);

create index on booking_group_members(user_id);
create index on booking_group_members(group_id);

-- Group invitations
create table booking_group_invitations (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references booking_groups(id) on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending', -- 'pending' | 'accepted' | 'declined' | 'expired'
  invited_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  responded_at timestamptz,
  unique(group_id, email, status)
);

create index on booking_group_invitations(group_id);
create index on booking_group_invitations(email);
create index on booking_group_invitations(status);

-- Group bookings (links bookings to groups)
create table group_bookings (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references booking_groups(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,

  -- Cost sharing
  total_cost_cents bigint not null,
  cost_per_member_cents bigint not null,
  currency text not null default 'NOK',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(group_id, booking_id)
);

create index on group_bookings(group_id);
create index on group_bookings(booking_id);
create index on group_bookings(created_by);

-- Cost shares per member
create table group_booking_cost_shares (
  group_booking_id uuid not null references group_bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  share_cents bigint not null,
  paid boolean not null default false,
  paid_at timestamptz,
  payment_id uuid references payments(id) on delete set null,
  primary key (group_booking_id, user_id)
);

create index on group_booking_cost_shares(user_id);
create index on group_booking_cost_shares(paid);

-- Add group reference to bookings
alter table bookings
  add column group_id uuid references booking_groups(id) on delete set null;

create index on bookings(group_id);

-- RLS Policies
alter table booking_groups enable row level security;

create policy "Users can view groups they belong to"
  on booking_groups for select
  using (id in (
    select group_id from booking_group_members
    where user_id = auth.uid()
  ));

create policy "Users can create groups"
  on booking_groups for insert
  with check (owner_id = auth.uid());

create policy "Group owners can update groups"
  on booking_groups for update
  using (owner_id = auth.uid());

-- RLS for group members
alter table booking_group_members enable row level security;

create policy "Users can view group members of their groups"
  on booking_group_members for select
  using (group_id in (
    select group_id from booking_group_members
    where user_id = auth.uid()
  ));

create policy "Group owners/admins can manage members"
  on booking_group_members for all
  using (exists(
    select 1 from booking_group_members bgm
    where bgm.group_id = booking_group_members.group_id
    and bgm.user_id = auth.uid()
    and bgm.role in ('owner', 'admin')
  ));

-- RLS for group bookings
alter table group_bookings enable row level security;

create policy "Group members can view group bookings"
  on group_bookings for select
  using (group_id in (
    select group_id from booking_group_members
    where user_id = auth.uid()
  ));

create policy "Group members can create group bookings"
  on group_bookings for insert
  with check (
    group_id in (
      select group_id from booking_group_members
      where user_id = auth.uid()
    )
    and created_by = auth.uid()
  );
```

---

## 4. Messaging System

### Frontend Schema (`src/types/message.ts`)

```typescript
interface MessageThread {
  id: string;
  subject: string;
  participants: readonly { id: string; name: string; type: 'tenant' | 'landlord'; }[];
  relatedBookingId?: string;
  status: 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: readonly string[];
}

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments?: readonly { /* file data */ }[];
  status: 'sent' | 'delivered' | 'read';
}
```

### Backend Schema

**MISSING** - No messaging system

### Required Migration

```sql
-- Migration: 20231026000004_add_messaging.sql

-- Message thread
create table message_threads (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  subject text not null,
  related_booking_id uuid references bookings(id) on delete set null,
  related_facility_id uuid references facilities(id) on delete set null,
  status text not null default 'active', -- 'active' | 'resolved' | 'closed'
  priority text not null default 'medium', -- 'low' | 'medium' | 'high'
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on message_threads(org_id);
create index on message_threads(status);
create index on message_threads(priority);
create index on message_threads(related_booking_id);
create index on message_threads(last_message_at desc);

-- Thread participants
create table message_thread_participants (
  thread_id uuid not null references message_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_type text not null, -- 'user' | 'admin'
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  is_active boolean not null default true,
  primary key (thread_id, user_id)
);

create index on message_thread_participants(user_id);
create index on message_thread_participants(thread_id);

-- Messages
create table messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references message_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  sender_type text not null, -- 'user' | 'admin'
  recipient_id uuid not null references auth.users(id) on delete restrict,
  content text not null,
  status text not null default 'sent', -- 'sent' | 'delivered' | 'read'
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index on messages(thread_id);
create index on messages(sender_id);
create index on messages(recipient_id);
create index on messages(status);
create index on messages(created_at desc);

-- Message attachments
create table message_attachments (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references messages(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  storage_path text not null, -- Path in Supabase Storage
  uploaded_at timestamptz not null default now()
);

create index on message_attachments(message_id);

-- RLS Policies
alter table message_threads enable row level security;

create policy "Users can view threads they participate in"
  on message_threads for select
  using (id in (
    select thread_id from message_thread_participants
    where user_id = auth.uid()
  ));

alter table messages enable row level security;

create policy "Users can view messages in their threads"
  on messages for select
  using (thread_id in (
    select thread_id from message_thread_participants
    where user_id = auth.uid()
  ));

create policy "Users can send messages in their threads"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and thread_id in (
      select thread_id from message_thread_participants
      where user_id = auth.uid()
    )
  );
```

---

## 5. Support Ticket System

### Frontend Schema (`src/types/support.ts`)

```typescript
interface SupportTicket {
  id: string;
  userId: string;
  category: 'booking' | 'technical' | 'billing' | 'feedback' | 'other';
  subject: string;
  status: 'open' | 'in-progress' | 'waiting-user' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  replies: readonly { /* conversation */ }[];
  attachments?: readonly { /* files */ }[];
}
```

### Backend Schema

**MISSING** - No support ticket system

### Required Migration

```sql
-- Migration: 20231026000005_add_support_tickets.sql

-- Support ticket categories and statuses
do $$ begin
  create type ticket_category as enum ('booking', 'technical', 'billing', 'feedback', 'other');
  create type ticket_status as enum ('open', 'in-progress', 'waiting-user', 'resolved', 'closed');
  create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null; end $$;

-- Support tickets
create table support_tickets (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,

  category ticket_category not null,
  subject text not null,
  description text not null,
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'medium',

  assigned_to uuid references auth.users(id) on delete set null,
  related_booking_id uuid references bookings(id) on delete set null,

  tags text[] default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  closed_at timestamptz
);

create index on support_tickets(user_id);
create index on support_tickets(org_id);
create index on support_tickets(status);
create index on support_tickets(priority);
create index on support_tickets(assigned_to);
create index on support_tickets(category);
create index on support_tickets(created_at desc);

-- Ticket replies
create table support_ticket_replies (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  author_type text not null, -- 'user' | 'admin'
  content text not null,
  created_at timestamptz not null default now()
);

create index on support_ticket_replies(ticket_id);
create index on support_ticket_replies(author_id);
create index on support_ticket_replies(created_at);

-- Ticket attachments
create table support_ticket_attachments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  reply_id uuid references support_ticket_replies(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  storage_path text not null,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  uploaded_at timestamptz not null default now()
);

create index on support_ticket_attachments(ticket_id);
create index on support_ticket_attachments(reply_id);

-- RLS Policies
alter table support_tickets enable row level security;

create policy "Users can view own tickets"
  on support_tickets for select
  using (user_id = auth.uid());

create policy "Users can create tickets"
  on support_tickets for insert
  with check (user_id = auth.uid());

create policy "Org staff can view org tickets"
  on support_tickets for select
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
    and role in ('owner', 'admin', 'staff')
  ));

create policy "Assigned staff can update tickets"
  on support_tickets for update
  using (assigned_to = auth.uid() or user_id = auth.uid());

-- RLS for replies
alter table support_ticket_replies enable row level security;

create policy "Users can view replies on their tickets"
  on support_ticket_replies for select
  using (exists(
    select 1 from support_tickets st
    where st.id = support_ticket_replies.ticket_id
    and (st.user_id = auth.uid() or st.assigned_to = auth.uid())
  ));

create policy "Users can reply to their tickets"
  on support_ticket_replies for insert
  with check (
    author_id = auth.uid()
    and exists(
      select 1 from support_tickets st
      where st.id = ticket_id
      and st.user_id = auth.uid()
    )
  );
```

---

## 6. Enhanced Facility Fields

### Frontend Facility Type (`src/data/coreFacilities.ts`)

```typescript
interface Facility {
  id: string;
  name: string;
  description: string;
  type: string; // "Idrettshall", "Kulturhus", "Møterom"
  location: string; // "Drammen Sentrum"
  address: string;
  capacity: number;
  pricePerHour: number;
  amenities: readonly string[];
  images: readonly string[];
  availability: { /* weekly schedule */ };
  coordinates: { lat: number; lng: number; };
  rating: number;
  reviewCount: number;
  area?: string;
  accessibilityFeatures?: readonly string[];
}
```

### Backend Facility Schema

```sql
create table facilities (
  id uuid,
  org_id uuid,
  title text, -- ❌ Frontend uses "name"
  description text, -- ✅
  status text, -- ✅ 'published' | 'draft'
  address text, -- ✅
  city text, -- ⚠️ Frontend has as part of "location"
  postal_code text, -- ⚠️ Missing in frontend
  country text, -- ⚠️ Missing in frontend
  amenities jsonb, -- ✅
  images jsonb, -- ✅
  -- ❌ Missing: type, capacity, pricePerHour, rating, reviewCount
  -- ❌ Missing: area, accessibilityFeatures
  -- ❌ Missing: availability (weekly schedule)
);
```

### Required Migration

```sql
-- Migration: 20231026000006_enhance_facilities.sql

-- Add missing facility fields
alter table facilities
  add column facility_type text, -- "Idrettshall", "Kulturhus", etc.
  add column capacity int,
  add column rating numeric(2,1) check (rating >= 0 and rating <= 5),
  add column review_count int not null default 0,
  add column area_description text,
  add column accessibility_features jsonb default '[]';

-- Rename title to name for consistency
alter table facilities rename column title to name;

-- Add indexes
create index on facilities(facility_type);
create index on facilities(capacity);
create index on facilities(rating desc);

-- Update existing facilities (if needed)
update facilities set
  facility_type = 'General',
  capacity = 50,
  rating = 4.0,
  review_count = 0
where facility_type is null;

-- Make some fields not null after initial update
alter table facilities
  alter column facility_type set not null,
  alter column capacity set not null;
```

---

## 7. Additional Services/Equipment

### Frontend Schema (`src/data/additionalServices/dummyServices.ts`)

```typescript
interface AdditionalService {
  id: string;
  name: string;
  description: string;
  category: 'equipment' | 'catering' | 'technical' | 'cleaning' | 'security';
  priceType: 'per-hour' | 'per-day' | 'flat-rate';
  price: number;
  availability: 'available' | 'on-request' | 'unavailable';
  facilityIds?: readonly string[]; // Available at specific facilities
}
```

### Backend Schema

**MISSING** - No additional services table

### Required Migration

```sql
-- Migration: 20231026000007_add_additional_services.sql

-- Additional services/equipment
do $$ begin
  create type service_category as enum ('equipment', 'catering', 'technical', 'cleaning', 'security', 'other');
  create type service_price_type as enum ('per-hour', 'per-day', 'per-booking', 'flat-rate');
  create type service_availability as enum ('available', 'on-request', 'unavailable');
exception when duplicate_object then null; end $$;

create table additional_services (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  category service_category not null,
  price_type service_price_type not null,
  price_cents bigint not null,
  currency text not null default 'NOK',
  availability service_availability not null default 'available',
  min_quantity int not null default 1,
  max_quantity int,
  requires_approval boolean not null default false,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on additional_services(org_id);
create index on additional_services(category);
create index on additional_services(availability);

-- Service availability per facility (if not org-wide)
create table facility_additional_services (
  facility_id uuid not null references facilities(id) on delete cascade,
  service_id uuid not null references additional_services(id) on delete cascade,
  is_included boolean not null default false, -- Included in base price
  override_price_cents bigint, -- Override org-level price
  primary key (facility_id, service_id)
);

create index on facility_additional_services(facility_id);
create index on facility_additional_services(service_id);

-- Booking services (what was ordered)
create table booking_additional_services (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  service_id uuid not null references additional_services(id) on delete restrict,
  quantity int not null default 1,
  price_cents bigint not null,
  currency text not null default 'NOK',
  notes text,
  created_at timestamptz not null default now()
);

create index on booking_additional_services(booking_id);
create index on booking_additional_services(service_id);

-- RLS Policies
alter table additional_services enable row level security;

create policy "Public can view available services"
  on additional_services for select
  using (availability = 'available');

create policy "Org members can manage services"
  on additional_services for all
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
  ));
```

---

## 8. Admin/Notification Enhancements

### Frontend Types Missing in Backend

1. **History/Audit** - More detailed than current audit_events
2. **Notification Preferences** - Per-user notification settings
3. **Calendar Events** - Facility-specific calendar integration

### Required Migration

```sql
-- Migration: 20231026000008_add_notification_preferences.sql

-- User notification preferences
create table user_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- Email notifications
  email_booking_confirmation boolean not null default true,
  email_booking_reminder boolean not null default true,
  email_booking_cancellation boolean not null default true,
  email_messages boolean not null default true,
  email_system_updates boolean not null default false,

  -- Browser/Push notifications
  browser_enabled boolean not null default false,
  browser_booking_reminder boolean not null default true,
  browser_messages boolean not null default true,

  -- SMS notifications (future)
  sms_enabled boolean not null default false,
  sms_booking_confirmation boolean not null default false,
  sms_booking_reminder boolean not null default false,

  -- Digest settings
  daily_digest boolean not null default false,
  weekly_digest boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table user_notification_preferences enable row level security;

create policy "Users can manage own preferences"
  on user_notification_preferences for all
  using (user_id = auth.uid());
```

---

## Summary of Required Migrations

### Critical (Core Functionality)

1. ✅ **Zones/Areas** - `20231026000001_add_zones.sql`
2. ✅ **Recurring Bookings** - `20231026000002_add_recurring_bookings.sql`
3. ✅ **Enhanced Facility Fields** - `20231026000006_enhance_facilities.sql`

### Important (Advanced Features)

4. ✅ **Group Bookings** - `20231026000003_add_group_bookings.sql`
5. ✅ **Additional Services** - `20231026000007_add_additional_services.sql`

### Nice to Have (Support Features)

6. ✅ **Messaging System** - `20231026000004_add_messaging.sql`
7. ✅ **Support Tickets** - `20231026000005_add_support_tickets.sql`
8. ✅ **Notification Preferences** - `20231026000008_add_notification_preferences.sql`

---

## Implementation Priority

### Phase 1: Core Booking Features (Week 1)
- Zones/Areas
- Enhanced Facility Fields
- Additional Services

### Phase 2: Advanced Bookings (Week 2)
- Recurring Bookings
- Group Bookings

### Phase 3: Communication (Week 3)
- Messaging System
- Support Tickets
- Notification Preferences

---

## Testing Strategy

After each migration:

1. **Apply migration** to local Supabase
2. **Verify RLS policies** with test users
3. **Test with frontend** using integration guide
4. **Check performance** with indexes
5. **Document edge cases** and limitations

---

## Notes

- All migrations include RLS policies for multi-tenant security
- All monetary values stored as `bigint` cents (NOK)
- All dates/times use `timestamptz` with organization timezone
- All arrays/JSON use PostgreSQL native types for querying
- Foreign key cascades prevent orphaned records
- Indexes added for common query patterns

---

**Next Steps**: Review this analysis and prioritize which migrations to implement first based on business needs.
