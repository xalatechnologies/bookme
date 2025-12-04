#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Fixer
 * Fixes all remaining TS errors systematically
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_DIR = join(__dirname, '..');

console.log('🔧 Fixing all TypeScript errors...\n');

let totalFixed = 0;

// Fix 1: Remove double-prefixed variables (_variable$2)
function fixDoublePrefixedVars(content) {
  let fixed = 0;
  const patterns = [
    { find: /_(\w+)\$\d+/g, replace: (match, name) => `_${name}` }
  ];
  
  patterns.forEach(({ find, replace }) => {
    const matches = content.match(find) || [];
    fixed += matches.length;
    content = content.replace(find, replace);
  });
  
  return { content, fixed };
}

// Fix 2: Fix translation key formats - convert array syntax to string
function fixTranslationKeys(content) {
  let fixed = 0;
  
  // Pattern: t(["key.path"]) -> t("key.path")
  const pattern = /t\(\["([^"]+)"\]\)/g;
  const matches = content.match(pattern) || [];
  fixed += matches.length;
  content = content.replace(pattern, 't("$1")');
  
  return { content, fixed };
}

// Fix 3: Fix calendar view type mismatches
function fixCalendarViewTypes(content) {
  let fixed = 0;
  
  // Change type from '"map" | "calendar" | "grid" | "list"' to '"map" | "grid" | "list"'
  if (content.includes('"map" | "calendar" | "grid" | "list"')) {
    content = content.replace(
      /["']map["'] \| ["']calendar["'] \| ["']grid["'] \| ["']list["']/g,
      '"map" | "grid" | "list"'
    );
    fixed++;
  }
  
  return { content, fixed };
}

// Fix 4: Add conflict status to availability types
function fixAvailabilityTypes(content) {
  let fixed = 0;
  
  if (content.includes('Type \'"conflict"\' is not assignable')) {
    // Find AvailabilityStatus type and add 'conflict'
    const typePattern = /type AvailabilityStatus = ["']available["'] \| ["']unavailable["'] \| ["']booked["'] \| ["']selected["'];/;
    if (typePattern.test(content)) {
      content = content.replace(
        typePattern,
        'type AvailabilityStatus = "available" | "unavailable" | "booked" | "selected" | "conflict";'
      );
      fixed++;
    }
  }
  
  return { content, fixed };
}

// Fix 5: Fix boolean type issues
function fixBooleanTypes(content) {
  let fixed = 0;
  
  // Fix: boolean | 0 | undefined -> boolean | undefined
  if (content.includes('disabled={loading || !hasChanges || 0}')) {
    content = content.replace(
      /disabled=\{loading \|\| !hasChanges \|\| 0\}/g,
      'disabled={loading || !hasChanges}'
    );
    fixed++;
  }
  
  return { content, fixed };
}

// Process a single file
function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const original = content;
    let fileFixed = 0;
    
    // Apply all fixes
    const fixes = [
      fixDoublePrefixedVars,
      fixTranslationKeys,
      fixCalendarViewTypes,
      fixAvailabilityTypes,
      fixBooleanTypes
    ];
    
    for (const fix of fixes) {
      const result = fix(content);
      content = result.content;
      fileFixed += result.fixed;
    }
    
    // Only write if changed
    if (content !== original && fileFixed > 0) {
      writeFileSync(filePath, content, 'utf-8');
      const relativePath = filePath.replace(BASE_DIR + '/', '');
      console.log(`✅ ${relativePath}: Fixed ${fileFixed} issues`);
      return fileFixed;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Recursively process directory
function processDirectory(dir, extensions = ['.ts', '.tsx']) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build
      if (['node_modules', 'dist', 'build', '.git'].includes(item)) {
        continue;
      }
      processDirectory(fullPath, extensions);
    } else if (stat.isFile()) {
      const ext = item.substring(item.lastIndexOf('.'));
      if (extensions.includes(ext)) {
        const fixed = processFile(fullPath);
        totalFixed += fixed;
      }
    }
  }
}

// Start processing
const srcDir = join(BASE_DIR, 'src');
console.log(`Processing ${srcDir}...\n`);
processDirectory(srcDir);

console.log(`\n✨ Total fixes applied: ${totalFixed}\n`);

if (totalFixed > 0) {
  console.log('✅ Automated fixes completed!');
  console.log('📝 Remaining manual fixes needed:');
  console.log('   1. Database schema: Add missing properties (area, openingHoursStart, etc.)');
  console.log('   2. Type alignments: ICalendarWeek vs CalendarWeek');
  console.log('   3. Complex i18n namespace issues');
} else {
  console.log('ℹ️  No automatic fixes applied. Manual review may be needed.');
}
