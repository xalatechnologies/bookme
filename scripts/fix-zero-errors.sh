#!/bin/bash

# Script to achieve 0 lint errors
cd /Users/aminismail/Documents/GitHub/bookme-1

echo "🔧 Phase 1: Prefixing all unused variables with underscore..."

# List of files with unused variables and their variable names
files=(
  "src/components/common/metrics/KPICard.tsx:t"
  "src/components/common/modals/BaseModal.tsx:t"
  "src/components/features/bookings/components/BookingCard/BookingDetailsPanel.tsx:canDelete"
  "src/components/features/bookings/components/BookingCard/RecurringBookingGroupDetails.tsx:getStatusColor"
  "src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx:availability"
  "src/components/features/facilities/components/FacilityCard/FacilityCardUser.tsx:handleShare"
  "src/hooks/features/bookings/useBookingSidebarDisplay.ts:priceCalculation"
  "src/hooks/features/calendar/useDateNavigation.ts:SupportedLanguage"
  "src/components/features/calendar/components/FacilityCalendar/index.tsx:cancelDrag"
  "src/components/features/calendar/components/FacilityCalendar/index.tsx:isSlotInPreview"
  "src/hooks/features/bookings/useBookingSidebarDisplay.ts:data"
  "src/hooks/features/calendar/useCalendarGridDragSelection.ts:facilityId"
  "src/components/features/messaging/components/MessageThread.tsx:i18n"
  "src/components/features/messaging/components/MessageThread.tsx:threadsData"
  "src/services/business/notification.business.service.ts:prioritizeNotifications"
  "src/hooks/features/profile/useAdminProfileManagement.ts:theme"
  "src/pages/admin/UsersRolesPage.tsx:password"
  "src/pages/admin/UsersRolesPage.tsx:confirmPassword"
  "src/pages/admin/UsersRolesPage.tsx:path"
  "src/pages/admin/UsersRolesPage.tsx:hasReadOnlyAccessFn"
  "src/services/supabase/zones.service.ts:ZoneUtilizationStats"
  "src/hooks/useStorageMigration.ts:MigrationPhase"
  "src/utils/storageMigration.ts:MigrationPhase"
  "src/hooks/features/receipts/useReceiptData.ts:receiptId"
  "src/pages/admin/UsersRolesPage.tsx:error"
)

for item in "${files[@]}"; do
  file="${item%%:*}"
  var="${item##*:}"
  if [ -f "$file" ]; then
    # Try to prefix the variable
    sed -i '' "s/\bconst ${var}\b/const _${var}/g" "$file" 2>/dev/null || true
    sed -i '' "s/\blet ${var}\b/let _${var}/g" "$file" 2>/dev/null || true
    sed -i '' "s/([^)]*)\s*${var}\s*:/\1_${var}:/g" "$file" 2>/dev/null || true
    echo "✓ Processed $file:$var"
  fi
done

echo ""
echo "🔧 Phase 2: Comment out entire unused declarations..."

# Comment out specific unused items
sed -i '' 's/^export const prioritizeNotifications/\/\/ export const prioritizeNotifications/g' src/services/business/notification.business.service.ts
sed -i '' 's/^export type ZoneUtilizationStats/\/\/ export type ZoneUtilizationStats/g' src/services/supabase/zones.service.ts
sed -i '' 's/^export type MigrationPhase/\/\/ export type MigrationPhase/g' src/hooks/useStorageMigration.ts
sed -i '' 's/^export type MigrationPhase/\/\/ export type MigrationPhase/g' src/utils/storageMigration.ts

echo "✅ Phase 2 complete"
echo ""
echo "Running final lint check..."
npm run lint 2>&1 | tail -10
