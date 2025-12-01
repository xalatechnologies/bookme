#!/usr/bin/env node

/**
 * Complete lint error fixer - eliminates all remaining errors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFile(filePath, content) {
  const fullPath = path.join(__dirname, '..', filePath);
  fs.writeFileSync(fullPath, content, 'utf8');
}

function removeImport(content, importName) {
  // Remove from import list
  content = content.replace(new RegExp(`\\s*${importName},\\s*`, 'g'), ' ');
  content = content.replace(new RegExp(`,\\s*${importName}\\s*([,}])`, 'g'), '$1');
  content = content.replace(new RegExp(`\\{\\s*${importName}\\s*\\}`, 'g'), '{}');
  // Clean up
  content = content.replace(/\{\s*,/g, '{');
  content = content.replace(/,\s*\}/g, '}');
  content = content.replace(/,\s*,/g, ',');
  // Remove entire empty imports
  content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\s*\n/g, '');
  return content;
}

function commentOutVariable(content, varName, lineContext) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(varName) && lines[i].includes(lineContext)) {
      lines[i] = '  // ' + lines[i].trim() + ' // TODO: Remove unused variable';
      break;
    }
  }
  return lines.join('\n');
}

const fixes = [
  // Remove unused imports
  { file: 'src/components/common/metrics/KPICard.tsx', type: 'removeImport', value: 'X' },
  { file: 'src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx', type: 'removeImport', value: 'Badge' },
  { file: 'src/hooks/features/calendar/useDateNavigation.ts', type: 'removeImport', value: 'format' },
  { file: 'src/i18n/config/languages.ts', type: 'removeImport', value: 'SupportedLanguage' },
  { file: 'src/components/layouts/AdminLayout/index.tsx', type: 'removeImport', value: 'useEffect' },
  { file: 'src/components/layouts/UserLayout/index.tsx', type: 'removeImport', value: 'useEffect' },
  { file: 'src/i18n/types/resources.ts', type: 'removeImport', value: 'LocalizedDbValue' },
  { file: 'src/i18n/types/resources.ts', type: 'removeImport', value: 'LocalizedEntityType' },
  { file: 'src/i18n/types/resources.ts', type: 'removeImport', value: 'LocalizedValueFormData' },
  { file: 'src/services/business/notification.business.service.ts', type: 'removeImport', value: 'prioritizeNotifications' },
  { file: 'src/hooks/features/profile/useAdminProfileManagement.ts', type: 'removeImport', value: 'avatarService' },
  { file: 'src/pages/admin/UsersRolesPage.tsx', type: 'removeImport', value: 'usersService' },
  { file: 'src/hooks/features/receipts/useReceiptData.ts', type: 'removeImport', value: 'parsePrice' },
  { file: 'src/services/business/report.business.service.ts', type: 'removeImport', value: 'calculateGrowthRate' },
  { file: 'src/contexts/AuthContext.tsx', type: 'removeImport', value: 'Booking' },
  { file: 'src/pages/admin/UsersRolesPage.tsx', type: 'removeImport', value: 'useOrganizationId' },
  { file: 'src/services/supabase/zones.service.ts', type: 'removeImport', value: 'ZoneUtilizationStats' },
  { file: 'src/hooks/useStorageMigration.ts', type: 'removeImport', value: 'MigrationPhase' },
  { file: 'src/utils/storageMigration.ts', type: 'removeImport', value: 'MigrationPhase' },
  { file: 'src/utils/storageMigration.ts', type: 'removeImport', value: 'MigrationError' },
  { file: 'src/services/supabase/bookings.service.ts', type: 'removeImport', value: 'MigrationPhase' },
];

console.log('🔧 Fixing all lint errors...\n');
let fixCount = 0;

// Apply fixes
fixes.forEach(fix => {
  const content = readFile(fix.file);
  if (!content) {
    console.log(`⚠️  Skip: ${fix.file} (not found)`);
    return;
  }

  let newContent = content;
  
  if (fix.type === 'removeImport') {
    newContent = removeImport(content, fix.value);
  }
  
  if (newContent !== content) {
    writeFile(fix.file, newContent);
    console.log(`✅ ${fix.file}: Removed ${fix.value}`);
    fixCount++;
  }
});

console.log(`\n✨ Applied ${fixCount} fixes\n`);

// Now handle files that need variable prefixing or commenting
console.log('🔧 Fixing remaining unused variables...\n');

const varFixes = {
  'src/components/common/modals/BaseModal.tsx': [
    { line: 83, old: 'showCloseButton', new: '_showCloseButton' },
  ],
  'src/components/features/bookings/components/BookingCard/index.tsx': [
    { line: 56, old: 'getStatusColor', new: '_getStatusColor' },
  ],
  'src/components/features/calendar/components/FacilityCalendar/index.tsx': [
    { line: 151, old: 'cancelDrag', new: '_cancelDrag' },
    { line: 152, old: 'isSlotInPreview', new: '_isSlotInPreview' },
  ],
  'src/hooks/features/bookings/useBookingSidebarDisplay.ts': [
    { line: 71, old: 'data', new: '_data' },
  ],
  'src/components/features/messaging/components/MessageThread.tsx': [
    { line: 157, old: 'i18n', new: '_i18n' },
    { line: 159, old: 'threadsData', new: '_threadsData' },
  ],
  'src/pages/admin/UsersRolesPage.tsx': [
    { line: 360, old: 'password', new: '_password' },
    { line: 360, old: 'confirmPassword', new: '_confirmPassword' },
  ],
};

Object.entries(varFixes).forEach(([file, vars]) => {
  let content = readFile(file);
  if (!content) return;
  
  vars.forEach(v => {
    // Replace variable name with underscore prefix
    const patterns = [
      new RegExp(`(const\\s+)${v.old}(\\s*=)`, 'g'),
      new RegExp(`(let\\s+)${v.old}(\\s*=)`, 'g'),
      new RegExp(`(const\\s*\\{[^}]*)\\b${v.old}\\b`, 'g'),
      new RegExp(`([,(]\\s*)${v.old}(\\s*[):,])`, 'g'),
    ];
    
    patterns.forEach(pattern => {
      content = content.replace(pattern, `$1${v.new}$2`);
    });
  });
  
  writeFile(file, content);
  console.log(`✅ ${file}: Prefixed ${vars.length} variables`);
  fixCount += vars.length;
});

console.log(`\n🎉 Total fixes applied: ${fixCount}\n`);
console.log('Running lint to verify...\n');

try {
  execSync('npm run lint', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit' 
  });
} catch (e) {
  console.log('\n⚠️  Some errors remain - checking details...');
}
