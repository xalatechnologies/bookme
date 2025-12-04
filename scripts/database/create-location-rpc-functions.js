const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://pfkggenadjqrzrtdghrr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.error('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY);
  console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

console.log('Using Supabase URL:', supabaseUrl);

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

// RPC function definitions
const rpcFunctions = [
  {
    name: 'get_facility_location_text',
    definition: `
      CREATE OR REPLACE FUNCTION get_facility_location_text(facility_id uuid)
      RETURNS text
      LANGUAGE sql
      STABLE
      AS $$
        SELECT ST_AsText(location) FROM facilities WHERE id = facility_id AND location IS NOT NULL
      $$;
    `
  },
  {
    name: 'get_published_facilities_with_location_text',
    definition: `
      CREATE OR REPLACE FUNCTION get_published_facilities_with_location_text(org_id uuid)
      RETURNS table (
        id uuid,
        name text,
        facility_type text,
        address text,
        capacity int,
        images jsonb,
        location_text text,
        org_id uuid,
        status text,
        created_at timestamptz,
        updated_at timestamptz,
        description text,
        rating numeric,
        review_count int,
        slug text,
        amenities jsonb,
        accessibility_features jsonb,
        area_description text,
        city text,
        postal_code text,
        country text,
        contact_email text,
        contact_phone text
      )
      LANGUAGE sql
      STABLE
      AS $$
        SELECT 
          f.id,
          f.name,
          f.facility_type,
          f.address,
          f.capacity,
          f.images,
          ST_AsText(f.location) as location_text,
          f.org_id,
          f.status,
          f.created_at,
          f.updated_at,
          f.description,
          f.rating,
          f.review_count,
          f.slug,
          f.amenities,
          f.accessibility_features,
          f.area_description,
          f.city,
          f.postal_code,
          f.country,
          f.contact_email,
          f.contact_phone
        FROM facilities f
        WHERE f.org_id = org_id AND f.status = 'published' AND f.location IS NOT NULL
      $$;
    `
  },
  {
    name: 'get_all_facilities_with_location_text',
    definition: `
      CREATE OR REPLACE FUNCTION get_all_facilities_with_location_text(org_id uuid)
      RETURNS table (
        id uuid,
        name text,
        facility_type text,
        address text,
        capacity int,
        images jsonb,
        location_text text,
        org_id uuid,
        status text,
        created_at timestamptz,
        updated_at timestamptz,
        description text,
        rating numeric,
        review_count int,
        slug text,
        amenities jsonb,
        accessibility_features jsonb,
        area_description text,
        city text,
        postal_code text,
        country text,
        contact_email text,
        contact_phone text
      )
      LANGUAGE sql
      STABLE
      AS $$
        SELECT 
          f.id,
          f.name,
          f.facility_type,
          f.address,
          f.capacity,
          f.images,
          ST_AsText(f.location) as location_text,
          f.org_id,
          f.status,
          f.created_at,
          f.updated_at,
          f.description,
          f.rating,
          f.review_count,
          f.slug,
          f.amenities,
          f.accessibility_features,
          f.area_description,
          f.city,
          f.postal_code,
          f.country,
          f.contact_email,
          f.contact_phone
        FROM facilities f
        WHERE f.org_id = org_id AND f.location IS NOT NULL
      $$;
    `
  }
];

async function createRPCFunctions() {
  console.log('Creating RPC functions...');
  
  // Try to execute the functions directly
  for (const func of rpcFunctions) {
    try {
      console.log(`Creating function: ${func.name}`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: func.definition
      });
      
      if (error) {
        console.error(`Error creating function ${func.name}:`, error.message);
      } else {
        console.log(`Successfully created function: ${func.name}`);
      }
    } catch (error) {
      console.error(`Error processing function ${func.name}:`, error.message);
    }
  }
  
  console.log('Done creating RPC functions.');
}

// Run the script
createRPCFunctions().catch(console.error);