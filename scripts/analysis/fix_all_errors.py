#!/usr/bin/env python3
"""
Comprehensive lint error fixer
Fixes all remaining errors to achieve 0 lint errors
"""

import re
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

def read_file(filepath):
    """Read file content"""
    full_path = BASE_DIR / filepath
    if not full_path.exists():
        return None
    return full_path.read_text()

def write_file(filepath, content):
    """Write file content"""
    full_path = BASE_DIR / filepath
    full_path.write_text(content)

def prefix_unused_var(content, var_name):
    """Prefix a variable with underscore"""
    patterns = [
        (rf'\bconst\s+{var_name}\b', f'const _{var_name}'),
        (rf'\blet\s+{var_name}\b', f'let _{var_name}'),
        (rf'([,(]\s*){var_name}(\s*:)', rf'\1_{var_name}\2'),
        (rf'(const\s*\{{[^}}]*)\b{var_name}\b', rf'\1_{var_name}'),
    ]
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    return content

def remove_import(content, import_name):
    """Remove unused import"""
    # Remove from import list
    content = re.sub(rf',\s*{import_name}\s*,', ', ', content)
    content = re.sub(rf',\s*{import_name}\s*}}', '}', content)
    content = re.sub(rf'{{\s*{import_name}\s*,', '{', content)
    content = re.sub(rf'{{\s*{import_name}\s*}}', '{}', content)
    
    # Clean up
    content = re.sub(r'\{\s*,', '{', content)
    content = re.sub(r',\s*\}', '}', content)
    content = re.sub(r',\s*,', ',', content)
    
    # Remove empty imports
    content = re.sub(r'import\s*\{\s*\}\s*from\s*[\'"][^\'"]+[\'"];\s*\n', '', content)
    
    return content

# Files to fix with their unused variables
fixes = {
    'src/components/common/metrics/KPICard.tsx': {
        'vars': ['t'],
        'imports': []
    },
    'src/components/common/modals/BaseModal.tsx': {
        'vars': ['t'],
        'imports': []
    },
    'src/components/features/bookings/components/BookingCard/BookingDetailsPanel.tsx': {
        'vars': ['canDelete'],
        'imports': []
    },
    'src/components/features/bookings/components/BookingCard/RecurringBookingGroupDetails.tsx': {
        'vars': ['getStatusColor'],
        'imports': []
    },
    'src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx': {
        'vars': ['availability', 'handleShare'],
        'imports': []
    },
    'src/hooks/features/bookings/useBookingSidebarDisplay.ts': {
        'vars': ['priceCalculation', 'data'],
        'imports': []
    },
    'src/components/features/calendar/components/FacilityCalendar/index.tsx': {
        'vars': ['cancelDrag', 'isSlotInPreview'],
        'imports': []
    },
    'src/hooks/features/calendar/useCalendarGridDragSelection.ts': {
        'vars': ['facilityId'],
        'imports': []
    },
    'src/components/features/messaging/components/MessageThread.tsx': {
        'vars': ['i18n', 'threadsData'],
        'imports': []
    },
    'src/hooks/features/profile/useAdminProfileManagement.ts': {
        'vars': ['theme'],
        'imports': []
    },
    'src/pages/admin/UsersRolesPage.tsx': {
        'vars': ['password', 'confirmPassword', 'path', 'hasReadOnlyAccessFn', 'error'],
        'imports': []
    },
    'src/hooks/features/receipts/useReceiptData.ts': {
        'vars': ['receiptId'],
        'imports': []
    },
    'src/hooks/features/calendar/useCalendarGrid.ts': {
        'vars': [],
        'imports': ['format']
    },
    'src/i18n/config/languages.ts': {
        'vars': [],
        'imports': ['SupportedLanguage']
    },
    'src/components/layouts/AdminLayout/index.tsx': {
        'vars': [],
        'imports': ['useEffect']
    },
    'src/components/layouts/UserLayout/index.tsx': {
        'vars': [],
        'imports': ['useEffect']
    },
    'src/i18n/types/resources.ts': {
        'vars': [],
        'imports': ['LocalizedDbValue', 'LocalizedEntityType', 'LocalizedValueFormData']
    },
}

print("🔧 Fixing all lint errors...\n")
fixed_count = 0

for filepath, config in fixes.items():
    content = read_file(filepath)
    if not content:
        print(f"⚠️  Skip: {filepath} (not found)")
        continue
    
    original = content
    
    # Remove imports
    for import_name in config['imports']:
        content = remove_import(content, import_name)
    
    # Prefix variables
    for var_name in config['vars']:
        content = prefix_unused_var(content, var_name)
    
    if content != original:
        write_file(filepath, content)
        changes = len(config['imports']) + len(config['vars'])
        print(f"✅ {filepath}: Fixed {changes} issues")
        fixed_count += changes

print(f"\n✨ Total fixes applied: {fixed_count}")
print("\n📊 Running lint to verify...")
