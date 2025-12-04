#!/usr/bin/env node

/**
 * Comprehensive lint error fixer
 * Handles common patterns across all source files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixes = {
  // Remove unused imports - format: [file, importName]
  unusedImports: [
    ['src/components/common/metrics/KPICard.tsx', 'X'],
    ['src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx', 'Badge'],
    ['src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx', 'Share2'],
    ['src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx', 'CheckCircle'],
    ['src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx', 'Clock'],
    ['src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx', 'XCircle'],
    ['src/components/layouts/AdminLayout/index.tsx', 'useEffect'],
    ['src/components/layouts/UserLayout/index.tsx', 'useEffect'],
    ['src/hooks/features/calendar/useDateNavigation.ts', 'format'],
    ['src/i18n/config/languages.ts', 'SupportedLanguage'],
    ['src/i18n/types/resources.ts', 'LocalizedDbValue'],
    ['src/i18n/types/resources.ts', 'LocalizedEntityType'],
    ['src/i18n/types/resources.ts', 'LocalizedValueFormData'],
  ],
  
  // Prefix unused variables with underscore
  prefixUnused: [
    { file: 'src/components/common/metrics/KPICard.tsx', line: 120, var: 't' },
    { file: 'src/components/common/modals/BaseModal.tsx', line: 83, var: 'showCloseButton' },
    { file: 'src/components/common/modals/BaseModal.tsx', line: 88, var: 't' },
    { file: 'src/components/features/bookings/components/BookingCard/BookingDetailsPanel.tsx', line: 182, var: 'canDelete' },
    { file: 'src/components/features/bookings/components/BookingCard/index.tsx', line: 56, var: 'getStatusColor' },
    { file: 'src/components/features/bookings/components/BookingCard/index.tsx', line: 86, var: 'durationTranslations' },
    { file: 'src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx', line: 45, var: 'availability' },
    { file: 'src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx', line: 56, var: 'handleShare' },
    { file: 'src/components/features/calendar/components/FacilityCalendar/index.tsx', line: 151, var: 'cancelDrag' },
    { file: 'src/components/features/calendar/components/FacilityCalendar/index.tsx', line: 152, var: 'isSlotInPreview' },
    { file: 'src/hooks/features/bookings/useBookingSidebarDisplay.ts', line: 71, var: 'data' },
    { file: 'src/hooks/features/calendar/useCalendarGridDragSelection.ts', line: 92, var: 'facilityId' },
    { file: 'src/components/features/messaging/components/MessageThread.tsx', line: 157, var: 'i18n' },
    { file: 'src/components/features/messaging/components/MessageThread.tsx', line: 159, var: 'threadsData' },
  ],
};

function removeUnusedImport(content, importName) {
  // Pattern 1: Remove from imports with comma after
  let regex = new RegExp(`\\s*${importName},`, 'g');
  content = content.replace(regex, '');
  
  // Pattern 2: Remove from imports with comma before
  regex = new RegExp(`,\\s*${importName}\\s*([,\\n}])`, 'g');
  content = content.replace(regex, '$1');
  
  // Pattern 3: Single import on own line
  regex = new RegExp(`\\s*${importName}\\n`, 'g');
  content = content.replace(regex, '\n');
  
  // Clean up formatting
  content = content.replace(/\{\s*,/g, '{');
  content = content.replace(/,\s*\}/g, '}');
  content = content.replace(/,\s*,/g, ',');
  content = content.replace(/\{\s*\}/g, '{}');
  
  return content;
}

function prefixVariable(content, varName) {
  // Handle different declaration patterns
  const patterns = [
    // const { var } = 
    new RegExp(`(const\\s*\\{[^}]*)\\b${varName}\\b`, 'g'),
    // const var =
    new RegExp(`(const\\s+)${varName}(\\s*=)`, 'g'),
    // let var =
    new RegExp(`(let\\s+)${varName}(\\s*=)`, 'g'),
    // (var: type)
    new RegExp(`([,(]\\s*)${varName}(\\s*:)`, 'g'),
  ];
  
  patterns.forEach(pattern => {
    content = content.replace(pattern, `$1_${varName}$2`);
  });
  
  return content;
}

let totalFixed = 0;

// Fix unused imports
console.log('Fixing unused imports...');
fixes.unusedImports.forEach(([file, importName]) => {
  const fullPath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ Skipping ${file} - not found`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const before = content;
  content = removeUnusedImport(content, importName);
  
  if (content !== before) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  ✓ Removed '${importName}' from ${file}`);
    totalFixed++;
  }
});

// Fix unused variables by prefixing with underscore
console.log('\nPrefixing unused variables...');
const fileGroups = {};

// Group by file
fixes.prefixUnused.forEach(fix => {
  if (!fileGroups[fix.file]) {
    fileGroups[fix.file] = [];
  }
  fileGroups[fix.file].push(fix);
});

// Process each file
Object.entries(fileGroups).forEach(([file, fixList]) => {
  const fullPath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ Skipping ${file} - not found`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const before = content;
  
  fixList.forEach(fix => {
    content = prefixVariable(content, fix.var);
  });
  
  if (content !== before) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  ✓ Fixed ${fixList.length} variables in ${file}`);
    totalFixed += fixList.length;
  }
});

console.log(`\n✅ Total fixes applied: ${totalFixed}`);
