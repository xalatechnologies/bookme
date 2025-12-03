-- Fix audit_events policy to allow users to read their own login events
-- This enables the "Last Activity" column in the UsersRolesPage to show login times
-- Migration number 20251124000002 to ensure it runs after existing policies

-- Drop the existing policies that are conflicting
DROP POLICY IF EXISTS audit_select_accessible ON public.audit_events;
DROP POLICY IF EXISTS audit_select_admin ON public.audit_events;

-- Create new policy that allows:
-- 1. Platform admins to view all audit events
-- 2. Org staff to view org audit events
-- 3. Users to view their own login events (for last activity tracking)
CREATE POLICY "audit_select_accessible" ON public.audit_events
  FOR SELECT
  USING (
    -- Platform admins can view all audit events
    is_platform_admin()
    OR (
      -- Org staff can view org audit events
      org_id IS NOT NULL
      AND is_org_staff(org_id)
    )
    OR (
      -- Users can view their own login events
      action = 'user_login'
      AND actor_id = auth.uid()
    )
  );