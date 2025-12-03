-- Migration: Add email field to profiles table
-- Description: Add email column to profiles table and update trigger to populate it

-- Add email column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add validation constraint for email format
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_check
CHECK (
  email IS NULL 
  OR email = ''
  OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name, phone, email, default_org)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'phone',
    NEW.email,  -- Add email from auth.users
    NULL  -- Will be set when user joins an org
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    INSERT INTO public.error_log (scope, ref, error, payload)
    VALUES (
      'auth_trigger',
      NEW.id::text,
      SQLERRM,
      jsonb_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'error', SQLERRM
      )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles to populate email from auth.users
-- This is for backward compatibility
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
AND p.email IS NULL;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration Complete: Added email to profiles';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Added email column to profiles table';
  RAISE NOTICE 'Updated handle_new_user trigger to populate email';
  RAISE NOTICE 'Populated existing profiles with email data';
  RAISE NOTICE '========================================';
END $$;