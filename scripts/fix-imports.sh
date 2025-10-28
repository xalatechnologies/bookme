#!/bin/bash

# Import Path Fix Script
# This script fixes all import paths after component migration

set -e

BASE_DIR="/Users/ibrahimrahmani/Documents/xaheen/bookme/src"
cd "$BASE_DIR"

echo "======================================================"
echo "Fixing Import Paths - Component Migration"
echo "======================================================"
echo ""

# Fix ScrollToTop imports
echo "Fixing ScrollToTop imports..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ScrollToTop|@/components/common/navigation/ScrollToTop|g'

# Fix FormField and FormActions imports
echo "Fixing Form component imports..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/forms/FormField|@/components/common/forms/FormField|g'
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/forms/FormActions|@/components/common/forms/FormActions|g'

# Fix BaseModal imports
echo "Fixing BaseModal imports..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ui/BaseModal|@/components/common/modals/BaseModal|g'

# Fix Calendar imports
echo "Fixing Calendar imports..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/calendar/CalendarGrid|@/components/features/calendar/components/EnhancedCalendar/CalendarGrid|g'
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/calendar/TimeSlotGrid|@/components/features/calendar/components/EnhancedCalendar/TimeSlotGrid|g'
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/calendar/AvailabilityLegend|@/components/features/calendar/components/EnhancedCalendar/AvailabilityLegend|g'

# Fix booking types imports
echo "Fixing booking types imports..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/booking/types|@/components/features/bookings/types|g'
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -path "*/features/bookings/components/*" ! -path "*/node_modules/*" -exec sed -i '' 's|from '\''\.\/types'\''|from '\''../../types'\''|g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -path "*/features/bookings/components/*/*" ! -path "*/node_modules/*" -exec sed -i '' 's|from '\''\.\/types'\''|from '\''../../../types'\''|g' {} \;

# Fix RecurrencePatternSelector import
echo "Fixing RecurrencePatternSelector import..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/booking/RecurrencePatternSelector|@/components/features/bookings/components/RecurringBookingModal/RecurrencePatternSelector|g'

# Fix auth component imports
echo "Fixing auth component imports..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''\.\/ProtectedRoute'\''|from '\''./components/ProtectedRoute'\''|g' components/features/auth/index.ts
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''\.\/RoleGuard'\''|from '\''./components/RoleGuard'\''|g' components/features/auth/index.ts
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''\.\/PermissionGuard'\''|from '\''./components/PermissionGuard'\''|g' components/features/auth/index.ts

# Fix admin/user header/layout imports
echo "Fixing layout imports..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/admin/layout/AdminLayout|@/components/layouts/AdminLayout|g'
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/user/layout/UserLayout|@/components/layouts/UserLayout|g'

# Fix GlobalHeader imports
echo "Fixing GlobalHeader imports..."
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/GlobalHeader|@/components/layouts/PublicLayout/GlobalHeader|g'

echo ""
echo "✅ Import paths fixed!"
echo ""
echo "Running TypeScript compilation to verify..."
echo ""
