-- Storage Migration Tables
-- This migration creates the necessary tables for the localStorage → Supabase migration
-- Created: 2025-10-28

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BOOKINGS TABLE
-- ============================================
-- Main bookings table to replace localStorage bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id TEXT,
  facility_name TEXT,
  start_date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  duration NUMERIC,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  price_cents INTEGER DEFAULT 0,
  purpose TEXT,
  description TEXT,
  contact_person TEXT,
  booker_name TEXT,
  booker_email TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  processed_by TEXT,
  processed_at TIMESTAMPTZ,
  is_recurring BOOLEAN DEFAULT false,
  parent_booking_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_facility_id ON bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parent_booking_id ON bookings(parent_booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- RLS (Row Level Security) Policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own bookings
CREATE POLICY "Users can create their own bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending bookings
CREATE POLICY "Users can update their own pending bookings"
  ON bookings
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own bookings
CREATE POLICY "Users can delete their own bookings"
  ON bookings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admin policy (assuming admin role exists)
CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all bookings"
  ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
-- User preferences to replace localStorage preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT CHECK (language IN ('en', 'no')) DEFAULT 'no',
  filters JSONB DEFAULT '{}',
  ui_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DRAFT BOOKINGS TABLE
-- ============================================
-- Draft bookings with auto-save support
CREATE TABLE IF NOT EXISTS draft_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id TEXT,
  session_id TEXT NOT NULL,
  draft_data JSONB NOT NULL,
  last_saved TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_draft_bookings_user_id ON draft_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_bookings_booking_id ON draft_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_draft_bookings_expires_at ON draft_bookings(expires_at);
CREATE INDEX IF NOT EXISTS idx_draft_bookings_last_saved ON draft_bookings(last_saved DESC);

-- RLS Policies
ALTER TABLE draft_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drafts"
  ON draft_bookings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drafts"
  ON draft_bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
  ON draft_bookings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts"
  ON draft_bookings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-delete expired drafts function
CREATE OR REPLACE FUNCTION delete_expired_drafts()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM draft_bookings WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to delete expired drafts periodically
CREATE TRIGGER trigger_delete_expired_drafts
  AFTER INSERT OR UPDATE ON draft_bookings
  EXECUTE FUNCTION delete_expired_drafts();

-- ============================================
-- MIGRATION TRACKING TABLE
-- ============================================
-- Track migration status per user (optional)
CREATE TABLE IF NOT EXISTS migration_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phase TEXT CHECK (phase IN ('fallback', 'dual-write', 'supabase-only')) DEFAULT 'fallback',
  local_bookings_count INTEGER DEFAULT 0,
  supabase_bookings_count INTEGER DEFAULT 0,
  data_consistent BOOLEAN DEFAULT false,
  last_validated TIMESTAMPTZ,
  migration_started_at TIMESTAMPTZ DEFAULT NOW(),
  migration_completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE migration_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own migration status"
  ON migration_status
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all migration statuses"
  ON migration_status
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_migration_status_updated_at
  BEFORE UPDATE ON migration_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's booking count
CREATE OR REPLACE FUNCTION get_user_booking_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  booking_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO booking_count
  FROM bookings
  WHERE user_id = p_user_id;

  RETURN booking_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate user's data consistency
CREATE OR REPLACE FUNCTION validate_user_data_consistency(
  p_user_id UUID,
  p_local_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  supabase_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO supabase_count
  FROM bookings
  WHERE user_id = p_user_id;

  RETURN supabase_count = p_local_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old bookings (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_bookings()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM bookings
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('cancelled', 'rejected')
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE bookings IS 'Main bookings table for localStorage migration';
COMMENT ON TABLE user_preferences IS 'User preferences including language, filters, and UI settings';
COMMENT ON TABLE draft_bookings IS 'Draft bookings with auto-save support';
COMMENT ON TABLE migration_status IS 'Track migration status per user';

COMMENT ON COLUMN bookings.status IS 'Booking status: pending, approved, rejected, cancelled';
COMMENT ON COLUMN bookings.price_cents IS 'Price in cents (to avoid floating point issues)';
COMMENT ON COLUMN bookings.is_recurring IS 'Whether this booking is part of a recurring series';
COMMENT ON COLUMN bookings.parent_booking_id IS 'Reference to parent booking if recurring';

COMMENT ON COLUMN draft_bookings.expires_at IS 'Draft expiration timestamp (default 7 days)';
COMMENT ON COLUMN draft_bookings.session_id IS 'Unique session identifier for draft tracking';

-- ============================================
-- GRANTS
-- ============================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON draft_bookings TO authenticated;
GRANT SELECT ON migration_status TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id, language, filters, ui_settings)
SELECT
  id,
  'no',
  '{}',
  '{"collapsedPanels": [], "viewMode": "grid", "theme": "system"}'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- MAINTENANCE JOBS (Optional)
-- ============================================

-- Note: These require pg_cron extension
-- Uncomment and configure if pg_cron is available

-- Delete expired drafts daily at 2 AM
-- SELECT cron.schedule(
--   'delete-expired-drafts',
--   '0 2 * * *',
--   'DELETE FROM draft_bookings WHERE expires_at < NOW()'
-- );

-- Cleanup old bookings monthly
-- SELECT cron.schedule(
--   'cleanup-old-bookings',
--   '0 3 1 * *',
--   'SELECT cleanup_old_bookings()'
-- );
