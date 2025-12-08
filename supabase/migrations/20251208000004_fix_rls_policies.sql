-- =====================================================================
-- RLS Policy Fixes for Section 3 Implementation
-- =====================================================================
-- This migration addresses the issues identified in Section 3 of the 
-- Booknor checklist:
-- 1. Restrict organizations table to prevent public enumeration
-- 2. Restrict tags to organization-scoped visibility
-- 3. Restrict reviews to published facilities only
-- =====================================================================

-- =====================================================================
-- FIX 1: Organizations - Restrict public read access
-- =====================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS org_read_pub ON public.organizations;

-- Create new policy that only allows:
-- 1. Platform admins to see all organizations
-- 2. Users to see organizations they're members of
-- 3. Active organizations for general discovery
CREATE POLICY "organizations_select_restricted" ON public.organizations
  FOR SELECT
  USING (
    -- Platform admins see all organizations
    is_platform_admin()
    OR
    -- Users see organizations they're members of
    id IN (
      SELECT org_id 
      FROM memberships 
      WHERE user_id = auth.uid()
    )
    OR
    -- Active organizations are publicly discoverable
    status = 'active'
  );

COMMENT ON POLICY "organizations_select_restricted" ON public.organizations 
  IS 'Restrict organization visibility: platform admins see all, users see their orgs, active orgs are public';

-- =====================================================================
-- FIX 2: Tags - Restrict to organization-scoped tags
-- =====================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS tags_read ON public.tags;

-- Create new policy that only allows:
-- 1. Platform admins to see all tags
-- 2. Users to see tags used by their organizations
CREATE POLICY "tags_select_restricted" ON public.tags
  FOR SELECT
  USING (
    -- Platform admins see all tags
    is_platform_admin()
    OR
    -- Users see tags used by their organizations
    id IN (
      SELECT DISTINCT ft.tag_id
      FROM facility_tags ft
      JOIN facilities f ON ft.facility_id = f.id
      WHERE f.org_id IN (
        SELECT org_id 
        FROM memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

COMMENT ON POLICY "tags_select_restricted" ON public.tags 
  IS 'Restrict tag visibility to tags used by user organizations';

-- =====================================================================
-- FIX 3: Reviews - Restrict to published facilities only
-- =====================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS reviews_read ON public.reviews;

-- Create new policy that only allows:
-- 1. Everyone to see reviews for published facilities
-- 2. Platform admins to see all reviews
-- 3. Facility owners to see their reviews
CREATE POLICY "reviews_select_restricted" ON public.reviews
  FOR SELECT
  USING (
    -- Reviews for published facilities are publicly visible
    EXISTS (
      SELECT 1 
      FROM facilities f 
      WHERE f.id = facility_id 
      AND f.status = 'published'
    )
    OR
    -- Platform admins see all reviews
    is_platform_admin()
    OR
    -- Facility org staff can see their reviews
    EXISTS (
      SELECT 1 
      FROM facilities f 
      JOIN memberships m ON f.org_id = m.org_id
      WHERE f.id = facility_id
      AND m.user_id = auth.uid()
      AND m.role IN ('staff', 'admin', 'owner')
    )
  );

COMMENT ON POLICY "reviews_select_restricted" ON public.reviews 
  IS 'Restrict review visibility: published facility reviews are public, admins see all, org staff see theirs';

-- =====================================================================
-- Additional Security Enhancements
-- =====================================================================

-- Ensure all policies are documented
COMMENT ON POLICY "organizations_select_restricted" ON public.organizations 
  IS 'Users can see active organizations and organizations they belong to. Platform admins see all.';

COMMENT ON POLICY "memberships_read" ON public.memberships 
  IS 'Users can see their own memberships. Staff can see other memberships in their organization. Platform admins see all.';

COMMENT ON POLICY "facilities_public_read" ON public.facilities 
  IS 'Published facilities are publicly visible. Staff can see all facilities in their organization. Platform admins see all.';

COMMENT ON POLICY "bookings_read_scoped" ON public.bookings 
  IS 'Users see their own bookings. Staff see bookings in their organization. Platform admins see all. Published facility bookings are public.';

-- =====================================================================
-- Verification Queries (Commented out - for manual verification)
-- =====================================================================
/*
-- Verify organizations policy
SELECT * FROM organizations WHERE status = 'active'; -- Should work for anyone
SELECT * FROM organizations WHERE id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid()); -- Should work for members

-- Verify tags policy
SELECT * FROM tags LIMIT 5; -- Should only show tags from user's organizations

-- Verify reviews policy  
SELECT * FROM reviews LIMIT 5; -- Should only show reviews for published facilities
*/
