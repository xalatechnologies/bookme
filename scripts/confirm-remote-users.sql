-- Auto-confirm all test users
-- Run this in Supabase SQL Editor to confirm all newly created users

UPDATE auth.users
SET 
  email_confirmed_at = NOW()
WHERE email IN (
  'test.user@drammen.kommune.no',
  'staff@drammen.kommune.no',
  'admin@drammen.kommune.no',
  'owner@drammen.kommune.no',
  'superadmin@bookme.no'
)
AND email_confirmed_at IS NULL;

-- Verify the update
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email IN (
  'test.user@drammen.kommune.no',
  'staff@drammen.kommune.no',
  'admin@drammen.kommune.no',
  'owner@drammen.kommune.no',
  'superadmin@bookme.no'
)
ORDER BY email;
