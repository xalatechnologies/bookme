-- Migration: Create Facility Rules Table
-- Description: Creates a table to store rules for facilities

-- Create facility_rules table
CREATE TABLE IF NOT EXISTS facility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL,
  rule_text text NOT NULL,
  rule_type text NOT NULL DEFAULT 'booking', -- 'booking', 'safety', 'general', 'cancellation', etc.
  is_required boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'facility_rules_facility_id_fkey'
  ) THEN
    ALTER TABLE facility_rules
      ADD CONSTRAINT facility_rules_facility_id_fkey 
      FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_facility_rules_facility_id ON facility_rules(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_rules_type ON facility_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_facility_rules_sort_order ON facility_rules(sort_order);

-- Add comments
COMMENT ON TABLE facility_rules IS 'Stores rules and policies for facilities';
COMMENT ON COLUMN facility_rules.facility_id IS 'Reference to the facility';
COMMENT ON COLUMN facility_rules.rule_text IS 'The actual rule text';
COMMENT ON COLUMN facility_rules.rule_type IS 'Type of rule: booking, safety, general, cancellation';
COMMENT ON COLUMN facility_rules.is_required IS 'Whether this rule must be acknowledged by users';
COMMENT ON COLUMN facility_rules.sort_order IS 'Order in which rules should be displayed';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS touch_facility_rules ON facility_rules;
CREATE TRIGGER touch_facility_rules 
  BEFORE UPDATE ON facility_rules 
  FOR EACH ROW 
  EXECUTE PROCEDURE touch_updated_at();

-- Enable Row Level Security
ALTER TABLE facility_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "facility_rules_select_published" ON facility_rules;
DROP POLICY IF EXISTS "facility_rules_select_org_staff" ON facility_rules;
DROP POLICY IF EXISTS "facility_rules_select_admin" ON facility_rules;
DROP POLICY IF EXISTS "facility_rules_manage_org_staff" ON facility_rules;
DROP POLICY IF EXISTS "facility_rules_manage_admin" ON facility_rules;

-- Anyone can view rules for published facilities
CREATE POLICY "facility_rules_select_published" ON facility_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM facilities f
      WHERE f.id = facility_id
      AND f.status = 'published'
    )
  );

-- Org staff can view all rules for their org's facilities
CREATE POLICY "facility_rules_select_org_staff" ON facility_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM facilities f
      WHERE f.id = facility_id
      AND is_org_staff(f.org_id)
    )
  );

-- Platform admins can view all rules
CREATE POLICY "facility_rules_select_admin" ON facility_rules
  FOR SELECT
  USING (is_platform_admin());

-- Org staff can manage rules for their org's facilities
CREATE POLICY "facility_rules_manage_org_staff" ON facility_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM facilities f
      WHERE f.id = facility_id
      AND is_org_staff(f.org_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM facilities f
      WHERE f.id = facility_id
      AND is_org_staff(f.org_id)
    )
  );

-- Platform admins can manage all rules
CREATE POLICY "facility_rules_manage_admin" ON facility_rules
  FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());
