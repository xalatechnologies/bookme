#!/bin/bash

# Final lint error fixes
cd /Users/aminismail/Documents/GitHub/bookme-1

echo "🔧 Removing unused X import from BaseModal..."
sed -i '' 's/import { X } from "lucide-react";//g' src/components/common/modals/BaseModal.tsx

echo "✅ Removing unused imports from BookingCard..."
sed -i '' 's/_getStatusColor,//g' src/components/features/bookings/components/BookingCard/index.tsx
sed -i '' 's/getStatusColor$/getStatusBadgeColor/g' src/components/features/bookings/components/BookingCard/index.tsx

echo "✅ Removing unused getStatusColor..."
sed -i '' 's/const getStatusColor =/const _getStatusColor =/g' src/components/features/bookings/components/BookingCard/RecurringBookingGroupDetails.tsx

echo "✅ Removing unused format imports..."
sed -i '' '/^import { format } from/d' src/hooks/features/calendar/useCalendarGrid.ts
sed -i '' '/^import { format } from/d' src/hooks/features/calendar/useCalendarGridDragSelection.ts

echo "✅ Removing unused _priceCalculation..."
sed -i '' 's/const _priceCalculation =/\/\/ const _priceCalculation =/g' src/hooks/features/bookings/useBookingSidebarDisplay.ts

echo "✅ Removing X from BaseModal that still exists..."
perl -i -pe 's/import \{ X \} from "lucide-react";\n?//g' src/components/common/modals/BaseModal.tsx

echo "✨ Running lint to verify..."
npm run lint 2>&1 | tail -10
