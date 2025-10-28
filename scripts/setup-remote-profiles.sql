-- Setup profiles and memberships for test users on remote Supabase
-- Run this in Supabase SQL Editor after confirming users

-- First, get the organization ID (you may need to adjust the slug)
DO $$
DECLARE
  org_uuid UUID;
  test_user_id UUID;
  staff_user_id UUID;
  admin_user_id UUID;
  owner_user_id UUID;
  super_admin_id UUID;
BEGIN
  -- Get organization ID
  SELECT id INTO org_uuid FROM organizations WHERE slug = 'drammen-kommune' LIMIT 1;
  
  -- If organization doesn't exist, create it
  IF org_uuid IS NULL THEN
    INSERT INTO organizations (
      name,
      slug,
      timezone,
      status,
      created_at,
      updated_at
    ) VALUES (
      'Drammen Kommune',
      'drammen-kommune',
      'Europe/Oslo',
      'active',
      NOW(),
      NOW()
    ) RETURNING id INTO org_uuid;
    
    RAISE NOTICE 'Created organization with ID: %', org_uuid;
  ELSE
    RAISE NOTICE 'Using existing organization with ID: %', org_uuid;
  END IF;

  -- Get user IDs
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test.user@drammen.kommune.no';
  SELECT id INTO staff_user_id FROM auth.users WHERE email = 'staff@drammen.kommune.no';
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@drammen.kommune.no';
  SELECT id INTO owner_user_id FROM auth.users WHERE email = 'owner@drammen.kommune.no';
  SELECT id INTO super_admin_id FROM auth.users WHERE email = 'superadmin@bookme.no';

  -- Create or update profiles
  INSERT INTO profiles (user_id, display_name, created_at, updated_at)
  VALUES 
    (test_user_id, 'Test Bruker', NOW(), NOW()),
    (staff_user_id, 'Staff Member', NOW(), NOW()),
    (admin_user_id, 'Admin User', NOW(), NOW()),
    (owner_user_id, 'Owner User', NOW(), NOW()),
    (super_admin_id, 'Super Admin', NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

  RAISE NOTICE 'Profiles created/updated';

  -- Create or update memberships (skip platform admin)
  INSERT INTO memberships (user_id, org_id, role, created_at)
  VALUES 
    (test_user_id, org_uuid, 'customer', NOW()),
    (staff_user_id, org_uuid, 'staff', NOW()),
    (admin_user_id, org_uuid, 'admin', NOW()),
    (owner_user_id, org_uuid, 'owner', NOW())
  ON CONFLICT (user_id, org_id) 
  DO UPDATE SET 
    role = EXCLUDED.role;

  RAISE NOTICE 'Memberships created/updated';
END $$;

-- Verify the setup
SELECT 
  u.email,
  p.display_name,
  m.role,
  o.name as organization
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN memberships m ON m.user_id = u.id
LEFT JOIN organizations o ON o.id = m.org_id
WHERE u.email IN (
  'test.user@drammen.kommune.no',
  'staff@drammen.kommune.no',
  'admin@drammen.kommune.no',
  'owner@drammen.kommune.no',
  'superadmin@bookme.no'
)
ORDER BY u.email;
