-- Helper to read platform role from JWT
create or replace function app_jwt() returns jsonb language sql stable as
$$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb, '{}'::jsonb)
$$;

create or replace function is_platform_admin() returns boolean language sql stable as
$$
  select (app_jwt() ->> 'role') = 'platform_admin'
$$;

-- Who am I?
create or replace function me() returns uuid language sql stable as
$$
  select auth.uid()
$$;

-- Convenience predicate: am I member of org with at least the given roles?
create or replace function is_org_member(p_org uuid, p_min_role org_role default 'customer')
returns boolean
language sql stable as
$$
  select exists (
    select 1
    from memberships m
    where m.org_id = p_org
      and m.user_id = auth.uid()
      and (
        -- role ordering: owner > admin > staff > customer
        case m.role
          when 'owner' then 4
          when 'admin' then 3
          when 'staff' then 2
          else 1
        end
        >=
        case p_min_role
          when 'owner' then 4
          when 'admin' then 3
          when 'staff' then 2
          else 1
        end
      )
  )
$$;

create or replace function is_org_staff(p_org uuid)
returns boolean language sql stable as
$$ select is_org_member(p_org, 'staff') $$;

create or replace function is_org_admin(p_org uuid)
returns boolean language sql stable as
$$ select is_org_member(p_org, 'admin') $$;

-- Enable Row Level Security
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table memberships enable row level security;
alter table facilities enable row level security;
alter table facility_tags enable row level security;
alter table tags enable row level security;
alter table availability_rules enable row level security;
alter table blackouts enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table favorites enable row level security;
alter table notifications enable row level security;
alter table audit_events enable row level security;
alter table error_log enable row level security;

-- Default deny