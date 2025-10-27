-- Migration: Add Support Ticket System
-- Description: Help desk system with categories, priorities, assignments, and replies

-- Support ticket enums
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
create index on support_tickets(status, priority);

comment on table support_tickets is 'Support tickets for help desk system';

-- Ticket replies/comments
create table support_ticket_replies (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  author_type text not null check (author_type in ('user', 'admin')),
  content text not null,
  is_internal boolean not null default false, -- Internal notes not visible to user
  created_at timestamptz not null default now()
);

create index on support_ticket_replies(ticket_id);
create index on support_ticket_replies(author_id);
create index on support_ticket_replies(created_at);
create index on support_ticket_replies(ticket_id, created_at);

comment on table support_ticket_replies is 'Replies and comments on support tickets';
comment on column support_ticket_replies.is_internal is 'If true, only visible to staff';

-- Ticket attachments (stored in Supabase Storage)
create table support_ticket_attachments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  reply_id uuid references support_ticket_replies(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size bigint not null check (file_size > 0),
  storage_path text not null,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  uploaded_at timestamptz not null default now()
);

create index on support_ticket_attachments(ticket_id);
create index on support_ticket_attachments(reply_id);
create index on support_ticket_attachments(uploaded_by);

comment on table support_ticket_attachments is 'File attachments for tickets and replies';

-- Ticket activity log
create table support_ticket_activity (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  activity_type text not null check (activity_type in (
    'created', 'updated', 'assigned', 'replied', 'status_changed',
    'priority_changed', 'resolved', 'closed', 'reopened'
  )),
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index on support_ticket_activity(ticket_id);
create index on support_ticket_activity(user_id);
create index on support_ticket_activity(created_at desc);

comment on table support_ticket_activity is 'Activity log for ticket changes';

-- Ticket SLA tracking
create table support_ticket_sla (
  ticket_id uuid primary key references support_tickets(id) on delete cascade,
  response_due_at timestamptz not null,
  resolution_due_at timestamptz not null,
  first_response_at timestamptz,
  breach_count int not null default 0,
  is_breached boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on support_ticket_sla(response_due_at);
create index on support_ticket_sla(resolution_due_at);
create index on support_ticket_sla(is_breached);

comment on table support_ticket_sla is 'Service Level Agreement tracking for tickets';

-- RLS Policies for support_tickets
alter table support_tickets enable row level security;

create policy "Users can view own tickets"
  on support_tickets for select
  using (user_id = auth.uid());

create policy "Users can create tickets"
  on support_tickets for insert
  with check (user_id = auth.uid());

create policy "Users can update own tickets"
  on support_tickets for update
  using (user_id = auth.uid());

create policy "Org staff can view all org tickets"
  on support_tickets for select
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
    and role in ('owner', 'admin', 'staff')
  ));

create policy "Assigned staff can update tickets"
  on support_tickets for update
  using (assigned_to = auth.uid() or org_id in (
    select org_id from memberships
    where user_id = auth.uid()
    and role in ('owner', 'admin')
  ));

-- RLS for support_ticket_replies
alter table support_ticket_replies enable row level security;

create policy "Users can view non-internal replies on their tickets"
  on support_ticket_replies for select
  using (
    (not is_internal and exists(
      select 1 from support_tickets st
      where st.id = support_ticket_replies.ticket_id
      and st.user_id = auth.uid()
    ))
    or exists(
      select 1 from support_tickets st
      join memberships m on m.org_id = st.org_id
      where st.id = support_ticket_replies.ticket_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin', 'staff')
    )
  );

create policy "Users can reply to their tickets"
  on support_ticket_replies for insert
  with check (
    author_id = auth.uid()
    and author_type = 'user'
    and not is_internal
    and exists(
      select 1 from support_tickets st
      where st.id = ticket_id
      and st.user_id = auth.uid()
    )
  );

create policy "Staff can reply to org tickets"
  on support_ticket_replies for insert
  with check (
    author_id = auth.uid()
    and exists(
      select 1 from support_tickets st
      join memberships m on m.org_id = st.org_id
      where st.id = ticket_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin', 'staff')
    )
  );

-- RLS for support_ticket_attachments
alter table support_ticket_attachments enable row level security;

create policy "Users can view attachments on their tickets"
  on support_ticket_attachments for select
  using (exists(
    select 1 from support_tickets st
    where st.id = support_ticket_attachments.ticket_id
    and (st.user_id = auth.uid() or st.org_id in (
      select org_id from memberships
      where user_id = auth.uid()
      and role in ('owner', 'admin', 'staff')
    ))
  ));

create policy "Users can upload attachments to their tickets"
  on support_ticket_attachments for insert
  with check (
    uploaded_by = auth.uid()
    and exists(
      select 1 from support_tickets st
      where st.id = ticket_id
      and st.user_id = auth.uid()
    )
  );

-- RLS for support_ticket_activity
alter table support_ticket_activity enable row level security;

create policy "Org staff can view ticket activity"
  on support_ticket_activity for select
  using (exists(
    select 1 from support_tickets st
    join memberships m on m.org_id = st.org_id
    where st.id = support_ticket_activity.ticket_id
    and m.user_id = auth.uid()
    and m.role in ('owner', 'admin', 'staff')
  ));

-- Trigger to log ticket creation
create or replace function log_ticket_activity()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    insert into support_ticket_activity (ticket_id, user_id, activity_type, description)
    values (NEW.id, NEW.user_id, 'created', 'Ticket created');
  elsif TG_OP = 'UPDATE' then
    if NEW.status != OLD.status then
      insert into support_ticket_activity (ticket_id, user_id, activity_type, description, metadata)
      values (NEW.id, auth.uid(), 'status_changed',
              format('Status changed from %s to %s', OLD.status, NEW.status),
              jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    end if;

    if NEW.priority != OLD.priority then
      insert into support_ticket_activity (ticket_id, user_id, activity_type, description, metadata)
      values (NEW.id, auth.uid(), 'priority_changed',
              format('Priority changed from %s to %s', OLD.priority, NEW.priority),
              jsonb_build_object('old_priority', OLD.priority, 'new_priority', NEW.priority));
    end if;

    if NEW.assigned_to is distinct from OLD.assigned_to then
      insert into support_ticket_activity (ticket_id, user_id, activity_type, description, metadata)
      values (NEW.id, auth.uid(), 'assigned',
              'Ticket assigned',
              jsonb_build_object('assigned_to', NEW.assigned_to));
    end if;

    if NEW.status = 'resolved' and OLD.status != 'resolved' then
      update support_tickets set resolved_at = now() where id = NEW.id;
    end if;

    if NEW.status = 'closed' and OLD.status != 'closed' then
      update support_tickets set closed_at = now() where id = NEW.id;
    end if;
  end if;

  return NEW;
end;
$$;

create trigger ticket_activity_trigger
after insert or update on support_tickets
for each row execute function log_ticket_activity();

comment on trigger ticket_activity_trigger on support_tickets is 'Logs ticket activity changes';

-- Trigger to log replies
create or replace function log_ticket_reply()
returns trigger
language plpgsql
as $$
begin
  insert into support_ticket_activity (ticket_id, user_id, activity_type, description)
  values (NEW.ticket_id, NEW.author_id, 'replied', 'New reply added');

  -- Update ticket updated_at
  update support_tickets
  set updated_at = now()
  where id = NEW.ticket_id;

  return NEW;
end;
$$;

create trigger ticket_reply_trigger
after insert on support_ticket_replies
for each row execute function log_ticket_reply();

comment on trigger ticket_reply_trigger on support_ticket_replies is 'Logs when replies are added';

-- Helper function: Calculate SLA deadlines
create or replace function calculate_ticket_sla(p_ticket_id uuid, p_priority ticket_priority)
returns void
language plpgsql
as $$
declare
  v_response_hours int;
  v_resolution_hours int;
begin
  -- Set SLA based on priority
  case p_priority
    when 'urgent' then
      v_response_hours := 1;
      v_resolution_hours := 4;
    when 'high' then
      v_response_hours := 4;
      v_resolution_hours := 24;
    when 'medium' then
      v_response_hours := 8;
      v_resolution_hours := 48;
    else -- low
      v_response_hours := 24;
      v_resolution_hours := 120; -- 5 days
  end case;

  insert into support_ticket_sla (ticket_id, response_due_at, resolution_due_at)
  values (
    p_ticket_id,
    now() + (v_response_hours || ' hours')::interval,
    now() + (v_resolution_hours || ' hours')::interval
  )
  on conflict (ticket_id) do update
  set response_due_at = excluded.response_due_at,
      resolution_due_at = excluded.resolution_due_at,
      updated_at = now();
end;
$$;

comment on function calculate_ticket_sla is 'Calculates and sets SLA deadlines based on priority';

-- Trigger to set SLA on ticket creation
create or replace function set_ticket_sla()
returns trigger
language plpgsql
as $$
begin
  perform calculate_ticket_sla(NEW.id, NEW.priority);
  return NEW;
end;
$$;

create trigger set_sla_trigger
after insert on support_tickets
for each row execute function set_ticket_sla();

comment on trigger set_sla_trigger on support_tickets is 'Sets SLA deadlines when ticket is created';
