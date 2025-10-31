/**
 * Migration Script: Convert Hardcoded Select Options to Database
 *
 * This script helps migrate hardcoded select options in components
 * to use the localized_db_values database table instead.
 *
 * Usage:
 * ```bash
 * npx tsx scripts/migrate-to-localized-values.ts
 * ```
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// Migration Data
// ============================================================================

interface MigrationEntry {
  entity_type: string;
  entity_key: string;
  language_code: string;
  label: string;
  description?: string;
  sort_order?: number;
  metadata?: Record<string, unknown>;
}

// Define migration data for various entity types
const migrationData: MigrationEntry[] = [
  // Add your custom entity types here
  // Example:
  // {
  //   entity_type: 'custom_type',
  //   entity_key: 'key1',
  //   language_code: 'en',
  //   label: 'Label 1',
  //   sort_order: 1,
  // },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Scan components directory for hardcoded select options
 */
function scanComponentsForHardcodedOptions(dirPath: string): string[] {
  const findings: string[] = [];

  const scanFile = (filePath: string) => {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Look for common patterns of hardcoded select options
    const patterns = [
      /<SelectItem value="[^"]+">([^<]+)<\/SelectItem>/g,
      /options\s*=\s*\[[\s\S]*?\]/g,
      /\{label:\s*['"][^'"]+['"],\s*value:\s*['"][^'"]+['"]\}/g,
    ];

    patterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        findings.push(`${filePath}: Found ${matches.length} hardcoded options`);
      }
    });
  };

  const scanDirectory = (dir: string) => {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(itemPath);
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
        scanFile(itemPath);
      }
    });
  };

  scanDirectory(dirPath);
  return findings;
}

/**
 * Insert migration data into database
 */
async function insertMigrationData(data: MigrationEntry[]): Promise<void> {
  console.log(`\nInserting ${data.length} localized values...`);

  for (const entry of data) {
    const { error } = await supabase
      .from('localized_db_values')
      .upsert(
        {
          entity_type: entry.entity_type,
          entity_key: entry.entity_key,
          language_code: entry.language_code,
          label: entry.label,
          description: entry.description || null,
          sort_order: entry.sort_order || null,
          metadata: entry.metadata || null,
          is_active: true,
        },
        {
          onConflict: 'entity_type,entity_key,language_code',
        }
      );

    if (error) {
      console.error(`Error inserting ${entry.entity_type}:${entry.entity_key}:`, error);
    } else {
      console.log(`✓ Inserted ${entry.entity_type}:${entry.entity_key} (${entry.language_code})`);
    }
  }
}

/**
 * Export current database values to JSON
 */
async function exportDatabaseValues(outputPath: string): Promise<void> {
  console.log('\nExporting database values...');

  const { data, error } = await supabase
    .from('localized_db_values')
    .select('*')
    .eq('is_active', true)
    .order('entity_type')
    .order('sort_order');

  if (error) {
    console.error('Error exporting data:', error);
    return;
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Exported to ${outputPath}`);
}

/**
 * Import values from JSON file
 */
async function importFromJSON(inputPath: string): Promise<void> {
  console.log(`\nImporting from ${inputPath}...`);

  const content = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(content) as MigrationEntry[];

  await insertMigrationData(data);
}

/**
 * Generate component migration guide
 */
function generateMigrationGuide(outputPath: string): void {
  const guide = `
# Component Migration Guide

## Step 1: Identify Components with Hardcoded Select Options

Run the scanner to find components with hardcoded select options:
\`\`\`bash
npx tsx scripts/migrate-to-localized-values.ts --scan
\`\`\`

## Step 2: Extract Options to Database

For each component with hardcoded options:

### Before:
\`\`\`tsx
<Select value={type} onValueChange={setType}>
  <SelectTrigger>
    <SelectValue placeholder="Select type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="type1">Type 1</SelectItem>
    <SelectItem value="type2">Type 2</SelectItem>
    <SelectItem value="type3">Type 3</SelectItem>
  </SelectContent>
</Select>
\`\`\`

### After:
\`\`\`tsx
import { LocalizedSelectEnhanced } from '@/components/common/LocalizedSelectEnhanced';

<LocalizedSelectEnhanced
  entityType="your_entity_type"
  value={type}
  onValueChange={setType}
  placeholder="Select type"
/>
\`\`\`

## Step 3: Add Localized Values to Database

Add your values to the database using SQL or the admin UI:

\`\`\`sql
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, sort_order) VALUES
  ('your_entity_type', 'type1', 'en', 'Type 1', 1),
  ('your_entity_type', 'type1', 'no', 'Type 1', 1),
  ('your_entity_type', 'type2', 'en', 'Type 2', 2),
  ('your_entity_type', 'type2', 'no', 'Type 2', 2);
\`\`\`

## Step 4: Test Language Switching

Verify that options change when language is switched:
1. Navigate to component
2. Change language in UI
3. Verify options are translated

## Step 5: Remove Old Hardcoded Options

Once verified, remove the old hardcoded select options from your component.

## Common Patterns

### With Search
\`\`\`tsx
<LocalizedSelectEnhanced
  entityType="location"
  value={location}
  onValueChange={setLocation}
  searchable
/>
\`\`\`

### Multi-Select
\`\`\`tsx
<LocalizedMultiSelect
  entityType="accessibility"
  value={features}
  onValueChange={setFeatures}
  maxSelections={5}
/>
\`\`\`

### Get Single Value
\`\`\`tsx
const { getValue } = useLocalizedDbValueEnhanced('booking_status');
const statusLabel = getValue('pending'); // "Pending" in EN, "Ventende" in NO
\`\`\`
`;

  fs.writeFileSync(outputPath, guide, 'utf-8');
  console.log(`✓ Generated migration guide at ${outputPath}`);
}

// ============================================================================
// CLI Interface
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('='.repeat(60));
  console.log('Database Localization Migration Tool');
  console.log('='.repeat(60));

  switch (command) {
    case '--scan':
      console.log('\nScanning for hardcoded select options...\n');
      const srcPath = path.join(process.cwd(), 'src');
      const findings = scanComponentsForHardcodedOptions(srcPath);

      if (findings.length === 0) {
        console.log('✓ No hardcoded options found');
      } else {
        console.log(`Found hardcoded options in ${findings.length} locations:\n`);
        findings.forEach((finding) => console.log(`  - ${finding}`));
      }
      break;

    case '--migrate':
      if (migrationData.length === 0) {
        console.log('\n⚠️  No migration data defined in script');
        console.log('Add your migration data to the migrationData array');
      } else {
        await insertMigrationData(migrationData);
        console.log('\n✓ Migration complete');
      }
      break;

    case '--export':
      const exportPath = args[1] || 'localized-values-export.json';
      await exportDatabaseValues(exportPath);
      break;

    case '--import':
      const importPath = args[1];
      if (!importPath) {
        console.error('\n❌ Please provide input file path');
        console.log('Usage: npx tsx scripts/migrate-to-localized-values.ts --import <file.json>');
      } else {
        await importFromJSON(importPath);
        console.log('\n✓ Import complete');
      }
      break;

    case '--guide':
      const guidePath = args[1] || 'MIGRATION_GUIDE.md';
      generateMigrationGuide(guidePath);
      break;

    case '--help':
    default:
      console.log(`
Usage:
  npx tsx scripts/migrate-to-localized-values.ts [command] [options]

Commands:
  --scan              Scan components for hardcoded select options
  --migrate           Run migration (insert data from migrationData array)
  --export [file]     Export current database values to JSON
  --import <file>     Import values from JSON file
  --guide [file]      Generate component migration guide
  --help              Show this help message

Examples:
  npx tsx scripts/migrate-to-localized-values.ts --scan
  npx tsx scripts/migrate-to-localized-values.ts --export values.json
  npx tsx scripts/migrate-to-localized-values.ts --import values.json
  npx tsx scripts/migrate-to-localized-values.ts --guide
`);
      break;
  }

  console.log('\n' + '='.repeat(60));
}

// Run the script
main().catch(console.error);
