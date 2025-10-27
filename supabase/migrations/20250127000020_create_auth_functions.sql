-- =====================================================================
-- Auth Helper Functions
-- =====================================================================
-- This migration creates helper functions for authentication and
-- authorization checks used throughout the RLS policies.
--
-- Functions:
-- - get_user_role(): Get current user's platform role
-- - is_org_admin_any(): Check if user is admin of any org
-- - is_super_admin(): Check if user has super_admin role
-- - get_user_orgs(): Get list of user's organizations
-- - can_manage_facility(): Check if user can manage a facility
-- - can_view_booking(): Check if user can view a booking
-- - can_manage_booking(): Check if user can manage a booking
-- =====================================================================

-- Get current user's role from JWT or profile
-- This function reads the user's role which will be stored in their profile
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- First try to get from JWT claims (if set)
  user_role := coalesce(
    current_setting('request.jwt.claims', true)::jsonb->>'app_role',
    NULL
  );

  -- If not in JWT, get from profile table
  IF user_role IS NULL THEN
    SELECT COALESCE(
      (SELECT m.role::text
       FROM public.memberships m
       WHERE m.user_id = auth.uid()
       ORDER BY CASE m.role
         WHEN 'owner' THEN 4
         WHEN 'admin' THEN 3
         WHEN 'staff' THEN 2
         ELSE 1
       END DESC
       LIMIT 1),
      'customer'
    ) INTO user_role;
  END IF;

  RETURN COALESCE(user_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is admin of a specific organization
CREATE OR REPLACE FUNCTION public.is_org_admin_check(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id = check_org_id
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is super admin (platform admin)
CREATE OR REPLACE FUNCTION public.is_super_admin_check()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check JWT claims first
  IF (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'platform_admin' THEN
    RETURN true;
  END IF;

  -- Check if user has owner/admin role in any org (for now, platform admin logic)
  RETURN is_platform_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user's organizations (where they have active memberships)
CREATE OR REPLACE FUNCTION public.get_user_orgs()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT org_id FROM public.memberships
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user's organizations with specific minimum role
CREATE OR REPLACE FUNCTION public.get_user_orgs_with_role(min_role org_role DEFAULT 'customer')
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT org_id FROM public.memberships
  WHERE user_id = auth.uid()
  AND (
    CASE role
      WHEN 'owner' THEN 4
      WHEN 'admin' THEN 3
      WHEN 'staff' THEN 2
      ELSE 1
    END
    >=
    CASE min_role
      WHEN 'owner' THEN 4
      WHEN 'admin' THEN 3
      WHEN 'staff' THEN 2
      ELSE 1
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user can manage a facility
CREATE OR REPLACE FUNCTION public.can_manage_facility(facility_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  facility_org_id UUID;
BEGIN
  -- Get facility's org
  SELECT org_id INTO facility_org_id
  FROM public.facilities
  WHERE id = facility_id_param;

  IF facility_org_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user is platform admin or org admin/staff
  RETURN is_platform_admin() OR is_org_staff(facility_org_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user can view a booking
CREATE OR REPLACE FUNCTION public.can_view_booking(booking_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  booking_user_id UUID;
  booking_org_id UUID;
BEGIN
  -- Get booking details
  SELECT user_id, org_id INTO booking_user_id, booking_org_id
  FROM public.bookings
  WHERE id = booking_id_param;

  -- User can view if:
  -- 1. They own the booking
  -- 2. They are staff/admin of the org
  -- 3. They are platform admin
  RETURN booking_user_id = auth.uid()
    OR is_org_staff(booking_org_id)
    OR is_platform_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user can manage a booking (update/delete)
CREATE OR REPLACE FUNCTION public.can_manage_booking(booking_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  booking_user_id UUID;
  booking_org_id UUID;
  booking_status TEXT;
BEGIN
  -- Get booking details
  SELECT user_id, org_id, status INTO booking_user_id, booking_org_id, booking_status
  FROM public.bookings
  WHERE id = booking_id_param;

  -- Platform admin can always manage
  IF is_platform_admin() THEN
    RETURN true;
  END IF;

  -- Org staff can manage
  IF is_org_staff(booking_org_id) THEN
    RETURN true;
  END IF;

  -- User can manage their own booking if it's in certain states
  IF booking_user_id = auth.uid() AND booking_status IN ('pending', 'awaiting_payment') THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user's highest role in an organization
CREATE OR REPLACE FUNCTION public.get_user_org_role(org_id_param UUID)
RETURNS org_role AS $$
DECLARE
  user_role org_role;
BEGIN
  SELECT role INTO user_role
  FROM public.memberships
  WHERE user_id = auth.uid()
  AND org_id = org_id_param
  ORDER BY CASE role
    WHEN 'owner' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'staff' THEN 2
    ELSE 1
  END DESC
  LIMIT 1;

  RETURN COALESCE(user_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has permission for a resource action
CREATE OR REPLACE FUNCTION public.has_permission(
  resource TEXT,
  action TEXT,
  org_id_param UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role org_role;
BEGIN
  -- Platform admin has all permissions
  IF is_platform_admin() THEN
    RETURN true;
  END IF;

  -- Get user's role in the organization
  IF org_id_param IS NOT NULL THEN
    user_role := get_user_org_role(org_id_param);
  ELSE
    -- Get highest role across all orgs
    SELECT role INTO user_role
    FROM public.memberships
    WHERE user_id = auth.uid()
    ORDER BY CASE role
      WHEN 'owner' THEN 4
      WHEN 'admin' THEN 3
      WHEN 'staff' THEN 2
      ELSE 1
    END DESC
    LIMIT 1;
  END IF;

  -- Permission matrix based on role
  CASE user_role
    WHEN 'owner', 'admin' THEN
      -- Owners and admins have full permissions
      RETURN true;
    WHEN 'staff' THEN
      -- Staff can manage facilities, bookings, but not org settings
      RETURN resource IN ('facilities', 'bookings', 'availability_rules', 'blackouts', 'reviews');
    WHEN 'customer' THEN
      -- Customers can only create bookings and manage their own data
      RETURN (resource = 'bookings' AND action IN ('create', 'read', 'update'))
        OR (resource = 'facilities' AND action = 'read')
        OR (resource = 'profile' AND action = 'update')
        OR (resource = 'favorites' AND action IN ('create', 'read', 'delete'))
        OR (resource = 'reviews' AND action IN ('create', 'read'));
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin_check(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin_check() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_orgs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_orgs_with_role(org_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_facility(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_booking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_booking(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_org_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(TEXT, TEXT, UUID) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.get_user_role() IS 'Get current authenticated user''s platform role';
COMMENT ON FUNCTION public.is_org_admin_check(UUID) IS 'Check if user is admin of specific organization';
COMMENT ON FUNCTION public.is_super_admin_check() IS 'Check if user is platform super admin';
COMMENT ON FUNCTION public.get_user_orgs() IS 'Get list of organization IDs user belongs to';
COMMENT ON FUNCTION public.can_manage_facility(UUID) IS 'Check if user can manage a facility';
COMMENT ON FUNCTION public.can_view_booking(UUID) IS 'Check if user can view a booking';
COMMENT ON FUNCTION public.can_manage_booking(UUID) IS 'Check if user can manage a booking';
COMMENT ON FUNCTION public.has_permission(TEXT, TEXT, UUID) IS 'Check if user has permission for resource action';
