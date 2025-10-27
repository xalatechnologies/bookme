-- Migration: Add Messaging System
-- Description: Inter-user messaging with threads, attachments, and status tracking

-- Message threads
create table message_threads (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  subject text not null,
  related_booking_id uuid references bookings(id) on delete set null,
  related_facility_id uuid references facilities(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on message_threads(org_id);
create index on message_threads(status);
create index on message_threads(priority);
create index on message_threads(related_booking_id);
create index on message_threads(related_facility_id);
create index on message_threads(last_message_at desc);

comment on table message_threads is 'Message conversation threads between users';

-- Thread participants
create table message_thread_participants (
  thread_id uuid not null references message_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_type text not null check (participant_type in ('user', 'admin')),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  is_active boolean not null default true,
  primary key (thread_id, user_id)
);

create index on message_thread_participants(user_id);
create index on message_thread_participants(thread_id);
create index on message_thread_participants(participant_type);

comment on table message_thread_participants is 'Users participating in message threads';

-- Messages
create table messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references message_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  sender_type text not null check (sender_type in ('user', 'admin')),
  content text not null,
  status text not null default 'sent' check (status in ('sent', 'delivered', 'read')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index on messages(thread_id);
create index on messages(sender_id);
create index on messages(status);
create index on messages(created_at desc);
create index on messages(thread_id, created_at);

comment on table messages is 'Individual messages within threads';

-- Message attachments (stored in Supabase Storage)
create table message_attachments (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references messages(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size bigint not null check (file_size > 0),
  storage_path text not null, -- Path in Supabase Storage bucket
  uploaded_at timestamptz not null default now()
);

create index on message_attachments(message_id);

comment on table message_attachments is 'File attachments for messages (stored in Supabase Storage)';

-- Message templates for common responses
create table message_templates (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  category text not null check (category in ('booking', 'support', 'general', 'admin')),
  content text not null,
  variables text[] not null default '{}', -- Available template variables
  is_active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on message_templates(org_id);
create index on message_templates(category);
create index on message_templates(is_active);

comment on table message_templates is 'Reusable message templates';

-- RLS Policies for message_threads
alter table message_threads enable row level security;

create policy "Users can view threads they participate in"
  on message_threads for select
  using (id in (
    select thread_id from message_thread_participants
    where user_id = auth.uid()
  ));

create policy "Users can create threads"
  on message_threads for insert
  with check (org_id in (
    select org_id from memberships where user_id = auth.uid()
  ));

create policy "Thread participants can update thread"
  on message_threads for update
  using (id in (
    select thread_id from message_thread_participants
    where user_id = auth.uid()
  ));

-- RLS for message_thread_participants
alter table message_thread_participants enable row level security;

create policy "Users can view participants in their threads"
  on message_thread_participants for select
  using (thread_id in (
    select thread_id from message_thread_participants
    where user_id = auth.uid()
  ));

create policy "Users can add themselves as participants"
  on message_thread_participants for insert
  with check (user_id = auth.uid());

create policy "Users can update own participation"
  on message_thread_participants for update
  using (user_id = auth.uid());

-- RLS for messages
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

create policy "Senders can update own messages"
  on messages for update
  using (sender_id = auth.uid());

-- RLS for message_attachments
alter table message_attachments enable row level security;

create policy "Users can view attachments in their thread messages"
  on message_attachments for select
  using (exists(
    select 1 from messages m
    join message_thread_participants mtp on mtp.thread_id = m.thread_id
    where m.id = message_attachments.message_id
    and mtp.user_id = auth.uid()
  ));

create policy "Message senders can add attachments"
  on message_attachments for insert
  with check (exists(
    select 1 from messages m
    where m.id = message_id
    and m.sender_id = auth.uid()
  ));

-- RLS for message_templates
alter table message_templates enable row level security;

create policy "Org members can view templates"
  on message_templates for select
  using (
    is_active = true
    and org_id in (
      select org_id from memberships where user_id = auth.uid()
    )
  );

create policy "Org admins can manage templates"
  on message_templates for all
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
    and role in ('owner', 'admin')
  ));

-- Trigger to update thread last_message_at
create or replace function update_thread_last_message()
returns trigger
language plpgsql
as $$
begin
  update message_threads
  set last_message_at = NEW.created_at,
      updated_at = now()
  where id = NEW.thread_id;
  return NEW;
end;
$$;

create trigger after_message_insert
after insert on messages
for each row execute function update_thread_last_message();

comment on trigger after_message_insert on messages is 'Updates thread last_message_at timestamp';

-- Trigger to mark messages as delivered
create or replace function mark_messages_delivered()
returns trigger
language plpgsql
as $$
begin
  -- Mark unread messages in thread as delivered
  update messages
  set status = 'delivered'
  where thread_id = NEW.thread_id
    and status = 'sent'
    and sender_id != NEW.user_id;
  return NEW;
end;
$$;

create trigger after_participant_reads
after update on message_thread_participants
for each row
when (NEW.last_read_at is distinct from OLD.last_read_at)
execute function mark_messages_delivered();

comment on trigger after_participant_reads on message_thread_participants is 'Marks messages as delivered when participant reads thread';

-- Helper function: Create new thread with initial message
create or replace function create_message_thread(
  p_org_id uuid,
  p_subject text,
  p_initial_message text,
  p_recipient_id uuid,
  p_related_booking_id uuid default null,
  p_priority text default 'medium'
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_thread_id uuid;
  v_sender_id uuid;
begin
  v_sender_id := auth.uid();
  if v_sender_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Create thread
  insert into message_threads (org_id, subject, related_booking_id, priority)
  values (p_org_id, p_subject, p_related_booking_id, p_priority)
  returning id into v_thread_id;

  -- Add participants
  insert into message_thread_participants (thread_id, user_id, participant_type)
  values
    (v_thread_id, v_sender_id, 'user'),
    (v_thread_id, p_recipient_id, 'user');

  -- Add initial message
  insert into messages (thread_id, sender_id, sender_type, content)
  values (v_thread_id, v_sender_id, 'user', p_initial_message);

  return v_thread_id;
end;
$$;

comment on function create_message_thread is 'Creates a new message thread with initial message and participants';

-- Function to get unread message count for user
create or replace function get_unread_message_count(p_user_id uuid default null)
returns int
language sql stable
as $$
  select count(distinct m.id)::int
  from messages m
  join message_thread_participants mtp on mtp.thread_id = m.thread_id
  where mtp.user_id = coalesce(p_user_id, auth.uid())
    and m.sender_id != coalesce(p_user_id, auth.uid())
    and m.status in ('sent', 'delivered')
    and (mtp.last_read_at is null or m.created_at > mtp.last_read_at)
$$;

comment on function get_unread_message_count is 'Returns count of unread messages for a user';
