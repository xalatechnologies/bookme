#!/bin/bash

# Final Import Fixes - All Remaining Issues
# This script fixes ALL remaining import paths

set -e

BASE_DIR="/Users/ibrahimrahmani/Documents/xaheen/booknor/src"
cd "$BASE_DIR"

echo "======================================================"
echo "Final Import Path Fixes"
echo "======================================================"
echo ""

# Fix admin dashboard imports
echo "Fixing admin dashboard imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/admin/dashboard/|@/components/features/dashboard/admin/|g" {} \;

# Fix admin facilities imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/admin/facilities/|@/components/features/facilities/components/FacilityEditForm/|g" {} \;

# Fix admin guards imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/admin/guards/RequireRole|@/components/features/auth/components/RequireRole|g" {} \;

# Fix admin header imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/admin/header/NotificationBell|@/components/layouts/AdminLayout/NotificationBell|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/admin/header/ProfileDropdown|@/components/layouts/AdminLayout/ProfileDropdown|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/admin/header/SearchField|@/components/features/search/components/AdminSearchField|g" {} \;

# Fix admin layout imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/admin/layout/SystemPageLayout|@/components/layouts/AdminLayout/SystemPageLayout|g" {} \;

# Fix user dashboard imports
echo "Fixing user dashboard imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/user/dashboard/|@/components/features/dashboard/user/|g" {} \;

# Fix user header imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/user/header/|@/components/layouts/UserLayout/|g" {} \;

# Fix auth imports
echo "Fixing auth imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/auth/ProtectedRoute|@/components/features/auth/components/ProtectedRoute|g" {} \;

# Fix bookings imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|from '@/components/bookings'|from '@/components/features/bookings'|g" {} \;

# Fix calendar imports
echo "Fixing calendar imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/calendar/EnhancedCalendar|@/components/features/calendar/components/EnhancedCalendar|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/calendar/FacilityCalendar|@/components/features/calendar/components/FacilityCalendar|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/calendar/ReadOnlyCalendar|@/components/features/calendar/components/FacilityCalendar/ReadOnlyCalendar|g" {} \;

# Fix facility imports
echo "Fixing facility imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/facility/FacilityCard|@/components/features/facilities/components/FacilityCard|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/facility/FacilityCardUser|@/components/features/facilities/components/FacilityCard/FacilityCardUser|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/facility/FacilityListItemUser|@/components/features/facilities/components/FacilityCard/FacilityListItemUser|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/facility/FilterBarUser|@/components/features/facilities/components/FacilitySearch/FilterBar|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/facility/ViewToggleUser|@/components/features/facilities/components/FacilitySearch/ViewToggle|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/facility/detail/|@/components/features/facilities/components/FacilityDetail/|g" {} \;

# Fix FacilityList imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/FacilityList|@/components/features/facilities/components/FacilitySearch/FacilityList|g" {} \;

# Fix MapView imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/MapView|@/components/features/facilities/components/FacilityMap/MapView|g" {} \;

# Fix header imports
echo "Fixing header imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/header/CartDropdown|@/components/layouts/PublicLayout/CartDropdown|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/header/GlobalSearch|@/components/features/search/components/GlobalSearch|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/header/LanguageToggle|@/components/layouts/PublicLayout/LanguageToggle|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/header/Logo|@/components/layouts/PublicLayout/Logo|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/header/MobileMenu|@/components/layouts/PublicLayout/MobileMenu|g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/header/ProfileMenu|@/components/layouts/PublicLayout/ProfileMenu|g" {} \;

# Fix messaging imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/messaging/MessageInbox|@/components/features/messaging/components/MessageInbox|g" {} \;

# Fix SearchFilter imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/SearchFilter|@/components/features/search/components/SearchFilter|g" {} \;

# Fix support imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" -exec sed -i '' "s|@/components/support/SupportTicketForm|@/components/features/support/components/SupportTicketForm|g" {} \;

# Fix relative imports within feature folders
echo "Fixing relative imports within features..."

# Fix facility detail relative imports
find components/features/facilities/components/FacilityDetail -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from '../AirBnbStyleGallery'|from '../FacilityImageGallery/AirBnbStyleGallery'|g" {} \;
find components/features/facilities/components/FacilityDetail -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from '../FacilityContactInfo'|from './FacilityContactInfo'|g" {} \;
find components/features/facilities/components/FacilityDetail -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from '../FacilityHeader'|from './FacilityHeader'|g" {} \;

# Fix layout index imports
sed -i '' "s|from './AdminLayout'|from './index'|g" components/layouts/AdminLayout/AdminHeader.tsx 2>/dev/null || true
sed -i '' "s|from './AdminLayout'|from './index'|g" components/layouts/AdminLayout/AdminSidebar.tsx 2>/dev/null || true
sed -i '' "s|from './UserLayout'|from './index'|g" components/layouts/UserLayout/UserHeader.tsx 2>/dev/null || true
sed -i '' "s|from './UserLayout'|from './index'|g" components/layouts/UserLayout/UserSidebar.tsx 2>/dev/null || true

# Fix facility features index exports
echo "Fixing facility features index exports..."
sed -i '' "s|from './components/FacilityDetail'|from './components/FacilityDetail/FacilityDetailLayout'|g" components/features/facilities/index.ts 2>/dev/null || true
sed -i '' "s|from './components/FacilityEditForm'|from './components/FacilityEditForm/FacilityEditForm'|g" components/features/facilities/index.ts 2>/dev/null || true
sed -i '' "s|from './components/FacilityImageGallery'|from './components/FacilityImageGallery/GalleryGrid'|g" components/features/facilities/index.ts 2>/dev/null || true
sed -i '' "s|from './components/FacilityMap'|from './components/FacilityMap/MapContainer'|g" components/features/facilities/index.ts 2>/dev/null || true
sed -i '' "s|from './components/FacilitySearch'|from './components/FacilitySearch/FacilityGrid'|g" components/features/facilities/index.ts 2>/dev/null || true

# Fix relative UI and gallery imports in features
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './ui/button'|from '@/components/ui/button'|g" {} \;
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './ui/card'|from '@/components/ui/card'|g" {} \;
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './gallery/GalleryGrid'|from '../FacilityImageGallery/GalleryGrid'|g" {} \;
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './gallery/GalleryModal'|from '../FacilityImageGallery/GalleryModal'|g" {} \;
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './gallery/MobileGallery'|from '../FacilityImageGallery/MobileGallery'|g" {} \;
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './map/MapContainer'|from '../FacilityMap/MapContainer'|g" {} \;
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './map/MapMarkers'|from '../FacilityMap/MapMarkers'|g" {} \;
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './search/ViewHeader'|from '@/components/features/search/components/ViewHeader'|g" {} \;
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './facility/FacilityCard'|from '../FacilityCard'|g" {} \;
find components/features -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|from './facility/FacilityListItem'|from '../FacilityCard/FacilityListItem'|g" {} \;

echo ""
echo "✅ All final imports fixed!"
echo ""
