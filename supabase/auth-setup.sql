-- =====================================================
-- Authentication & RBAC Test Data Setup for BookMe
-- =====================================================
-- This file creates test users with different roles for
-- local development and testing.
--
-- Test Users Created:
--   1. test.user@drammen.kommune.no - Regular customer (password: password123)
--   2. staff@drammen.kommune.no - Organization staff (password: password123)
--   3. admin@drammen.kommune.no - Organization admin (password: password123)
--   4. owner@drammen.kommune.no - Organization owner (password: password123)
--   5. superadmin@bookme.no - Platform admin (password: password123)
--
-- Usage (via Supabase CLI):
--   supabase db reset  # This will run all migrations including seed data
--
-- Or directly via psql:
--   PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f auth-setup.sql
--
-- =====================================================

-- =====================================================
-- IMPORTANT: Create Test Users via Supabase Auth
-- =====================================================
-- These users should be created through Supabase Auth API or Dashboard
-- with password "password123" for local testing.
--
-- For automated setup, use the Supabase CLI or create via API:
--   supabase auth create-user test.user@drammen.kommune.no --password password123
--
-- User IDs are generated on signup. The profiles will be auto-created
-- by the handle_new_user() trigger we created in the migrations.
--
-- For this demo, we'll insert test auth users directly:
-- =====================================================

-- Note: In production, users sign up through the application.
-- This is for local development/testing only.

DO $$
DECLARE
  test_user_id uuid := '10000000-0000-0000-0000-000000000001'::uuid;
  staff_user_id uuid := '10000000-0000-0000-0000-000000000002'::uuid;
  admin_user_id uuid := '10000000-0000-0000-0000-000000000003'::uuid;
  owner_user_id uuid := '10000000-0000-0000-0000-000000000004'::uuid;
  superadmin_user_id uuid := '10000000-0000-0000-0000-000000000005'::uuid;
  drammen_org_id uuid;
BEGIN
  -- Get Drammen Kommune org ID
  SELECT id INTO drammen_org_id FROM public.organizations WHERE slug = 'drammen-kommune';

  -- If no org exists, create one
  IF drammen_org_id IS NULL THEN
    INSERT INTO public.organizations (id, name, slug, timezone, status)
    VALUES (
      '20000000-0000-0000-0000-000000000001'::uuid,
      'Drammen Kommune',
      'drammen-kommune',
      'Europe/Oslo',
      'active'
    )
    RETURNING id INTO drammen_org_id;
  END IF;

  -- Insert test users into auth.users
  -- Note: These users bypass the normal Supabase Auth flow
  -- In a real environment, use Supabase Auth API

  -- 1. Regular Customer
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    test_user_id,
    'authenticated',
    'authenticated',
    'test.user@drammen.kommune.no',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Test","last_name":"Bruker"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Staff Member
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    staff_user_id,
    'authenticated',
    'authenticated',
    'staff@drammen.kommune.no',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Staff","last_name":"Member"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- 3. Organization Admin
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@drammen.kommune.no',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- 4. Organization Owner
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    owner_user_id,
    'authenticated',
    'authenticated',
    'owner@drammen.kommune.no',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Owner","last_name":"User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- 5. Platform Super Admin
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    superadmin_user_id,
    'authenticated',
    'authenticated',
    'superadmin@bookme.no',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"],"role":"platform_admin"}',
    '{"first_name":"Super","last_name":"Admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create profiles (will be auto-created by trigger, but we ensure they exist)
  INSERT INTO public.profiles (user_id, display_name, phone, default_org)
  VALUES
    (test_user_id, 'Test Bruker', '+47 123 45 678', drammen_org_id),
    (staff_user_id, 'Staff Member', '+47 234 56 789', drammen_org_id),
    (admin_user_id, 'Admin User', '+47 345 67 890', drammen_org_id),
    (owner_user_id, 'Owner User', '+47 456 78 901', drammen_org_id),
    (superadmin_user_id, 'Super Admin', '+47 567 89 012', drammen_org_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create memberships
  INSERT INTO public.memberships (org_id, user_id, role)
  VALUES
    (drammen_org_id, test_user_id, 'customer'),
    (drammen_org_id, staff_user_id, 'staff'),
    (drammen_org_id, admin_user_id, 'admin'),
    (drammen_org_id, owner_user_id, 'owner')
  ON CONFLICT (org_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  RAISE NOTICE 'Test users created successfully!';
  RAISE NOTICE 'Drammen Kommune Org ID: %', drammen_org_id;
END $$;

-- Verify the setup
SELECT '=====================================' AS info;
SELECT 'Auth & RBAC Setup Complete!' AS info;
SELECT '=====================================' AS info;

SELECT '' AS separator;
SELECT 'Test Users Created:' AS info;
SELECT
  email AS "Email",
  (raw_user_meta_data::jsonb)->>'first_name' || ' ' || (raw_user_meta_data::jsonb)->>'last_name' AS "Name",
  CASE
    WHEN (raw_app_meta_data::jsonb)->>'role' = 'platform_admin' THEN 'Platform Admin'
    ELSE 'Regular User'
  END AS "Type"
FROM auth.users
WHERE id::text LIKE '10000000%'
ORDER BY email;

SELECT '' AS separator;
SELECT 'Organization Memberships:' AS info;
SELECT
  u.email AS "Email",
  o.name AS "Organization",
  m.role AS "Role"
FROM public.memberships m
JOIN auth.users u ON m.user_id = u.id
JOIN public.organizations o ON m.org_id = o.id
WHERE m.user_id::text LIKE '10000000%'
ORDER BY u.email;

SELECT '' AS separator;
SELECT 'Login Credentials:' AS info;
SELECT '  Email: test.user@drammen.kommune.no | Password: password123 | Role: Customer' AS credentials
UNION ALL
SELECT '  Email: staff@drammen.kommune.no | Password: password123 | Role: Staff'
UNION ALL
SELECT '  Email: admin@drammen.kommune.no | Password: password123 | Role: Admin'
UNION ALL
SELECT '  Email: owner@drammen.kommune.no | Password: password123 | Role: Owner'
UNION ALL
SELECT '  Email: superadmin@bookme.no | Password: password123 | Role: Platform Admin';

SELECT '' AS separator;
SELECT '=====================================' AS info;
SELECT 'Ready for testing!' AS info;
SELECT '=====================================' AS info;
