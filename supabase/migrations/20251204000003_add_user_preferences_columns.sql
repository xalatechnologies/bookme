-- Add user preference columns to profiles table
-- This migration adds columns for language, portal preference, and view modes

-- Add language preference column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'no';

-- Add portal preference column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_portal VARCHAR(10) DEFAULT 'user';

-- Add favorites view mode column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS favorites_view_mode VARCHAR(10) DEFAULT 'grid';

-- Add last login timestamp (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN profiles.language IS 'User preferred language (no, en)';
COMMENT ON COLUMN profiles.preferred_portal IS 'Last used portal (user, admin)';
COMMENT ON COLUMN profiles.favorites_view_mode IS 'Preferred view mode for favorites (grid, list)';
COMMENT ON COLUMN profiles.last_login_at IS 'Timestamp of last successful login';
