-- Migration: Add Contact Fields to Facilities
-- Description: Adds separate contact_email and contact_phone fields to facilities table
--              to store contact information separately from the description field

-- Add contact fields to facilities table
alter table facilities
  add column contact_email text,
  add column contact_phone text;

-- Add comments for documentation
comment on column facilities.contact_email is 'Primary contact email for the facility';
comment on column facilities.contact_phone is 'Primary contact phone number for the facility';

-- Add indexes for faster lookups
create index if not exists idx_facilities_contact_email on facilities(contact_email);
create index if not exists idx_facilities_contact_phone on facilities(contact_phone);

-- Add validation constraints
alter table facilities
  add constraint facilities_contact_email_check
  check (contact_email is null or contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  add constraint facilities_contact_phone_check
  check (contact_phone is null or contact_phone ~* '^(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$');

-- Update existing facilities to extract contact info from description
-- This is for backward compatibility
do $$
declare
  facility_record record;
  email_match text;
  phone_match text;
begin
  for facility_record in
    select id, description from facilities
    where description is not null and description != ''
  loop
    -- Extract email
    select substring(facility_record.description from '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
    into email_match;
    
    -- Extract phone
    select substring(facility_record.description from '(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}')
    into phone_match;
    
    -- Update facility with extracted contact info
    if email_match is not null or phone_match is not null then
      update facilities
      set contact_email = coalesce(email_match, contact_email),
          contact_phone = coalesce(phone_match, contact_phone)
      where id = facility_record.id;
    end if;
  end loop;
end $$;

-- Create function to get contact information for a facility
-- This function will return contact info from separate fields if available,
-- otherwise fall back to extracting from description
create or replace function get_facility_contact_info(facility_id uuid)
returns table(email text, phone text)
language plpgsql
as $$
declare
  facility_record record;
begin
  select f.contact_email, f.contact_phone, f.description
  into facility_record
  from facilities f
  where f.id = facility_id;
  
  if facility_record.contact_email is not null or facility_record.contact_phone is not null then
    -- Return contact info from separate fields
    return query select facility_record.contact_email, facility_record.contact_phone;
  else
    -- Extract from description as fallback
    return query select 
      substring(facility_record.description from '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}') as email,
      substring(facility_record.description from '(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}') as phone;
  end if;
end;
$$;

comment on function get_facility_contact_info is 'Returns contact information for a facility, preferring separate fields over description extraction';

-- Create trigger to automatically update contact info in description when separate fields are updated
create or replace function update_facility_description_with_contact()
returns trigger
language plpgsql
as $$
declare
  clean_description text;
begin
  -- Only update if contact fields have changed
  if (TG_OP = 'UPDATE' and 
      (OLD.contact_email is distinct from NEW.contact_email or 
       OLD.contact_phone is distinct from NEW.contact_phone)) then
    
    -- Remove any existing contact information from the description
    clean_description := coalesce(NEW.description, '');
    
    -- Remove email patterns
    clean_description := regexp_replace(clean_description, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '', 'g');
    
    -- Remove phone patterns
    clean_description := regexp_replace(clean_description, '(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}', '', 'g');
    
    -- Clean up extra whitespace
    clean_description := regexp_replace(clean_description, '\s+', ' ', 'g');
    clean_description := trim(clean_description);
    
    -- Add contact information at the end if present
    if NEW.contact_email is not null or NEW.contact_phone is not null then
      if clean_description != '' then
        clean_description := clean_description || '. ';
      end if;
      clean_description := clean_description || 'Contact: ' || 
                          coalesce(NEW.contact_email, 'N/A') || ', ' || 
                          coalesce(NEW.contact_phone, 'N/A');
    end if;
    
    -- Update the description
    NEW.description := clean_description;
  end if;
  
  return NEW;
end;
$$;

-- Create trigger on facilities table
create trigger update_facility_description_with_contact_trigger
  before update of contact_email, contact_phone on facilities
  for each row
  execute function update_facility_description_with_contact();

comment on trigger update_facility_description_with_contact_trigger on facilities is 
  'Automatically updates facility description with contact information when contact fields change';

-- Verification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration Complete: Added Contact Fields to Facilities';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Added columns:';
  RAISE NOTICE '  - facilities.contact_email';
  RAISE NOTICE '  - facilities.contact_phone';
  RAISE NOTICE 'Added constraints and indexes';
  RAISE NOTICE 'Added functions:';
  RAISE NOTICE '  - get_facility_contact_info(uuid)';
  RAISE NOTICE '  - update_facility_description_with_contact()';
  RAISE NOTICE 'Added triggers:';
  RAISE NOTICE '  - update_facility_description_with_contact_trigger';
  RAISE NOTICE '========================================';
END $$;