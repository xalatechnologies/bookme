/**
 * Apply Migration Script
 *
 * Applies the normalization migration by executing SQL statements one by one
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
  process.exit(1);
}

// Supabase client created but not used directly in this script
// Migration must be run via Supabase Dashboard or CLI
// const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🔧 Applying migration: normalize_facility_data\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251030000001_normalize_facility_data.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log(`📏 Size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

    // Note: Supabase doesn't expose a direct SQL execution endpoint for security
    // The migration needs to be run via Supabase Dashboard or CLI
    console.log('ℹ️  To apply this migration, you have two options:\n');

    console.log('Option 1: Supabase Dashboard (Recommended)');
    console.log('  1. Go to: https://supabase.com/dashboard/project/pfkggenadjqrzrtdghrr/sql/new');
    console.log('  2. Copy the contents of: supabase/migrations/20251030000001_normalize_facility_data.sql');
    console.log('  3. Paste into SQL Editor');
    console.log('  4. Click "Run"\n');

    console.log('Option 2: Supabase CLI');
    console.log('  1. Install CLI: npm install -g supabase');
    console.log('  2. Link project: supabase link --project-ref pfkggenadjqrzrtdghrr');
    console.log('  3. Push migration: supabase db push\n');

    console.log('📋 Migration Summary:');
    console.log('  • Adds slug field to facilities table');
    console.log('  • Normalizes facility_type values (Idrettshall → idrettshall)');
    console.log('  • Normalizes amenities arrays (Lyd/lys → lyd-lys)');
    console.log('  • Creates validation triggers');
    console.log('  • Adds indexes for performance\n');

    console.log('💡 After running the migration, execute:');
    console.log('   npx tsx --env-file=.env.local scripts/seed-database.ts\n');

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error:', errorMessage);
    process.exit(1);
  }
}

applyMigration();
