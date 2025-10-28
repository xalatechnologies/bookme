-- =====================================================
-- Role System Update - English Code Implementation
-- =====================================================
-- Author: BookMe Development Team
-- Date: October 27, 2025
-- Purpose: Update org_role enum to use English role names
--          (Norwegian labels via i18n in UI)
--
-- CRITICAL: All code in English, Norwegian UI via i18n
-- =====================================================

-- Phase 1: Backup current data
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Starting role system migration to English names...';
  RAISE NOTICE 'Phase 1: Creating backup tables';
END $$;

-- Create backup of memberships table
CREATE TABLE IF NOT EXISTS memberships_backup_20251027 AS
SELECT * FROM memberships;

-- Add audit timestamp
COMMENT ON TABLE memberships_backup_20251027 IS
  'Backup created before org_role enum update to English names - 2025-10-27';

-- Phase 2: Add new English role values to enum
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 2: Adding new English role values to org_role enum';
END $$;

-- Add new English role values
-- Note: PostgreSQL requires adding enum values in separate ALTER TYPE commands
ALTER TYPE org_role ADD VALUE IF NOT EXISTS 'case_handler';
ALTER TYPE org_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE org_role ADD VALUE IF NOT EXISTS 'read_only';

-- Update enum comment to reflect new values
COMMENT ON TYPE org_role IS
  'Organization roles (English code, Norwegian UI via i18n):
   - owner: Organization owner (Eier)
   - admin: Administrator (Administrator)
   - case_handler: Case handler - main operational role (Saksbehandler)
   - editor: Content editor (Redaktør)
   - read_only: Read-only access (Lesetilgang)
   - customer: End user making bookings (Kunde)
   - staff: DEPRECATED - mapped to case_handler (Ansatt - utgått)';

-- Phase 3: Data migration from 'staff' to 'case_handler'
-- =====================================================

DO $$
DECLARE
  affected_rows INTEGER;
BEGIN
  RAISE NOTICE 'Phase 3: Migrating staff roles to case_handler';

  -- Update all 'staff' memberships to 'case_handler'
  UPDATE memberships
  SET
    role = 'case_handler',
    updated_at = NOW()
  WHERE role = 'staff';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RAISE NOTICE 'Migrated % staff memberships to case_handler', affected_rows;
END $$;

-- Phase 4: Create role hierarchy table
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 4: Creating role hierarchy table';
END $$;

-- Create table to store role hierarchy (English names)
CREATE TABLE IF NOT EXISTS role_hierarchy (
  role org_role PRIMARY KEY,
  priority INTEGER NOT NULL UNIQUE,
  label_key VARCHAR(100) NOT NULL, -- i18n key for Norwegian UI
  description_key VARCHAR(100) NOT NULL, -- i18n key for description
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE role_hierarchy IS
  'Role hierarchy with priority levels (higher = more permissions)
   Labels are i18n keys for Norwegian UI translation';

-- Insert role hierarchy with English names and i18n keys
INSERT INTO role_hierarchy (role, priority, label_key, description_key)
VALUES
  ('owner', 100, 'roles.owner', 'roles.descriptions.owner'),
  ('admin', 80, 'roles.admin', 'roles.descriptions.admin'),
  ('case_handler', 60, 'roles.case_handler', 'roles.descriptions.case_handler'),
  ('editor', 40, 'roles.editor', 'roles.descriptions.editor'),
  ('read_only', 20, 'roles.read_only', 'roles.descriptions.read_only'),
  ('customer', 10, 'roles.customer', 'roles.descriptions.customer'),
  ('staff', 60, 'roles.staff_deprecated', 'roles.descriptions.staff_deprecated')
ON CONFLICT (role) DO UPDATE SET
  priority = EXCLUDED.priority,
  label_key = EXCLUDED.label_key,
  description_key = EXCLUDED.description_key,
  updated_at = NOW();

-- Phase 5: Create permission mappings
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 5: Creating permission mappings table';
END $$;

-- Permission mappings for each role
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role org_role NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, resource, action)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource ON role_permissions(resource, action);

COMMENT ON TABLE role_permissions IS
  'Permission matrix for role-based access control
   Resources: facilities, bookings, users, organizations, reports, media
   Actions: create, read, update, delete';

-- Phase 6: Insert permission mappings
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 6: Inserting permission mappings for each role';
END $$;

-- Owner permissions (full access)
INSERT INTO role_permissions (role, resource, action, allowed)
SELECT 'owner', resource, action, true
FROM (
  VALUES
    ('facilities', 'create'), ('facilities', 'read'), ('facilities', 'update'), ('facilities', 'delete'),
    ('bookings', 'create'), ('bookings', 'read'), ('bookings', 'update'), ('bookings', 'delete'),
    ('users', 'create'), ('users', 'read'), ('users', 'update'), ('users', 'delete'),
    ('organizations', 'read'), ('organizations', 'update'), ('organizations', 'delete'),
    ('reports', 'read'), ('reports', 'export'),
    ('media', 'create'), ('media', 'read'), ('media', 'update'), ('media', 'delete'),
    ('roles', 'assign'), ('roles', 'view'),
    ('billing', 'read'), ('billing', 'update')
) AS perms(resource, action)
ON CONFLICT (role, resource, action) DO UPDATE SET
  allowed = EXCLUDED.allowed,
  updated_at = NOW();

-- Admin permissions (cannot delete org, manage billing)
INSERT INTO role_permissions (role, resource, action, allowed)
SELECT 'admin', resource, action, true
FROM (
  VALUES
    ('facilities', 'create'), ('facilities', 'read'), ('facilities', 'update'), ('facilities', 'delete'),
    ('bookings', 'create'), ('bookings', 'read'), ('bookings', 'update'), ('bookings', 'delete'),
    ('users', 'create'), ('users', 'read'), ('users', 'update'), ('users', 'delete'),
    ('organizations', 'read'), ('organizations', 'update'),
    ('reports', 'read'), ('reports', 'export'),
    ('media', 'create'), ('media', 'read'), ('media', 'update'), ('media', 'delete'),
    ('roles', 'assign'), ('roles', 'view')
) AS perms(resource, action)
ON CONFLICT (role, resource, action) DO UPDATE SET
  allowed = EXCLUDED.allowed,
  updated_at = NOW();

-- Case Handler permissions (operational booking management)
INSERT INTO role_permissions (role, resource, action, allowed)
SELECT 'case_handler', resource, action, true
FROM (
  VALUES
    ('facilities', 'read'),
    ('bookings', 'create'), ('bookings', 'read'), ('bookings', 'update'), ('bookings', 'delete'),
    ('users', 'read'),
    ('reports', 'read'),
    ('availability_rules', 'read'), ('availability_rules', 'update')
) AS perms(resource, action)
ON CONFLICT (role, resource, action) DO UPDATE SET
  allowed = EXCLUDED.allowed,
  updated_at = NOW();

-- Editor permissions (content management)
INSERT INTO role_permissions (role, resource, action, allowed)
SELECT 'editor', resource, action, true
FROM (
  VALUES
    ('facilities', 'read'), ('facilities', 'update'),
    ('bookings', 'read'),
    ('media', 'create'), ('media', 'read'), ('media', 'update'), ('media', 'delete'),
    ('tags', 'create'), ('tags', 'read'), ('tags', 'update'),
    ('categories', 'create'), ('categories', 'read'), ('categories', 'update')
) AS perms(resource, action)
ON CONFLICT (role, resource, action) DO UPDATE SET
  allowed = EXCLUDED.allowed,
  updated_at = NOW();

-- Read Only permissions (view only)
INSERT INTO role_permissions (role, resource, action, allowed)
SELECT 'read_only', resource, action, true
FROM (
  VALUES
    ('facilities', 'read'),
    ('bookings', 'read'),
    ('users', 'read'),
    ('reports', 'read'),
    ('organizations', 'read')
) AS perms(resource, action)
ON CONFLICT (role, resource, action) DO UPDATE SET
  allowed = EXCLUDED.allowed,
  updated_at = NOW();

-- Customer permissions (own bookings only)
INSERT INTO role_permissions (role, resource, action, allowed)
SELECT 'customer', resource, action, true
FROM (
  VALUES
    ('facilities', 'read'),
    ('bookings', 'create'), ('bookings', 'read'),
    ('reviews', 'create'), ('reviews', 'read')
) AS perms(resource, action)
ON CONFLICT (role, resource, action) DO UPDATE SET
  allowed = EXCLUDED.allowed,
  updated_at = NOW();

-- Staff permissions (deprecated - same as case_handler)
INSERT INTO role_permissions (role, resource, action, allowed)
SELECT 'staff', resource, action, allowed
FROM role_permissions
WHERE role = 'case_handler'
ON CONFLICT (role, resource, action) DO UPDATE SET
  allowed = EXCLUDED.allowed,
  updated_at = NOW();

-- Phase 7: Create helper functions for role checking
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 7: Creating RLS helper functions';
END $$;

-- Function: Get role priority
CREATE OR REPLACE FUNCTION get_role_priority(user_role org_role)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  role_priority INTEGER;
BEGIN
  -- Map deprecated 'staff' to 'case_handler' priority
  IF user_role = 'staff' THEN
    user_role := 'case_handler';
  END IF;

  SELECT priority INTO role_priority
  FROM role_hierarchy
  WHERE role = user_role;

  RETURN COALESCE(role_priority, 0);
END;
$$;

COMMENT ON FUNCTION get_role_priority IS
  'Returns numeric priority for a given role (higher = more permissions)';

-- Function: Check if user has minimum role level
CREATE OR REPLACE FUNCTION has_minimum_role(
  user_id UUID,
  org_id UUID,
  minimum_role org_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_role org_role;
  user_priority INTEGER;
  min_priority INTEGER;
BEGIN
  -- Get user's role in organization
  SELECT m.role INTO user_role
  FROM memberships m
  WHERE m.user_id = has_minimum_role.user_id
    AND m.organization_id = has_minimum_role.org_id
    AND m.status = 'active';

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Check priority levels
  user_priority := get_role_priority(user_role);
  min_priority := get_role_priority(minimum_role);

  RETURN user_priority >= min_priority;
END;
$$;

COMMENT ON FUNCTION has_minimum_role IS
  'Checks if user has at least the specified role level in an organization';

-- Function: Check specific permission
CREATE OR REPLACE FUNCTION has_permission(
  user_id UUID,
  org_id UUID,
  resource_name VARCHAR(50),
  action_name VARCHAR(20)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  user_role org_role;
  is_allowed BOOLEAN;
BEGIN
  -- Get user's role in organization
  SELECT m.role INTO user_role
  FROM memberships m
  WHERE m.user_id = has_permission.user_id
    AND m.organization_id = has_permission.org_id
    AND m.status = 'active';

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Map deprecated 'staff' to 'case_handler'
  IF user_role = 'staff' THEN
    user_role := 'case_handler';
  END IF;

  -- Check permission
  SELECT rp.allowed INTO is_allowed
  FROM role_permissions rp
  WHERE rp.role = user_role
    AND rp.resource = resource_name
    AND rp.action = action_name;

  RETURN COALESCE(is_allowed, false);
END;
$$;

COMMENT ON FUNCTION has_permission IS
  'Checks if user has specific permission for a resource/action combination';

-- Phase 8: Update RLS policies to use new role names
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 8: Updating RLS policies (if they exist)';
  RAISE NOTICE 'Note: Specific RLS updates should be in separate migration files';
END $$;

-- Note: Actual RLS policy updates should be in a separate migration file
-- This is just a placeholder comment for documentation

-- Phase 9: Create audit log
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 9: Creating migration audit log';
END $$;

-- Create audit log table if not exists
CREATE TABLE IF NOT EXISTS migration_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name VARCHAR(255) NOT NULL,
  description TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  applied_by VARCHAR(255),
  success BOOLEAN DEFAULT true,
  notes TEXT
);

-- Log this migration
INSERT INTO migration_audit_log (migration_name, description, applied_by, notes)
VALUES (
  '20251027000001_update_org_roles_english',
  'Updated org_role enum to use English role names (Norwegian UI via i18n)',
  'system',
  'Added: case_handler, editor, read_only. Deprecated: staff (mapped to case_handler). Created role_hierarchy and role_permissions tables.'
);

-- Phase 10: Verification
-- =====================================================

DO $$
DECLARE
  enum_values TEXT;
  total_memberships INTEGER;
  case_handler_count INTEGER;
  staff_count INTEGER;
BEGIN
  RAISE NOTICE 'Phase 10: Migration verification';

  -- Verify enum values
  SELECT string_agg(enumlabel, ', ' ORDER BY enumlabel) INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'org_role'::regtype;

  RAISE NOTICE 'Current org_role enum values: %', enum_values;

  -- Count memberships
  SELECT COUNT(*) INTO total_memberships FROM memberships;
  SELECT COUNT(*) INTO case_handler_count FROM memberships WHERE role = 'case_handler';
  SELECT COUNT(*) INTO staff_count FROM memberships WHERE role = 'staff';

  RAISE NOTICE 'Total memberships: %', total_memberships;
  RAISE NOTICE 'Case handlers: %', case_handler_count;
  RAISE NOTICE 'Staff (deprecated): %', staff_count;

  -- Verify role hierarchy
  RAISE NOTICE 'Role hierarchy created: %', (SELECT COUNT(*) FROM role_hierarchy);
  RAISE NOTICE 'Permission mappings created: %', (SELECT COUNT(*) FROM role_permissions);

  RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Phase 11: Add indexes for performance
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 11: Creating performance indexes';
END $$;

-- Index on memberships.role for faster role lookups
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role);
CREATE INDEX IF NOT EXISTS idx_memberships_user_org_role ON memberships(user_id, organization_id, role);

-- Phase 12: Grant permissions
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 12: Granting table permissions';
END $$;

-- Grant SELECT on role_hierarchy to authenticated users
GRANT SELECT ON role_hierarchy TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;

-- Only service role can modify these tables
GRANT ALL ON role_hierarchy TO service_role;
GRANT ALL ON role_permissions TO service_role;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Role System Migration Complete!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update TypeScript types: npx supabase gen types typescript';
  RAISE NOTICE '2. Update frontend constants with English role names';
  RAISE NOTICE '3. Implement i18n translations for Norwegian UI';
  RAISE NOTICE '4. Update RBAC service to use new role names';
  RAISE NOTICE '5. Test all permission scenarios';
  RAISE NOTICE '==============================================';
END $$;
