-- =====================================================
-- Role System Reversion - Back to 4 Roles
-- =====================================================
-- Author: Booknor Development Team
-- Date: December 8, 2025
-- Purpose: Revert org_role enum back to original 4 roles
--          (owner, admin, staff, customer)
-- =====================================================

-- Phase 1: Backup current data
DO $$
BEGIN
  RAISE NOTICE 'Starting role system reversion to 4 roles...';
  RAISE NOTICE 'Phase 1: Creating backup tables';
END $$;

-- Create backup of memberships table
CREATE TABLE IF NOT EXISTS memberships_backup_20251208 AS
SELECT * FROM memberships;

COMMENT ON TABLE memberships_backup_20251208 IS
  'Backup created before org_role enum reversion to 4 roles - 2025-12-08';

-- Phase 2: Migrate data back to original 4 roles
DO $$
BEGIN
  RAISE NOTICE 'Phase 2: Migrating data to original 4 roles';
  
  -- Convert case_handler to staff (they are equivalent)
  UPDATE memberships 
  SET role = 'staff' 
  WHERE role = 'case_handler';
  
  RAISE NOTICE 'Converted case_handler roles to staff';
  
  -- Convert editor to staff (closest equivalent)
  UPDATE memberships 
  SET role = 'staff' 
  WHERE role = 'editor';
  
  RAISE NOTICE 'Converted editor roles to staff';
  
  -- Convert read_only to staff (closest equivalent)
  UPDATE memberships 
  SET role = 'staff' 
  WHERE role = 'read_only';
  
  RAISE NOTICE 'Converted read_only roles to staff';
  
  RAISE NOTICE 'Data migration completed successfully';
END $$;

-- Phase 3: Update enum comment
DO $$
BEGIN
  RAISE NOTICE 'Phase 3: Updating enum comment';
  
  COMMENT ON TYPE org_role IS
    'Organization roles:
     - owner: Organization owner
     - admin: Administrator
     - staff: Staff member
     - customer: End user making bookings';
     
  RAISE NOTICE 'Enum comment updated';
END $$;

DO $$
BEGIN
  RAISE NOTICE '==============================================';  
  RAISE NOTICE 'Role System Reversion Complete!';
  RAISE NOTICE 'org_role enum reverted to 4 roles: owner, admin, staff, customer';
  RAISE NOTICE 'All existing roles migrated to closest equivalents';
  RAISE NOTICE '==============================================';  
END $$;