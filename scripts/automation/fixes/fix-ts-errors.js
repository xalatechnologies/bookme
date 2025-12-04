#!/usr/bin/env node
/**
 * Systematic TypeScript Error Fixer
 * Fixes remaining TS errors in the codebase
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_DIR = join(__dirname, '..');

const fixes = [
  // Fix getStatusColor reference error
  {
    file: 'src/components/features/bookings/components/BookingCard/index.tsx',
    find: 'getStatusColor',
    replace: '_getStatusColor',
    all: false
  },
  // Fix support namespace issues - add to i18n config if missing
  // This needs manual verification of i18n config
];

console.log('🔧 Fixing TypeScript errors...\n');

let fixedCount = 0;

for (const fix of fixes) {
  try {
    const filePath = join(BASE_DIR, fix.file);
    let content = readFileSync(filePath, 'utf-8');
    
    if (fix.all) {
      const count = (content.match(new RegExp(fix.find, 'g')) || []).length;
      content = content.replaceAll(fix.find, fix.replace);
      console.log(`✅ ${fix.file}: Fixed ${count} occurrences of "${fix.find}"`);
      fixedCount += count;
    } else {
      if (content.includes(fix.find)) {
        content = content.replace(fix.find, fix.replace);
        console.log(`✅ ${fix.file}: Fixed "${fix.find}"`);
        fixedCount++;
      }
    }
    
    writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}:`, error.message);
  }
}

console.log(`\n✨ Total fixes applied: ${fixedCount}`);
console.log('\n📝 Remaining manual fixes needed:');
console.log('1. Add "support" namespace to i18n configuration');
console.log('2. Review translation key usage in support components');
console.log('3. Fix "area" property access in search hooks (add to database types)');
