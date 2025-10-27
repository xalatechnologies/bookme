#!/bin/bash

# Component Migration Script
# This script migrates components from mixed organization to feature-based architecture
# NO CODE LOGIC CHANGES - Only moving files and updating imports

set -e  # Exit on error

BASE_DIR="/Users/ibrahimrahmani/Documents/xaheen/bookme/src/components"
cd "$BASE_DIR"

echo "======================================================"
echo "Component Migration Script - Feature-Based Architecture"
echo "======================================================"
echo ""

# Phase 3: Bookings Feature
echo "Phase 3: Migrating Bookings Feature..."
mkdir -p features/bookings/components/{BookingForm,StepByStepBooking,RecurringBookingModal,BookingCard}

# Move BookingForm related components
mv booking/BookingForm.tsx features/bookings/components/BookingForm/index.tsx 2>/dev/null || true
mv booking/BookingTypeSelector.tsx features/bookings/components/BookingForm/BookingTypeSelector.tsx 2>/dev/null || true
mv booking/PriceCalculation.tsx features/bookings/components/BookingForm/PriceCalculation.tsx 2>/dev/null || true
mv booking/BookingActionButtons.tsx features/bookings/components/BookingForm/BookingActionButtons.tsx 2>/dev/null || true
mv booking/SelectedSlotsDisplay.tsx features/bookings/components/BookingForm/SelectedSlotsDisplay.tsx 2>/dev/null || true

# Move StepByStepBooking
mv booking/StepByStepBooking.tsx features/bookings/components/StepByStepBooking/index.tsx 2>/dev/null || true

# Move RecurringBookingModal related
mv booking/RecurringBookingModal.tsx features/bookings/components/RecurringBookingModal/index.tsx 2>/dev/null || true
mv booking/RecurrencePatternSelector.tsx features/bookings/components/RecurringBookingModal/RecurrencePatternSelector.tsx 2>/dev/null || true
mv booking/RecurringBookingCard.tsx features/bookings/components/RecurringBookingModal/RecurringBookingCard.tsx 2>/dev/null || true

# Move booking types
mv booking/types.ts features/bookings/types.ts 2>/dev/null || true

# Move bookings (plural) components
mv bookings/BookingCard.tsx features/bookings/components/BookingCard/index.tsx 2>/dev/null || true
mv bookings/BookingDetailsPanel.tsx features/bookings/components/BookingCard/BookingDetailsPanel.tsx 2>/dev/null || true
mv bookings/RecurringBookingGroup.tsx features/bookings/components/BookingCard/RecurringBookingGroup.tsx 2>/dev/null || true
mv bookings/BookingFiltersBar.tsx features/bookings/components/BookingFiltersBar.tsx 2>/dev/null || true
mv bookings/index.ts features/bookings/index.ts 2>/dev/null || true

echo "✅ Bookings feature migrated"

# Phase 4: Facilities Feature
echo "Phase 4: Migrating Facilities Feature..."
mkdir -p features/facilities/components/{FacilityCard,FacilityDetail,FacilityImageGallery,FacilitySearch,FacilityEditForm,FacilityMap}

# Move FacilityCard components
mv facility/FacilityCard.tsx features/facilities/components/FacilityCard/index.tsx 2>/dev/null || true
mv facility/FacilityCardBase.tsx features/facilities/components/FacilityCard/FacilityCardBase.tsx 2>/dev/null || true
mv facility/FacilityCardUser.tsx features/facilities/components/FacilityCard/FacilityCardUser.tsx 2>/dev/null || true
mv facility/FacilityListItem.tsx features/facilities/components/FacilityCard/FacilityListItem.tsx 2>/dev/null || true
mv facility/FacilityListItemUser.tsx features/facilities/components/FacilityCard/FacilityListItemUser.tsx 2>/dev/null || true

# Move FacilityDetail components
mv facility/detail/* features/facilities/components/FacilityDetail/ 2>/dev/null || true
mv facility/FacilityHeader.tsx features/facilities/components/FacilityDetail/FacilityHeader.tsx 2>/dev/null || true
mv facility/FacilityContactInfo.tsx features/facilities/components/FacilityDetail/FacilityContactInfoDup.tsx 2>/dev/null || true

# Move Gallery components
mv facility/gallery/* features/facilities/components/FacilityImageGallery/ 2>/dev/null || true
mv facility/AirBnbStyleGallery.tsx features/facilities/components/FacilityImageGallery/AirBnbStyleGallery.tsx 2>/dev/null || true

# Move Search components
mv facility/FilterBarUser.tsx features/facilities/components/FacilitySearch/FilterBar.tsx 2>/dev/null || true
mv facility/ViewToggleUser.tsx features/facilities/components/FacilitySearch/ViewToggle.tsx 2>/dev/null || true
mv FacilityGrid.tsx features/facilities/components/FacilitySearch/FacilityGrid.tsx 2>/dev/null || true
mv FacilityList.tsx features/facilities/components/FacilitySearch/FacilityList.tsx 2>/dev/null || true
mv InfiniteScrollFacilities.tsx features/facilities/components/FacilitySearch/InfiniteScrollFacilities.tsx 2>/dev/null || true

# Move Admin facility components
mv admin/facilities/* features/facilities/components/FacilityEditForm/ 2>/dev/null || true

# Move Map components
mv map/* features/facilities/components/FacilityMap/ 2>/dev/null || true
mv MapView.tsx features/facilities/components/FacilityMap/MapView.tsx 2>/dev/null || true

echo "✅ Facilities feature migrated"

# Phase 5: Calendar Feature
echo "Phase 5: Migrating Calendar Feature..."
mkdir -p features/calendar/components/{EnhancedCalendar,FacilityCalendar,SimpleCalendar}

# Move EnhancedCalendar components
mv calendar/EnhancedCalendar.tsx features/calendar/components/EnhancedCalendar/index.tsx 2>/dev/null || true
mv calendar/CalendarGrid.tsx features/calendar/components/EnhancedCalendar/CalendarGrid.tsx 2>/dev/null || true
mv calendar/TimeSlotGrid.tsx features/calendar/components/EnhancedCalendar/TimeSlotGrid.tsx 2>/dev/null || true
mv calendar/CalendarFilters.tsx features/calendar/components/EnhancedCalendar/CalendarFilters.tsx 2>/dev/null || true
mv calendar/WeekNavigation.tsx features/calendar/components/EnhancedCalendar/WeekNavigation.tsx 2>/dev/null || true
mv calendar/AvailabilityLegend.tsx features/calendar/components/EnhancedCalendar/AvailabilityLegend.tsx 2>/dev/null || true
mv calendar/EventContextMenu.tsx features/calendar/components/EnhancedCalendar/EventContextMenu.tsx 2>/dev/null || true

# Move FacilityCalendar components
mv calendar/FacilityCalendar.tsx features/calendar/components/FacilityCalendar/index.tsx 2>/dev/null || true
mv calendar/FacilityAccordionContent.tsx features/calendar/components/FacilityCalendar/FacilityAccordionContent.tsx 2>/dev/null || true
mv calendar/ReadOnlyCalendar.tsx features/calendar/components/FacilityCalendar/ReadOnlyCalendar.tsx 2>/dev/null || true

# Move SimpleCalendar
mv calendar/SimpleCalendar.tsx features/calendar/components/SimpleCalendar/index.tsx 2>/dev/null || true

# Move shared calendar components
mv calendar/EventTooltip.tsx features/calendar/components/EventTooltip.tsx 2>/dev/null || true
mv calendar/types.ts features/calendar/types.ts 2>/dev/null || true
mv CalendarView.tsx features/calendar/components/CalendarView.tsx 2>/dev/null || true
mv CalendarViewSimple.tsx features/calendar/components/CalendarViewSimple.tsx 2>/dev/null || true

# Move shared calendar to common
mkdir -p common/calendar
mv shared/Calendar.tsx common/calendar/Calendar.tsx 2>/dev/null || true

echo "✅ Calendar feature migrated"

# Phase 6: Dashboard Features
echo "Phase 6: Migrating Dashboard Features..."
mkdir -p features/dashboard/{admin,user}

# Move admin dashboard
mv admin/dashboard/* features/dashboard/admin/ 2>/dev/null || true

# Move user dashboard
mv user/dashboard/* features/dashboard/user/ 2>/dev/null || true
mv HeroBanner.tsx features/dashboard/user/HeroBanner.tsx 2>/dev/null || true

echo "✅ Dashboard features migrated"

# Phase 7: Search Feature
echo "Phase 7: Migrating Search Feature..."
mkdir -p features/search/components

mv header/GlobalSearch.tsx features/search/components/GlobalSearch.tsx 2>/dev/null || true
mv search/SearchFilter.tsx features/search/components/SearchFilters.tsx 2>/dev/null || true
mv search/ViewModeToggle.tsx features/search/components/ViewModeToggle.tsx 2>/dev/null || true
mv search/ViewHeader.tsx features/search/components/ViewHeader.tsx 2>/dev/null || true
mv SearchFilter.tsx features/search/components/SearchFilter.tsx 2>/dev/null || true
mv admin/header/SearchField.tsx features/search/components/AdminSearchField.tsx 2>/dev/null || true
mv user/header/UserSearchField.tsx features/search/components/UserSearchField.tsx 2>/dev/null || true

echo "✅ Search feature migrated"

# Phase 8: Messaging Feature
echo "Phase 8: Migrating Messaging Feature..."
mkdir -p features/messaging/components

mv messaging/* features/messaging/components/ 2>/dev/null || true

echo "✅ Messaging feature migrated"

# Phase 9: Support Feature
echo "Phase 9: Migrating Support Feature..."
mkdir -p features/support/components

mv support/* features/support/components/ 2>/dev/null || true

echo "✅ Support feature migrated"

# Phase 10: Groups Feature
echo "Phase 10: Migrating Groups Feature..."
mkdir -p features/groups/components

mv group/* features/groups/components/ 2>/dev/null || true

echo "✅ Groups feature migrated"

# Phase 11: Layouts
echo "Phase 11: Migrating Layouts..."

# Admin Layout
mv admin/layout/AdminLayout.tsx layouts/AdminLayout/index.tsx 2>/dev/null || true
mv admin/layout/AdminHeader.tsx layouts/AdminLayout/AdminHeader.tsx 2>/dev/null || true
mv admin/layout/AdminSidebar.tsx layouts/AdminLayout/AdminSidebar.tsx 2>/dev/null || true
mv admin/layout/SystemPageLayout.tsx layouts/AdminLayout/SystemPageLayout.tsx 2>/dev/null || true

# User Layout
mv user/layout/UserLayout.tsx layouts/UserLayout/index.tsx 2>/dev/null || true
mv user/layout/UserHeader.tsx layouts/UserLayout/UserHeader.tsx 2>/dev/null || true
mv user/layout/UserSidebar.tsx layouts/UserLayout/UserSidebar.tsx 2>/dev/null || true

# Public Layout
mkdir -p layouts/PublicLayout
mv GlobalHeader.tsx layouts/PublicLayout/GlobalHeader.tsx 2>/dev/null || true
mv header/CartDropdown.tsx layouts/PublicLayout/CartDropdown.tsx 2>/dev/null || true
mv header/LanguageToggle.tsx layouts/PublicLayout/LanguageToggle.tsx 2>/dev/null || true
mv header/Logo.tsx layouts/PublicLayout/Logo.tsx 2>/dev/null || true
mv header/MobileMenu.tsx layouts/PublicLayout/MobileMenu.tsx 2>/dev/null || true
mv header/ProfileMenu.tsx layouts/PublicLayout/ProfileMenu.tsx 2>/dev/null || true

echo "✅ Layouts migrated"

# Phase 12: Remaining Components
echo "Phase 12: Migrating Remaining Components..."

# Move admin guards to auth
mv admin/guards/RequireRole.tsx features/auth/components/RequireRole.tsx 2>/dev/null || true

# Move remaining admin header components to layouts
mv admin/header/NotificationBell.tsx layouts/AdminLayout/NotificationBell.tsx 2>/dev/null || true
mv admin/header/ProfileDropdown.tsx layouts/AdminLayout/ProfileDropdown.tsx 2>/dev/null || true

# Move remaining user header components to layouts
mv user/header/UserNotificationBell.tsx layouts/UserLayout/UserNotificationBell.tsx 2>/dev/null || true
mv user/header/UserProfileDropdown.tsx layouts/UserLayout/UserProfileDropdown.tsx 2>/dev/null || true

echo "✅ Remaining components migrated"

# Clean up empty directories
echo ""
echo "Cleaning up empty directories..."
find . -type d -empty -delete 2>/dev/null || true

echo ""
echo "======================================================"
echo "Migration Complete!"
echo "======================================================"
echo ""
echo "Next steps:"
echo "1. Create barrel export files (index.ts) for each feature"
echo "2. Update all imports across the codebase"
echo "3. Run TypeScript compilation to find broken imports"
echo "4. Fix any remaining import issues"
echo ""
