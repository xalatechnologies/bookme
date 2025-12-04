/**
 * Run Migration Script
 *
 * Executes the data normalization migration on Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔧 Running migration: 20251030000001_normalize_facility_data.sql\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251030000001_normalize_facility_data.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log(`📏 Size: ${migrationSQL.length} characters\n`);

    // Execute the migration
    console.log('⚡ Executing migration...\n');

    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);

      // Try alternative approach - use raw SQL query
      console.log('\n🔄 Trying alternative approach...\n');

      // Split the migration into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

      console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt.length < 10) continue; // Skip very short statements

        console.log(`[${i + 1}/${statements.length}] Executing...`);

        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: stmt + ';'
          });

          if (stmtError) {
            console.error(`  ❌ Error:`, stmtError.message);
          } else {
            console.log(`  ✅ Success`);
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error(`  ❌ Exception:`, errorMessage);
        }
      }

      process.exit(1);
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('🎉 Database schema updated with:');
    console.log('  - Slug field for SEO-friendly URLs');
    console.log('  - Normalized facility types');
    console.log('  - Normalized amenities');
    console.log('  - Validation triggers\n');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runMigration();
}

export { runMigration };
