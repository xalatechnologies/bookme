#!/usr/bin/env node

/**
 * Script to systematically fix lint errors
 * Handles:
 * - Removing unused imports
 * - Removing unused variables
 * - Commenting out empty catch blocks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToFix = [
  // Source files with unused imports
  'src/pages/admin/ApprovalsPage.tsx',
  'src/pages/admin/FacilitiesPage.tsx',
  'src/pages/admin/ReportsPage.tsx',
  'src/pages/admin/UsersRolesPage.tsx',
  'src/pages/facilities/[id].tsx',
  'src/pages/facilities/[id]/book.tsx',
];

function removeUnusedImport(content, importName) {
  // Remove from multiline import
  const multilineRegex = new RegExp(
    `(import\\s*\\{[^}]*),\\s*${importName}\\s*([,}])`,
    'g'
  );
  content = content.replace(multilineRegex, '$1$2');
  
  // Clean up empty spots
  content = content.replace(/\{\s*,/g, '{');
  content = content.replace(/,\s*\}/g, '}');
  content = content.replace(/,\s*,/g, ',');
  
  return content;
}

function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Fix specific files
  if (filePath.includes('ApprovalsPage.tsx')) {
    if (content.includes('  User,\n')) {
      content = content.replace(/  User,\n/g, '');
      modified = true;
    }
  }
  
  if (filePath.includes('ReportsPage.tsx')) {
    // Remove 'cancelled' and 'completed' destructuring
    content = content.replace(
      /const\s+{\s*pending,\s*confirmed,\s*cancelled,\s*completed\s*}\s*=/,
      'const { pending, confirmed } ='
    );
    modified = true;
  }
  
  if (filePath.includes('FacilitiesPage.tsx')) {
    // Fix handleDuplicateFacility parameter
    content = content.replace(
      /const handleDuplicateFacility = \(facilityId: string\): void =>/,
      'const handleDuplicateFacility = (_facilityId: string): void =>'
    );
    modified = true;
  }
  
  if (filePath.includes('[id].tsx') || filePath.includes('book.tsx')) {
    // Remove unused Database import
    content = removeUnusedImport(content, 'Database');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed ${filePath}`);
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
}

// Run fixes
console.log('Fixing lint errors...\n');
filesToFix.forEach(fixFile);
console.log('\nDone!');
