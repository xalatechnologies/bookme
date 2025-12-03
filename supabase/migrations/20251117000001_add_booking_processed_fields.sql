-- Add processed_by and processed_at fields to bookings table
-- This migration adds fields to track who processed a booking and when

-- Add processed_by column to track which admin processed the booking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS processed_by TEXT;

-- Add processed_at column to track when the booking was processed
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_processed_by ON bookings(processed_by);
CREATE INDEX IF NOT EXISTS idx_bookings_processed_at ON bookings(processed_at);