-- Migration: Add Group Bookings Support
-- Description: Enables collaborative group bookings with member management and cost sharing

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
  max_bookings_per_member int not null default 10 check (max_bookings_per_member > 0),

  -- Notification preferences
  notify_new_bookings boolean not null default true,
  notify_cancellations boolean not null default true,
  notify_member_changes boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on booking_groups(org_id);
create index on booking_groups(owner_id);
create index on booking_groups(name);

comment on table booking_groups is 'Groups for collaborative booking with shared costs';
comment on column booking_groups.allow_member_bookings is 'If false, only owner/admin can create bookings';
comment on column booking_groups.require_approval is 'If true, member bookings need owner/admin approval';

-- Group members
create table booking_group_members (
  group_id uuid not null references booking_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role group_role not null default 'member',
  joined_at timestamptz not null default now(),
  last_active_at timestamptz,
  booking_count int not null default 0 check (booking_count >= 0),
  is_active boolean not null default true,
  primary key (group_id, user_id)
);

create index on booking_group_members(user_id);
create index on booking_group_members(group_id);
create index on booking_group_members(role);
create index on booking_group_members(is_active);

comment on table booking_group_members is 'Members of a booking group with role-based permissions';

-- Group invitations
create table booking_group_invitations (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references booking_groups(id) on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  invited_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  responded_at timestamptz
);

create index on booking_group_invitations(group_id);
create index on booking_group_invitations(email);
create index on booking_group_invitations(status);
create index on booking_group_invitations(expires_at);
create unique index on booking_group_invitations(group_id, email) where status = 'pending';

comment on table booking_group_invitations is 'Pending invitations to join booking groups';

-- Group bookings (links bookings to groups)
create table group_bookings (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references booking_groups(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,

  -- Cost sharing configuration
  total_cost_cents bigint not null check (total_cost_cents >= 0),
  cost_per_member_cents bigint not null check (cost_per_member_cents >= 0),
  currency text not null default 'NOK',

  -- Approval workflow
  requires_approval boolean not null default false,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(group_id, booking_id)
);

create index on group_bookings(group_id);
create index on group_bookings(booking_id);
create index on group_bookings(created_by);

comment on table group_bookings is 'Associates bookings with groups for shared cost management';

-- Cost shares per member
create table group_booking_cost_shares (
  group_booking_id uuid not null references group_bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  share_cents bigint not null check (share_cents >= 0),
  paid boolean not null default false,
  paid_at timestamptz,
  payment_id uuid references payments(id) on delete set null,
  primary key (group_booking_id, user_id)
);

create index on group_booking_cost_shares(user_id);
create index on group_booking_cost_shares(paid);
create index on group_booking_cost_shares(group_booking_id, paid);

comment on table group_booking_cost_shares is 'Individual member cost shares for group bookings';

-- Add group reference to bookings table
alter table bookings
  add column group_id uuid references booking_groups(id) on delete set null;

create index on bookings(group_id);

comment on column bookings.group_id is 'If this booking belongs to a group';

-- RLS Policies for booking_groups
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
  using (owner_id = auth.uid() or id in (
    select group_id from booking_group_members
    where user_id = auth.uid() and role = 'admin'
  ));

create policy "Group owners can delete groups"
  on booking_groups for delete
  using (owner_id = auth.uid());

-- RLS for booking_group_members
alter table booking_group_members enable row level security;

create policy "Users can view group members of their groups"
  on booking_group_members for select
  using (group_id in (
    select group_id from booking_group_members
    where user_id = auth.uid()
  ));

create policy "Group owners/admins can add members"
  on booking_group_members for insert
  with check (exists(
    select 1 from booking_group_members bgm
    where bgm.group_id = booking_group_members.group_id
    and bgm.user_id = auth.uid()
    and bgm.role in ('owner', 'admin')
  ) or exists(
    select 1 from booking_groups bg
    where bg.id = booking_group_members.group_id
    and bg.owner_id = auth.uid()
  ));

create policy "Group owners/admins can manage members"
  on booking_group_members for update
  using (exists(
    select 1 from booking_group_members bgm
    where bgm.group_id = booking_group_members.group_id
    and bgm.user_id = auth.uid()
    and bgm.role in ('owner', 'admin')
  ) or exists(
    select 1 from booking_groups bg
    where bg.id = booking_group_members.group_id
    and bg.owner_id = auth.uid()
  ));

create policy "Members can leave group"
  on booking_group_members for delete
  using (user_id = auth.uid() or exists(
    select 1 from booking_groups bg
    where bg.id = booking_group_members.group_id
    and bg.owner_id = auth.uid()
  ));

-- RLS for booking_group_invitations
alter table booking_group_invitations enable row level security;

create policy "Users can view invitations to their email"
  on booking_group_invitations for select
  using (email = (select email from auth.users where id = auth.uid()));

create policy "Group members can view group invitations"
  on booking_group_invitations for select
  using (group_id in (
    select group_id from booking_group_members
    where user_id = auth.uid()
  ));

create policy "Group owners/admins can send invitations"
  on booking_group_invitations for insert
  with check (
    invited_by = auth.uid() and
    (exists(
      select 1 from booking_group_members bgm
      where bgm.group_id = booking_group_invitations.group_id
      and bgm.user_id = auth.uid()
      and bgm.role in ('owner', 'admin')
    ) or exists(
      select 1 from booking_groups bg
      where bg.id = booking_group_invitations.group_id
      and bg.owner_id = auth.uid()
    ))
  );

create policy "Users can respond to invitations"
  on booking_group_invitations for update
  using (email = (select email from auth.users where id = auth.uid()));

-- RLS for group_bookings
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
    created_by = auth.uid() and
    group_id in (
      select group_id from booking_group_members
      where user_id = auth.uid()
    )
  );

create policy "Group owners/admins can manage bookings"
  on group_bookings for update
  using (exists(
    select 1 from booking_group_members bgm
    where bgm.group_id = group_bookings.group_id
    and bgm.user_id = auth.uid()
    and bgm.role in ('owner', 'admin')
  ));

-- RLS for group_booking_cost_shares
alter table group_booking_cost_shares enable row level security;

create policy "Users can view own cost shares"
  on group_booking_cost_shares for select
  using (user_id = auth.uid());

create policy "Group members can view all shares"
  on group_booking_cost_shares for select
  using (exists(
    select 1 from group_bookings gb
    join booking_group_members bgm on bgm.group_id = gb.group_id
    where gb.id = group_booking_cost_shares.group_booking_id
    and bgm.user_id = auth.uid()
  ));

create policy "Users can update own payment status"
  on group_booking_cost_shares for update
  using (user_id = auth.uid());

-- Helper function: Add member to group
create or replace function add_group_member(
  p_group_id uuid,
  p_user_id uuid,
  p_role group_role default 'member'
)
returns void
language plpgsql
security definer
as $$
begin
  insert into booking_group_members (group_id, user_id, role)
  values (p_group_id, p_user_id, p_role)
  on conflict (group_id, user_id) do update
  set role = excluded.role, is_active = true;
end;
$$;

comment on function add_group_member is 'Adds a member to a group or reactivates them';

-- Helper function: Accept group invitation
create or replace function accept_group_invitation(p_invitation_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_invitation booking_group_invitations%rowtype;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_invitation from booking_group_invitations where id = p_invitation_id;

  if v_invitation.id is null then
    raise exception 'Invitation not found';
  end if;

  if v_invitation.status != 'pending' then
    raise exception 'Invitation is not pending';
  end if;

  if v_invitation.expires_at < now() then
    update booking_group_invitations set status = 'expired' where id = p_invitation_id;
    raise exception 'Invitation has expired';
  end if;

  -- Check if email matches user
  if v_invitation.email != (select email from auth.users where id = v_user_id) then
    raise exception 'Invitation email does not match user email';
  end if;

  -- Add member
  perform add_group_member(v_invitation.group_id, v_user_id, 'member');

  -- Update invitation
  update booking_group_invitations
  set status = 'accepted', responded_at = now()
  where id = p_invitation_id;

  return v_invitation.group_id;
end;
$$;

comment on function accept_group_invitation is 'Accepts a group invitation and adds user as member';

-- Trigger to create cost shares when group booking is created
create or replace function create_group_booking_shares()
returns trigger
language plpgsql
as $$
declare
  v_member record;
  v_member_count int;
begin
  -- Count active members
  select count(*) into v_member_count
  from booking_group_members
  where group_id = NEW.group_id and is_active = true;

  -- Create shares for each member
  for v_member in
    select user_id from booking_group_members
    where group_id = NEW.group_id and is_active = true
  loop
    insert into group_booking_cost_shares (group_booking_id, user_id, share_cents)
    values (NEW.id, v_member.user_id, NEW.cost_per_member_cents);
  end loop;

  return NEW;
end;
$$;

create trigger after_group_booking_insert
after insert on group_bookings
for each row execute function create_group_booking_shares();

comment on trigger after_group_booking_insert on group_bookings is 'Automatically creates cost shares for group members';
