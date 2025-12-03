# Fix: Opening Hours Time Formatting

## Problem
The opening hours were displaying with seconds (e.g., "09:00:00 - 21:00:00") instead of just hours and minutes (e.g., "09:00 - 21:00"). This happened because:

1. The database stores time values with seconds precision
2. The frontend was displaying the raw database values without formatting
3. Users expect to see clean time formats without seconds

## Solution
Updated both the facility detail page and edit page to format time values by removing seconds:

### Facility Detail Page (FacilityInfoTabs.tsx)
- Modified the time display to use `substring(0, 5)` to extract only HH:MM from HH:MM:SS format
- Applied this formatting to all three time ranges (weekdays, saturday, sunday)

### Facility Edit Page (FacilityEditPage.tsx)
- Updated the useEffect hook to format time values when loading availability data from the database
- Applied `substring(0, 5)` to both start and end times when populating the opening hours state

## Files Modified
1. `src/components/features/facilities/components/FacilityDetail/FacilityInfoTabs.tsx` - Updated time display formatting
2. `src/pages/admin/FacilityEditPage.tsx` - Updated time loading formatting

## Implementation Details

### Time Formatting Approach
Used `substring(0, 5)` to extract the first 5 characters (HH:MM) from time strings in HH:MM:SS format:
- "09:00:00" becomes "09:00"
- "21:00:00" becomes "21:00"

### Consistency
Both the edit page and detail page now use the same formatting approach, ensuring:
- Consistent display between edit and view modes
- Clean user experience without seconds
- Proper data handling in both directions

## Verification
The fix has been tested to ensure:
1. Opening hours display correctly as "HH:MM - HH:MM" format
2. Time values are properly formatted when loaded from the database
3. Editing and saving times works correctly
4. No breaking changes to existing functionality

## Result
Users now see clean time formats without seconds in both the facility edit form and detail page, providing a better user experience that matches common time display conventions.