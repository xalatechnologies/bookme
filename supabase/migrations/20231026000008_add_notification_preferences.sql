-- Migration: Add Notification Preferences
-- Description: User-specific notification settings and enhanced notification system

-- User notification preferences
create table user_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- Email notifications
  email_booking_confirmation boolean not null default true,
  email_booking_reminder boolean not null default true,
  email_booking_cancellation boolean not null default true,
  email_booking_changes boolean not null default true,
  email_messages boolean not null default true,
  email_group_invitations boolean not null default true,
  email_group_activity boolean not null default false,
  email_system_updates boolean not null default false,
  email_marketing boolean not null default false,

  -- Browser/Push notifications
  browser_enabled boolean not null default false,
  browser_booking_reminder boolean not null default true,
  browser_messages boolean not null default true,
  browser_group_activity boolean not null default true,

  -- SMS notifications (future)
  sms_enabled boolean not null default false,
  sms_booking_confirmation boolean not null default false,
  sms_booking_reminder boolean not null default false,
  sms_urgent_only boolean not null default true,

  -- Digest settings
  daily_digest boolean not null default false,
  weekly_digest boolean not null default false,
  digest_day int check (digest_day is null or digest_day between 0 and 6), -- 0=Sunday
  digest_time time default '08:00',

  -- Reminder timing
  booking_reminder_hours int not null default 24 check (booking_reminder_hours > 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table user_notification_preferences is 'User-specific notification preferences';
comment on column user_notification_preferences.digest_day is '0=Sunday through 6=Saturday for weekly digest';
comment on column user_notification_preferences.booking_reminder_hours is 'How many hours before booking to send reminder';

-- Enhanced notifications table (extends existing notifications)
alter table notifications
  add column notification_type text check (notification_type in (
    'booking_confirmation', 'booking_reminder', 'booking_cancellation',
    'booking_change', 'message', 'group_invitation', 'group_activity',
    'support_ticket', 'system_update', 'marketing'
  )),
  add column priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  add column action_url text,
  add column action_label text,
  add column image_url text,
  add column metadata jsonb default '{}'::jsonb,
  add column read_at timestamptz,
  add column dismissed_at timestamptz,
  add column clicked_at timestamptz;

create index on notifications(user_id, read_at);
create index on notifications(user_id, dismissed_at);
create index on notifications(notification_type);
create index on notifications(priority);
create index on notifications(send_at) where sent_at is null;

comment on column notifications.notification_type is 'Categorizes notification for preference filtering';
comment on column notifications.action_url is 'Optional URL for notification action button';
comment on column notifications.dismissed_at is 'When user dismissed the notification';
comment on column notifications.clicked_at is 'When user clicked notification action';

-- Notification delivery log
create table notification_delivery_log (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references notifications(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'browser', 'none')),
  status text not null check (status in ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  error_message text,
  attempted_at timestamptz not null default now(),
  delivered_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create index on notification_delivery_log(notification_id);
create index on notification_delivery_log(channel);
create index on notification_delivery_log(status);
create index on notification_delivery_log(attempted_at desc);

comment on table notification_delivery_log is 'Tracks notification delivery across channels';

-- RLS for user_notification_preferences
alter table user_notification_preferences enable row level security;

create policy "Users can manage own preferences"
  on user_notification_preferences for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS for notification_delivery_log
alter table notification_delivery_log enable row level security;

create policy "Users can view own delivery logs"
  on notification_delivery_log for select
  using (exists(
    select 1 from notifications n
    where n.id = notification_delivery_log.notification_id
    and n.user_id = auth.uid()
  ));

-- Helper function: Check if user wants notification
create or replace function should_send_notification(
  p_user_id uuid,
  p_notification_type text,
  p_channel text default 'email'
)
returns boolean
language plpgsql stable
as $$
declare
  v_prefs user_notification_preferences%rowtype;
  v_should_send boolean := false;
begin
  select * into v_prefs from user_notification_preferences where user_id = p_user_id;

  -- If no preferences set, use defaults
  if v_prefs.user_id is null then
    return true;
  end if;

  case p_channel
    when 'email' then
      case p_notification_type
        when 'booking_confirmation' then v_should_send := v_prefs.email_booking_confirmation;
        when 'booking_reminder' then v_should_send := v_prefs.email_booking_reminder;
        when 'booking_cancellation' then v_should_send := v_prefs.email_booking_cancellation;
        when 'booking_change' then v_should_send := v_prefs.email_booking_changes;
        when 'message' then v_should_send := v_prefs.email_messages;
        when 'group_invitation' then v_should_send := v_prefs.email_group_invitations;
        when 'group_activity' then v_should_send := v_prefs.email_group_activity;
        when 'system_update' then v_should_send := v_prefs.email_system_updates;
        when 'marketing' then v_should_send := v_prefs.email_marketing;
        else v_should_send := true;
      end case;

    when 'browser' then
      if not v_prefs.browser_enabled then
        return false;
      end if;
      case p_notification_type
        when 'booking_reminder' then v_should_send := v_prefs.browser_booking_reminder;
        when 'message' then v_should_send := v_prefs.browser_messages;
        when 'group_activity' then v_should_send := v_prefs.browser_group_activity;
        else v_should_send := true;
      end case;

    when 'sms' then
      if not v_prefs.sms_enabled then
        return false;
      end if;
      case p_notification_type
        when 'booking_confirmation' then v_should_send := v_prefs.sms_booking_confirmation;
        when 'booking_reminder' then v_should_send := v_prefs.sms_booking_reminder;
        else v_should_send := false;
      end case;

    else
      v_should_send := true;
  end case;

  return v_should_send;
end;
$$;

comment on function should_send_notification is 'Checks user preferences to determine if notification should be sent';

-- Function to create notification respecting preferences
create or replace function create_user_notification(
  p_user_id uuid,
  p_notification_type text,
  p_subject text,
  p_body text,
  p_action_url text default null,
  p_action_label text default null,
  p_priority text default 'medium',
  p_send_at timestamptz default now(),
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_notification_id uuid;
  v_channel text;
begin
  -- Create notification record
  insert into notifications (
    user_id, notification_type, channel, subject, body,
    action_url, action_label, priority, send_at, meta
  ) values (
    p_user_id, p_notification_type, 'email', p_subject, p_body,
    p_action_url, p_action_label, p_priority, p_send_at, p_metadata
  ) returning id into v_notification_id;

  -- Check each channel and queue delivery if enabled
  foreach v_channel in array array['email', 'browser', 'sms'] loop
    if should_send_notification(p_user_id, p_notification_type, v_channel) then
      insert into notification_delivery_log (notification_id, channel, status)
      values (v_notification_id, v_channel, 'pending');
    end if;
  end loop;

  return v_notification_id;
end;
$$;

comment on function create_user_notification is 'Creates notification and queues delivery based on user preferences';

-- Function to mark notification as read
create or replace function mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update notifications
  set read_at = now()
  where id = p_notification_id and user_id = auth.uid();
end;
$$;

comment on function mark_notification_read is 'Marks notification as read by current user';

-- Function to dismiss notification
create or replace function dismiss_notification(p_notification_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update notifications
  set dismissed_at = now()
  where id = p_notification_id and user_id = auth.uid();
end;
$$;

comment on function dismiss_notification is 'Marks notification as dismissed by current user';

-- Function to record notification click
create or replace function click_notification(p_notification_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update notifications
  set clicked_at = now()
  where id = p_notification_id and user_id = auth.uid();
end;
$$;

comment on function click_notification is 'Records when user clicks notification action';

-- Function to create default notification preferences for a user
create or replace function create_default_notification_preferences()
returns trigger
language plpgsql
as $$
begin
  insert into user_notification_preferences (user_id)
  values (NEW.id)
  on conflict do nothing;
  return NEW;
end;
$$;

comment on function create_default_notification_preferences is 'Creates default notification preferences for new users';

-- Note: Trigger on auth.users is not created in this migration as it requires special permissions
-- In production, this would be set up separately by the Supabase team or with appropriate permissions