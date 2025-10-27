-- Organizations
create policy org_read_pub on organizations
  for select using (true);  -- org list isn't sensitive; tighten if needed

create policy org_write_owner on organizations
  for all using (is_platform_admin() or exists(
    select 1 from memberships m where m.org_id = id and m.user_id = auth.uid() and m.role in ('owner','admin')
  ));

-- Profiles: only self; platform_admin can read for support
create policy profiles_select_self on profiles
  for select using (user_id = auth.uid() or is_platform_admin());

create policy profiles_upsert_self on profiles
  for insert with check (user_id = auth.uid());
  
create policy profiles_update_self on profiles
  for update using (user_id = auth.uid());

-- Memberships: members can read their org's memberships; admins manage
create policy memberships_read on memberships
  for select using (
    is_platform_admin() or is_org_member(org_id, 'staff')
  );

create policy memberships_admin_write on memberships
  for all using (is_platform_admin() or is_org_admin(org_id));

-- Facilities
create policy facilities_public_read on facilities
  for select using (status = 'published' or is_org_member(org_id, 'staff') or is_platform_admin());

create policy facilities_staff_write on facilities
  for all using (is_org_staff(org_id) or is_platform_admin());

-- Tags (read all; write staff if any facility under org uses it; simplest: platform_admin full, staff via functions)
create policy tags_read on tags for select using (true);
create policy tags_write_admin on tags for all using (is_platform_admin());

create policy facility_tags_read on facility_tags
  for select using (
    exists (select 1 from facilities f where f.id = facility_id and (f.status = 'published' or is_org_member(f.org_id,'staff') or is_platform_admin()))
  );

create policy facility_tags_write on facility_tags
  for all using (
    exists (select 1 from facilities f where f.id = facility_id and (is_org_staff(f.org_id) or is_platform_admin()))
  );

-- Availability & blackouts: readable when facility visible; writable by staff
create policy avail_read on availability_rules
  for select using (
    exists (select 1 from facilities f where f.id = facility_id and (f.status='published' or is_org_member(f.org_id,'staff') or is_platform_admin()))
  );

create policy avail_write on availability_rules
  for all using (
    exists (select 1 from facilities f where f.id = facility_id and (is_org_staff(f.org_id) or is_platform_admin()))
  );

create policy blackouts_read on blackouts
  for select using (
    exists (select 1 from facilities f where f.id = facility_id and (f.status='published' or is_org_member(f.org_id,'staff') or is_platform_admin()))
  );

create policy blackouts_write on blackouts
  for all using (
    exists (select 1 from facilities f where f.id = facility_id and (is_org_staff(f.org_id) or is_platform_admin()))
  );

-- Bookings
create policy bookings_read_scoped on bookings
  for select using (
    user_id = auth.uid()
    or is_org_member(org_id,'staff')
    or is_platform_admin()
    or exists (select 1 from facilities f where f.id = facility_id and f.status='published')
  );

-- Insert limited to customer themselves via RPC (we still allow select broadly)
-- We prevent direct writes by not creating an insert policy; force RPCs (SECURITY DEFINER)

-- Payments: readable only for staff of org or booking owner; writable via webhook RPC
create policy payments_read on payments
  for select using (
    exists (select 1 from bookings b where b.id = booking_id and (b.user_id = auth.uid() or is_org_member(b.org_id,'staff') or is_platform_admin()))
  );

-- Reviews
create policy reviews_read on reviews for select using (true);
create policy reviews_write on reviews
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.user_id = auth.uid()
        and b.status in ('paid','completed','refunded')
        and b.ends_at < now()
    )
  );

-- Favorites: user owns
create policy favorites_read on favorites for select using (user_id = auth.uid());
create policy favorites_write on favorites
  for all using (user_id = auth.uid());

-- Notifications: user can see theirs; worker writes via service role
create policy notifications_read on notifications for select using (user_id = auth.uid());

-- Audit and error_log readable by platform_admin and org staff scoped
create policy audit_read on audit_events
  for select using (
    is_platform_admin() or (org_id is not null and is_org_member(org_id,'staff'))
  );
create policy error_read on error_log
  for select using (is_platform_admin());