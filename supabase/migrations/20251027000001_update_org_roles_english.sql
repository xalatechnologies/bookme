-- =====================================================
-- Role System Update - Phase 1: Add Enum Values Only
-- =====================================================
-- Author: Booknor Development Team
-- Date: October 27, 2025
-- Purpose: Add new English role names to org_role enum
--          Data migration and tables in subsequent migration
-- =====================================================

-- Phase 1: Backup current data
DO $$
BEGIN
  RAISE NOTICE 'Starting role system migration to English names...';
  RAISE NOTICE 'Phase 1: Creating backup tables';
END $$;

-- Create backup of memberships table
CREATE TABLE IF NOT EXISTS memberships_backup_20251027 AS
SELECT * FROM memberships;

COMMENT ON TABLE memberships_backup_20251027 IS
  'Backup created before org_role enum update to English names - 2025-10-27';

-- Phase 2: Add new English role values to enum
DO $$
BEGIN
  RAISE NOTICE 'Phase 2: Adding new English role values to org_role enum';
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'case_handler' AND enumtypid = 'org_role'::regtype) THEN
    EXECUTE 'ALTER TYPE org_role ADD VALUE ''case_handler''';
    RAISE NOTICE 'Added case_handler to org_role enum';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'editor' AND enumtypid = 'org_role'::regtype) THEN
    EXECUTE 'ALTER TYPE org_role ADD VALUE ''editor''';
    RAISE NOTICE 'Added editor to org_role enum';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'read_only' AND enumtypid = 'org_role'::regtype) THEN
    EXECUTE 'ALTER TYPE org_role ADD VALUE ''read_only''';
    RAISE NOTICE 'Added read_only to org_role enum';
  END IF;
  
  RAISE NOTICE 'Enum values added successfully';
  RAISE NOTICE 'Note: Tables and data migration will be in next migration file';
END $$;

-- Update enum comment
COMMENT ON TYPE org_role IS
  'Organization roles (English code, Norwegian UI via i18n):
   - owner: Organization owner (Eier)
   - admin: Administrator (Administrator)
   - case_handler: Case handler - main operational role (Saksbehandler)
   - editor: Content editor (Redaktør)
   - read_only: Read-only access (Lesetilgang)
   - customer: End user making bookings (Kunde)
   - staff: DEPRECATED - use case_handler (Ansatt - utgått)';

DO $$
BEGIN
  RAISE NOTICE '==============================================';  
  RAISE NOTICE 'Phase 1 Migration Complete!';
  RAISE NOTICE 'New enum values added: case_handler, editor, read_only';
  RAISE NOTICE 'Next migration will create tables and migrate data';
  RAISE NOTICE '==============================================';  
END $$;
