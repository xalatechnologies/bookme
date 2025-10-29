/**
 * Add Missing Amenity Keys to localized_db_values
 *
 * This script adds the amenity keys that are missing from the database
 * so that facility seeding can succeed with validation triggers enabled.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Missing amenities that need to be added
const missingAmenities = [
  {
    entity_key: 'tavle',
    translations: {
      no: 'Tavle',
      en: 'Blackboard'
    }
  },
  {
    entity_key: 'kaffe-te',
    translations: {
      no: 'Kaffe/te',
      en: 'Coffee/tea'
    }
  },
  {
    entity_key: 'video-konferanse',
    translations: {
      no: 'Video konferanse',
      en: 'Video conference'
    }
  }
];

async function addMissingAmenities() {
  console.log('🔧 Adding missing amenity keys to localized_db_values...\n');

  for (const amenity of missingAmenities) {
    console.log(`Adding: ${amenity.entity_key}`);

    const { error } = await supabase
      .from('localized_db_values')
      .insert({
        entity_type: 'amenity',
        entity_key: amenity.entity_key,
        translations: amenity.translations,
        is_active: true
      });

    if (error) {
      // Check if it's a duplicate key error (which is okay)
      if (error.code === '23505') {
        console.log(`  ⚠️  Already exists: ${amenity.entity_key}`);
      } else {
        console.error(`  ❌ Error adding ${amenity.entity_key}:`, error);
        throw error;
      }
    } else {
      console.log(`  ✅ Added: ${amenity.entity_key}`);
    }
  }

  console.log('\n✅ All missing amenities added successfully!');
  console.log('\nYou can now run the seed script:');
  console.log('  npx tsx --env-file=.env.local scripts/seed-database.ts');
}

addMissingAmenities().catch((error) => {
  console.error('❌ Failed to add amenities:', error);
  process.exit(1);
});
