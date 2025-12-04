#!/bin/bash

# Fix Relative Imports Script
# Fixes relative imports within features after migration

set -e

BASE_DIR="/Users/ibrahimrahmani/Documents/xaheen/booknor/src/components"
cd "$BASE_DIR"

echo "======================================================"
echo "Fixing Relative Imports - Feature Components"
echo "======================================================"
echo ""

# Fix booking types imports in features/bookings
echo "Fixing booking types imports..."
find features/bookings/components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './types'|from '../../types'|g" {} \;
find features/bookings/components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from '\.\./types'|from '../../types'|g" {} \;
find features/bookings/components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from '\.\./\.\./types'|from '../../types'|g" {} \;

# Fix BookingForm subfolder imports
find features/bookings/components/BookingForm -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from '\.\./types'|from '../../types'|g" {} \;
find features/bookings/components/BookingForm -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from './types'|from '../../types'|g" {} \;

# Fix StepByStepBooking imports
echo "Fixing StepByStepBooking imports..."
sed -i '' "s|from './BookingForm'|from '../BookingForm'|g" features/bookings/components/StepByStepBooking/index.tsx
sed -i '' "s|from './BookingTypeSelector'|from '../BookingForm/BookingTypeSelector'|g" features/bookings/components/StepByStepBooking/index.tsx
sed -i '' "s|from './RecurrencePatternSelector'|from '../RecurringBookingModal/RecurrencePatternSelector'|g" features/bookings/components/StepByStepBooking/index.tsx
sed -i '' "s|from './PriceCalculation'|from '../BookingForm/PriceCalculation'|g" features/bookings/components/StepByStepBooking/index.tsx
sed -i '' "s|from './types'|from '../../types'|g" features/bookings/components/StepByStepBooking/index.tsx

# Fix calendar types imports
echo "Fixing calendar types imports..."
find features/calendar/components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './types'|from '../../types'|g" {} \;
find features/calendar/components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from '\.\./types'|from '../../types'|g" {} \;

# Fix EnhancedCalendar imports
find features/calendar/components/EnhancedCalendar -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "index.tsx" -exec sed -i '' "s|from './types'|from '../../types'|g" {} \;

# Fix SimpleCalendar and EventTooltip imports in EnhancedCalendar
sed -i '' "s|from './SimpleCalendar'|from '../SimpleCalendar'|g" features/calendar/components/EnhancedCalendar/index.tsx 2>/dev/null || true
sed -i '' "s|from './EventTooltip'|from '../EventTooltip'|g" features/calendar/components/EnhancedCalendar/index.tsx 2>/dev/null || true

# Fix ui imports in CalendarView
echo "Fixing UI imports in calendar views..."
sed -i '' "s|from './ui/card'|from '@/components/ui/card'|g" features/calendar/components/CalendarView.tsx
sed -i '' "s|from './ui/accordion'|from '@/components/ui/accordion'|g" features/calendar/components/CalendarView.tsx
sed -i '' "s|from './search/ViewHeader'|from '../../search/components/ViewHeader'|g" features/calendar/components/CalendarView.tsx
sed -i '' "s|from './calendar/FacilityAccordionContent'|from './FacilityCalendar/FacilityAccordionContent'|g" features/calendar/components/CalendarView.tsx

sed -i '' "s|from './ui/card'|from '@/components/ui/card'|g" features/calendar/components/CalendarViewSimple.tsx
sed -i '' "s|from './search/ViewHeader'|from '../../search/components/ViewHeader'|g" features/calendar/components/CalendarViewSimple.tsx

# Fix remaining booking/types imports outside features
echo "Fixing remaining booking types imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from '@/components/booking/types'|from '@/components/features/bookings/types'|g" {} \;

echo ""
echo "✅ Relative imports fixed!"
echo ""
