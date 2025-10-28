#!/bin/bash

# Comprehensive Import Fix Script
# Fixes ALL import paths after component migration

set -e

BASE_DIR="/Users/ibrahimrahmani/Documents/xaheen/bookme/src"
cd "$BASE_DIR"

echo "======================================================"
echo "Comprehensive Import Path Fixes"
echo "======================================================"
echo ""

# Fix all booking-related imports
echo "Fixing all booking imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/booking/BookingForm|@/components/features/bookings/components/BookingForm|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/booking/BookingTypeSelector|@/components/features/bookings/components/BookingForm/BookingTypeSelector|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/booking/RecurrencePatternSelector|@/components/features/bookings/components/RecurringBookingModal/RecurrencePatternSelector|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/booking/StepByStepBooking|@/components/features/bookings/components/StepByStepBooking|g" {} \;

# Fix map component imports
echo "Fixing map imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/map/FacilityMiniMap|@/components/features/facilities/components/FacilityMap/FacilityMiniMap|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/map/MapContainer|@/components/features/facilities/components/FacilityMap/MapContainer|g" {} \;

# Fix calendar component imports in FacilityCalendar
echo "Fixing FacilityCalendar imports..."
sed -i '' "s|from './WeekNavigation'|from '../EnhancedCalendar/WeekNavigation'|g" components/features/calendar/components/FacilityCalendar/index.tsx 2>/dev/null || true
sed -i '' "s|from './TimeSlotGrid'|from '../EnhancedCalendar/TimeSlotGrid'|g" components/features/calendar/components/FacilityCalendar/index.tsx 2>/dev/null || true
sed -i '' "s|from './AvailabilityLegend'|from '../EnhancedCalendar/AvailabilityLegend'|g" components/features/calendar/components/FacilityCalendar/index.tsx 2>/dev/null || true

# Fix FacilityAccordionContent import
sed -i '' "s|from './FacilityCalendar'|from './index'|g" components/features/calendar/components/FacilityCalendar/FacilityAccordionContent.tsx 2>/dev/null || true

# Fix CalendarView imports
sed -i '' "s|from './search/ViewHeader'|from '@/components/features/search/components/ViewHeader'|g" components/features/calendar/components/CalendarView.tsx
sed -i '' "s|from './ui/accordion'|from '@/components/ui/accordion'|g" components/features/calendar/components/CalendarView.tsx
sed -i '' "s|from './calendar/FacilityAccordionContent'|from './FacilityCalendar/FacilityAccordionContent'|g" components/features/calendar/components/CalendarView.tsx

# Fix CalendarViewSimple imports
sed -i '' "s|from './search/ViewHeader'|from '@/components/features/search/components/ViewHeader'|g" components/features/calendar/components/CalendarViewSimple.tsx

# Fix BookingForm subfolder type imports (need ../../../types not ../../types)
echo "Fixing BookingForm type imports..."
find components/features/bookings/components/BookingForm -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from '../../types'|from '../../../types'|g" {} \;
find components/features/bookings/components/BookingForm -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from './types'|from '../../../types'|g" {} \;

# Fix RecurringBookingModal type imports
find components/features/bookings/components/RecurringBookingModal -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from '../../types'|from '../../../types'|g" {} \;
find components/features/bookings/components/RecurringBookingModal -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from './types'|from '../../../types'|g" {} \;

# Fix StepByStepBooking index.tsx type imports
sed -i '' "s|from './types'|from '../../../types'|g" components/features/bookings/components/StepByStepBooking/index.tsx 2>/dev/null || true
sed -i '' "s|from '../../types'|from '../../../types'|g" components/features/bookings/components/StepByStepBooking/index.tsx 2>/dev/null || true

# Fix EnhancedCalendar subfolder type imports
find components/features/calendar/components/EnhancedCalendar -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from '../../types'|from '../../../types'|g" {} \;
find components/features/calendar/components/EnhancedCalendar -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from './types'|from '../../../types'|g" {} \;

# Fix FacilityCalendar subfolder type imports
find components/features/calendar/components/FacilityCalendar -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from '../../types'|from '../../../types'|g" {} \;
find components/features/calendar/components/FacilityCalendar -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from './types'|from '../../../types'|g" {} \;

# Fix SimpleCalendar type imports
find components/features/calendar/components/SimpleCalendar -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from '../../types'|from '../../../types'|g" {} \;

echo ""
echo "✅ All import paths fixed!"
echo ""
