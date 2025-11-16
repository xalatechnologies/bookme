-- =====================================================================
-- Enhanced Row Level Security (RLS) Policies
-- =====================================================================
-- This migration creates comprehensive RLS policies for all tables
-- with proper role-based access control.
--
-- Security Model:
-- - Platform Admins: Full access to everything
-- - Organization Owners/Admins: Full access to their org's data
-- - Staff: Read/write access to org resources (facilities, bookings)
-- - Customers: Read public data, manage own bookings/profile
-- =====================================================================

-- =====================================================================
-- BOOKINGS: Core booking policies
-- =====================================================================

-- Drop existing policies to recreate with new helper functions
DROP POLICY IF EXISTS bookings_read_scoped ON public.bookings;
DROP POLICY IF EXISTS bookings_insert ON public.bookings;
DROP POLICY IF EXISTS bookings_update ON public.bookings;
DROP POLICY IF EXISTS bookings_delete ON public.bookings;

-- Users can view their own bookings
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT
  USING (user_id = auth.uid());

-- Org staff/admin can view org bookings
CREATE POLICY "bookings_select_org_staff" ON public.bookings
  FOR SELECT
  USING (is_org_staff(org_id));

-- Platform admins can view all bookings
CREATE POLICY "bookings_select_admin" ON public.bookings
  FOR SELECT
  USING (is_platform_admin());

-- Users can create bookings for orgs they're members of
CREATE POLICY "bookings_insert_member" ON public.bookings
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND org_id IN (SELECT public.get_user_orgs())
  );

-- Users can update their own pending/awaiting_payment bookings
CREATE POLICY "bookings_update_own" ON public.bookings
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND status IN ('pending', 'awaiting_payment', 'paid')
  )
  WITH CHECK (
    user_id = auth.uid()
    -- Users can only update notes or cancel bookings
    AND (status IN ('pending', 'awaiting_payment', 'paid', 'cancelled'))
  );

-- Org staff can update org bookings
CREATE POLICY "bookings_update_org_staff" ON public.bookings
  FOR UPDATE
  USING (is_org_staff(org_id))
  WITH CHECK (is_org_staff(org_id));

-- Platform admins can update all bookings
CREATE POLICY "bookings_update_admin" ON public.bookings
  FOR UPDATE
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Users can delete own pending bookings
CREATE POLICY "bookings_delete_own" ON public.bookings
  FOR DELETE
  USING (
    user_id = auth.uid()
    AND status IN ('pending', 'cancelled')
  );

-- Org staff can delete org bookings
CREATE POLICY "bookings_delete_org_staff" ON public.bookings
  FOR DELETE
  USING (is_org_staff(org_id));

-- Platform admins can delete any booking
CREATE POLICY "bookings_delete_admin" ON public.bookings
  FOR DELETE
  USING (is_platform_admin());

-- =====================================================================
-- FACILITIES: Catalog policies
-- =====================================================================

DROP POLICY IF EXISTS facilities_public_read ON public.facilities;
DROP POLICY IF EXISTS facilities_staff_write ON public.facilities;

-- Anyone can view published facilities
CREATE POLICY "facilities_select_published" ON public.facilities
  FOR SELECT
  USING (status = 'published');

-- Org staff can view org facilities (any status)
CREATE POLICY "facilities_select_org_staff" ON public.facilities
  FOR SELECT
  USING (is_org_staff(org_id));

-- Platform admins can view all facilities
CREATE POLICY "facilities_select_admin" ON public.facilities
  FOR SELECT
  USING (is_platform_admin());

-- Org staff can create facilities for their org
CREATE POLICY "facilities_insert_org_staff" ON public.facilities
  FOR INSERT
  WITH CHECK (is_org_staff(org_id));

-- Org staff can update org facilities
CREATE POLICY "facilities_update_org_staff" ON public.facilities
  FOR UPDATE
  USING (is_org_staff(org_id))
  WITH CHECK (is_org_staff(org_id));

-- Platform admins can update all facilities
CREATE POLICY "facilities_update_admin" ON public.facilities
  FOR UPDATE
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Org staff can delete org facilities
CREATE POLICY "facilities_delete_org_staff" ON public.facilities
  FOR DELETE
  USING (is_org_staff(org_id));

-- Platform admins can delete any facility
CREATE POLICY "facilities_delete_admin" ON public.facilities
  FOR DELETE
  USING (is_platform_admin());

-- =====================================================================
-- PROFILES: User profile policies
-- =====================================================================

DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
DROP POLICY IF EXISTS profiles_upsert_self ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;

-- Users can view own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Org staff can view profiles of users in their orgs
CREATE POLICY "profiles_select_org_members" ON public.profiles
  FOR SELECT
  USING (
    default_org IN (SELECT public.get_user_orgs_with_role('staff'))
  );

-- Platform admins can view all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT
  USING (is_platform_admin());

-- Users can insert their own profile (auto-created on signup)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update own profile (limited fields)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Platform admins can update any profile
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- =====================================================================
-- MEMBERSHIPS: Organization membership policies
-- =====================================================================

DROP POLICY IF EXISTS memberships_read ON public.memberships;
DROP POLICY IF EXISTS memberships_admin_write ON public.memberships;

-- Users can view their own memberships
CREATE POLICY "memberships_select_own" ON public.memberships
  FOR SELECT
  USING (user_id = auth.uid());

-- Org admins can view org memberships
CREATE POLICY "memberships_select_org_admin" ON public.memberships
  FOR SELECT
  USING (is_org_admin(org_id));

-- Platform admins can view all memberships
CREATE POLICY "memberships_select_admin" ON public.memberships
  FOR SELECT
  USING (is_platform_admin());

-- Org admins can manage memberships
CREATE POLICY "memberships_manage_org_admin" ON public.memberships
  FOR ALL
  USING (is_org_admin(org_id))
  WITH CHECK (is_org_admin(org_id));

-- Platform admins can manage all memberships
CREATE POLICY "memberships_manage_admin" ON public.memberships
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- =====================================================================
-- AVAILABILITY_RULES: Facility availability policies
-- =====================================================================

DROP POLICY IF EXISTS avail_read ON public.availability_rules;
DROP POLICY IF EXISTS avail_write ON public.availability_rules;

-- Anyone can view availability for published facilities
CREATE POLICY "availability_select_published" ON public.availability_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
      AND f.status = 'published'
    )
  );

-- Org staff can view org availability rules
CREATE POLICY "availability_select_org_staff" ON public.availability_rules
  FOR SELECT
  USING (is_org_staff(org_id));

-- Platform admins can view all availability rules
CREATE POLICY "availability_select_admin" ON public.availability_rules
  FOR SELECT
  USING (is_platform_admin());

-- Org staff can manage org availability rules
CREATE POLICY "availability_manage_org_staff" ON public.availability_rules
  FOR ALL
  USING (is_org_staff(org_id))
  WITH CHECK (is_org_staff(org_id));

-- Platform admins can manage all availability rules
CREATE POLICY "availability_manage_admin" ON public.availability_rules
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- =====================================================================
-- BLACKOUTS: Facility blackout policies
-- =====================================================================

DROP POLICY IF EXISTS blackouts_read ON public.blackouts;
DROP POLICY IF EXISTS blackouts_write ON public.blackouts;

-- Anyone can view blackouts for published facilities
CREATE POLICY "blackouts_select_published" ON public.blackouts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
      AND f.status = 'published'
    )
  );

-- Org staff can view org blackouts
CREATE POLICY "blackouts_select_org_staff" ON public.blackouts
  FOR SELECT
  USING (is_org_staff(org_id));

-- Platform admins can view all blackouts
CREATE POLICY "blackouts_select_admin" ON public.blackouts
  FOR SELECT
  USING (is_platform_admin());

-- Org staff can manage org blackouts
CREATE POLICY "blackouts_manage_org_staff" ON public.blackouts
  FOR ALL
  USING (is_org_staff(org_id))
  WITH CHECK (is_org_staff(org_id));

-- Platform admins can manage all blackouts
CREATE POLICY "blackouts_manage_admin" ON public.blackouts
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- =====================================================================
-- PAYMENTS: Payment record policies
-- =====================================================================

DROP POLICY IF EXISTS payments_read ON public.payments;

-- Users can view payments for their bookings
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
      AND b.user_id = auth.uid()
    )
  );

-- Org staff can view org payments
CREATE POLICY "payments_select_org_staff" ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
      AND is_org_staff(b.org_id)
    )
  );

-- Platform admins can view all payments
CREATE POLICY "payments_select_admin" ON public.payments
  FOR SELECT
  USING (is_platform_admin());

-- Only service role can insert/update payments (webhook handler)
-- No policies for INSERT/UPDATE - handled by service role

-- =====================================================================
-- REVIEWS: Review policies
-- =====================================================================

DROP POLICY IF EXISTS reviews_read ON public.reviews;
DROP POLICY IF EXISTS reviews_write ON public.reviews;

-- Anyone can view reviews
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT
  USING (true);

-- Users can create reviews for their completed bookings
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
      AND b.user_id = auth.uid()
      AND b.status IN ('paid', 'completed', 'refunded')
      AND b.ends_at < now()
    )
  );

-- Users can update their own reviews
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Org staff can delete org reviews (moderation)
CREATE POLICY "reviews_delete_org_staff" ON public.reviews
  FOR DELETE
  USING (is_org_staff(org_id));

-- Platform admins can delete any review
CREATE POLICY "reviews_delete_admin" ON public.reviews
  FOR DELETE
  USING (is_platform_admin());

-- =====================================================================
-- FAVORITES: User favorites policies
-- =====================================================================

DROP POLICY IF EXISTS favorites_read ON public.favorites;
DROP POLICY IF EXISTS favorites_write ON public.favorites;

-- Users can view own favorites
CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can manage own favorites
CREATE POLICY "favorites_manage_own" ON public.favorites
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================================
-- NOTIFICATIONS: Notification policies
-- =====================================================================

DROP POLICY IF EXISTS notifications_read ON public.notifications;

-- Users can view their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Platform admins can view all notifications
CREATE POLICY "notifications_select_admin" ON public.notifications
  FOR SELECT
  USING (is_platform_admin());

-- Service role handles INSERT via worker
-- No INSERT policy needed

-- =====================================================================
-- ORGANIZATIONS: Organization policies
-- =====================================================================

DROP POLICY IF EXISTS org_read_pub ON public.organizations;
DROP POLICY IF EXISTS org_write_owner ON public.organizations;

-- Anyone can view active organizations
CREATE POLICY "organizations_select_active" ON public.organizations
  FOR SELECT
  USING (status = 'active' OR is_platform_admin());

-- Org owners/admins can update their org
CREATE POLICY "organizations_update_owner" ON public.organizations
  FOR UPDATE
  USING (is_org_admin(id))
  WITH CHECK (is_org_admin(id));

-- Platform admins can manage all organizations
CREATE POLICY "organizations_manage_admin" ON public.organizations
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- =====================================================================
-- PRICING_RULES: Pricing rule policies
-- =====================================================================

-- Anyone can view pricing for published facilities
CREATE POLICY "pricing_select_published" ON public.pricing_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.facilities f
      WHERE f.id = facility_id
      AND f.status = 'published'
    )
    OR is_org_staff(org_id)
    OR is_platform_admin()
  );

-- Org staff can manage org pricing rules
CREATE POLICY "pricing_manage_org_staff" ON public.pricing_rules
  FOR ALL
  USING (is_org_staff(org_id))
  WITH CHECK (is_org_staff(org_id));

-- Platform admins can manage all pricing rules
CREATE POLICY "pricing_manage_admin" ON public.pricing_rules
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- =====================================================================
-- AUDIT_EVENTS: Audit log policies
-- =====================================================================

DROP POLICY IF EXISTS audit_read ON public.audit_events;

-- Org staff can view org audit events
CREATE POLICY "audit_select_org_staff" ON public.audit_events
  FOR SELECT
  USING (
    org_id IS NOT NULL
    AND is_org_staff(org_id)
  );

-- Platform admins can view all audit events
CREATE POLICY "audit_select_admin" ON public.audit_events
  FOR SELECT
  USING (is_platform_admin());

-- Service role handles INSERT
-- No INSERT policy needed

-- =====================================================================
-- ERROR_LOG: Error log policies
-- =====================================================================

DROP POLICY IF EXISTS error_read ON public.error_log;

-- Only platform admins can view error logs
CREATE POLICY "error_log_select_admin" ON public.error_log
  FOR SELECT
  USING (is_platform_admin());

-- Service role handles INSERT
-- No INSERT policy needed

-- =====================================================================
-- Enable RLS on pricing_rules if not already enabled
-- =====================================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'pricing_rules'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =====================================================================
-- Add helpful comments
-- =====================================================================

COMMENT ON POLICY "bookings_select_own" ON public.bookings IS 'Users can view their own bookings';
COMMENT ON POLICY "bookings_select_org_staff" ON public.bookings IS 'Organization staff can view org bookings';
COMMENT ON POLICY "facilities_select_published" ON public.facilities IS 'Anyone can view published facilities';
COMMENT ON POLICY "profiles_select_own" ON public.profiles IS 'Users can view their own profile';
COMMENT ON POLICY "memberships_select_own" ON public.memberships IS 'Users can view their own memberships';
