-- =====================================================
-- Tighten tags RLS Policy
-- =====================================================
-- Author: Booknor Development Team
-- Date: December 8, 2025
-- Purpose: Replace tags_read policy using(true) with scoped policy
-- =====================================================

-- Phase 1: Drop existing policy
DO $$
BEGIN
  RAISE NOTICE 'Dropping existing tags_read policy...';
  DROP POLICY IF EXISTS tags_read ON tags;
  RAISE NOTICE 'Existing policy dropped successfully';
END $$;

-- Phase 2: Create new scoped policy
DO $$
BEGIN
  RAISE NOTICE 'Creating new scoped tags_read policy...';
  
  -- New policy: Only allow reading tags that are associated with facilities
  -- that the user has access to (published facilities or org membership)
  CREATE POLICY tags_read ON tags FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM facility_tags ft
      JOIN facilities f ON ft.tag_id = tags.id AND ft.facility_id = f.id
      WHERE f.status = 'published' 
         OR is_org_member(f.org_id, 'staff')
         OR is_platform_admin()
    )
  );
  
  RAISE NOTICE 'New scoped tags_read policy created successfully';
END $$;

-- Phase 3: Add comment to policy
DO $$
BEGIN
  RAISE NOTICE 'Adding policy comment...';
  
  COMMENT ON POLICY tags_read ON tags IS 
    'Allow reading tags that are associated with facilities the user can access';
    
  RAISE NOTICE 'Policy comment added';
END $$;

-- Phase 4: Verify policy
DO $$
BEGIN
  RAISE NOTICE 'Verifying new policy...';
  
  -- Check that policy exists
  IF EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    WHERE cls.relname = 'tags' 
    AND pol.polname = 'tags_read'
  ) THEN
    RAISE NOTICE 'SUCCESS: New tags_read policy is active';
  ELSE
    RAISE EXCEPTION 'ERROR: New tags_read policy not found';
  END IF;
  
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Tags RLS Policy Tightening Complete!';
  RAISE NOTICE '- Replaced using(true) with scoped policy';
  RAISE NOTICE '- Tags now only visible for associated facilities';
  RAISE NOTICE '- Maintains access for published facilities and staff';
  RAISE NOTICE '==================================================';
END $$;