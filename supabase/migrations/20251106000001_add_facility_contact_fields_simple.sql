-- Migration: Add Contact Fields to Facilities (Simplified)
-- Description: Adds separate contact_email and contact_phone fields to facilities table

-- Add contact fields to facilities table
ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add comments for documentation
COMMENT ON COLUMN facilities.contact_email IS 'Primary contact email for the facility';
COMMENT ON COLUMN facilities.contact_phone IS 'Primary contact phone number for the facility';

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_facilities_contact_email ON facilities(contact_email);
CREATE INDEX IF NOT EXISTS idx_facilities_contact_phone ON facilities(contact_phone);

-- Add validation constraints
ALTER TABLE facilities
  ADD CONSTRAINT facilities_contact_email_check
  CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT facilities_contact_phone_check
  CHECK (contact_phone IS NULL OR contact_phone ~* '^(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$');