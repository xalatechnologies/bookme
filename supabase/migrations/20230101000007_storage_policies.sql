-- Storage RLS policies (operate on storage.objects)
-- WARNING: Supabase manages storage via its own RPC; these policies are standard patterns.

-- Public images: world-read, write restricted to org staff if they prefix path with org_id/
create policy "public read images" on storage.objects
  for select using (bucket_id = 'public-images');

create policy "upload images staff" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'public-images'
    and exists (
      select 1 from memberships m
      where m.user_id = auth.uid()
      -- enforce path like org_id/... (client sets)
      and position(m.org_id::text in coalesce((storage.foldername(name))[1],'') ) = 1
    )
  );

-- Org files: path-scoped org=<org_id>/
create policy "org files read own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'org-files'
    and exists (
      select 1 from memberships m
      where m.user_id = auth.uid()
        and position(m.org_id::text in name) = 1
    )
  );

create policy "org files write own" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'org-files'
    and exists (
      select 1 from memberships m
      where m.user_id = auth.uid()
        and position(m.org_id::text in name) = 1
    )
  )
  with check (
    bucket_id = 'org-files'
    and exists (
      select 1 from memberships m
      where m.user_id = auth.uid()
        and position(m.org_id::text in name) = 1
    )
  );