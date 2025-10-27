-- =====================================================================
-- Authentication Triggers
-- =====================================================================
-- This migration creates triggers to automatically handle user lifecycle
-- events such as profile creation and cleanup.
--
-- Triggers:
-- - handle_new_user(): Auto-create profile when user signs up
-- - handle_user_deletion(): Cleanup when user is deleted
-- - update_updated_at(): Auto-update timestamps
-- =====================================================================

-- =====================================================================
-- Auto-create profile trigger
-- =====================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name, phone, default_org)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'phone',
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

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically create profile when user signs up';

-- =====================================================================
-- Handle user deletion trigger
-- =====================================================================

-- Function to handle user deletion cleanup
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Profile will be cascade deleted by FK constraint
  -- Log the deletion for audit
  INSERT INTO public.audit_events (org_id, actor_id, action, entity, entity_id, details)
  VALUES (
    NULL,
    OLD.id,
    'user.deleted',
    'user',
    OLD.id,
    jsonb_build_object(
      'email', OLD.email,
      'deleted_at', now()
    )
  );

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail deletion due to audit error
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

COMMENT ON FUNCTION public.handle_user_deletion() IS 'Handle cleanup when user is deleted';

-- =====================================================================
-- Update timestamp triggers
-- =====================================================================

-- Generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_facilities_updated_at ON public.facilities;
CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

COMMENT ON FUNCTION public.update_updated_at() IS 'Automatically update updated_at timestamp';

-- =====================================================================
-- Audit logging triggers
-- =====================================================================

-- Function to log booking status changes
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_events (org_id, actor_id, action, entity, entity_id, details)
    VALUES (
      NEW.org_id,
      auth.uid(),
      'booking.status_changed',
      'booking',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'booking_id', NEW.id,
        'facility_id', NEW.facility_id,
        'user_id', NEW.user_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking status changes
DROP TRIGGER IF EXISTS log_booking_status_change ON public.bookings;
CREATE TRIGGER log_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_booking_status_change();

COMMENT ON FUNCTION public.log_booking_status_change() IS 'Log booking status changes to audit log';

-- =====================================================================
-- Membership change triggers
-- =====================================================================

-- Function to log membership changes
CREATE OR REPLACE FUNCTION public.log_membership_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_events (org_id, actor_id, action, entity, entity_id, details)
    VALUES (
      NEW.org_id,
      auth.uid(),
      'membership.created',
      'membership',
      NEW.user_id,
      jsonb_build_object(
        'org_id', NEW.org_id,
        'user_id', NEW.user_id,
        'role', NEW.role
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_events (org_id, actor_id, action, entity, entity_id, details)
    VALUES (
      NEW.org_id,
      auth.uid(),
      'membership.updated',
      'membership',
      NEW.user_id,
      jsonb_build_object(
        'org_id', NEW.org_id,
        'user_id', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_events (org_id, actor_id, action, entity, entity_id, details)
    VALUES (
      OLD.org_id,
      auth.uid(),
      'membership.deleted',
      'membership',
      OLD.user_id,
      jsonb_build_object(
        'org_id', OLD.org_id,
        'user_id', OLD.user_id,
        'role', OLD.role
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for membership changes
DROP TRIGGER IF EXISTS log_membership_change ON public.memberships;
CREATE TRIGGER log_membership_change
  AFTER INSERT OR UPDATE OR DELETE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.log_membership_change();

COMMENT ON FUNCTION public.log_membership_change() IS 'Log membership changes to audit log';

-- =====================================================================
-- Set default organization on first membership
-- =====================================================================

-- Function to set default org when user joins first org
CREATE OR REPLACE FUNCTION public.set_default_org_on_first_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- If user doesn't have a default_org set, set it to this org
  UPDATE public.profiles
  SET default_org = NEW.org_id
  WHERE user_id = NEW.user_id
  AND default_org IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for first membership
DROP TRIGGER IF EXISTS set_default_org_on_first_membership ON public.memberships;
CREATE TRIGGER set_default_org_on_first_membership
  AFTER INSERT ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_org_on_first_membership();

COMMENT ON FUNCTION public.set_default_org_on_first_membership() IS 'Set default org when user joins first organization';

-- =====================================================================
-- Notification triggers
-- =====================================================================

-- Function to create notification on booking creation
CREATE OR REPLACE FUNCTION public.notify_on_booking_created()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  facility_title TEXT;
BEGIN
  -- Get user email and facility title
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
  SELECT title INTO facility_title FROM public.facilities WHERE id = NEW.facility_id;

  -- Create notification
  INSERT INTO public.notifications (user_id, channel, subject, body, meta)
  VALUES (
    NEW.user_id,
    'email',
    'Booking Confirmation',
    format('Your booking for %s has been created and is pending confirmation.', facility_title),
    jsonb_build_object(
      'booking_id', NEW.id,
      'facility_id', NEW.facility_id,
      'starts_at', NEW.starts_at,
      'ends_at', NEW.ends_at
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail booking creation if notification fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking creation
DROP TRIGGER IF EXISTS notify_on_booking_created ON public.bookings;
CREATE TRIGGER notify_on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_booking_created();

COMMENT ON FUNCTION public.notify_on_booking_created() IS 'Send notification when booking is created';

-- =====================================================================
-- Grant necessary permissions
-- =====================================================================

-- Grant execute on trigger functions to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_user_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_booking_status_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_membership_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_default_org_on_first_membership() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_booking_created() TO authenticated;
