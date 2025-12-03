# Fix: Facility Opening Hours Display

## Problem
The opening hours displayed on the facility detail page were hardcoded with default values (08:00-22:00 for weekdays, etc.) instead of showing the actual availability data saved in the database. This meant that even after users updated opening hours in the edit form, those changes weren't visible on the facility detail page.

## Root Cause
The FacilityInfoTabs component in the facility detail page was not fetching or using the actual facility availability data from the `facility_availability` table. Instead, it was displaying static, hardcoded values.

## Solution
Updated the FacilityInfoTabs component to:

1. Import and use the `useFacilityAvailability` hook to fetch actual availability data
2. Process the availability data into a more usable format
3. Display the actual opening hours instead of hardcoded values
4. Maintain fallback to default values when no availability data exists

## Files Modified
- `src/components/features/facilities/components/FacilityDetail/FacilityInfoTabs.tsx` - Updated to fetch and display actual availability data

## Implementation Details

### Data Fetching
- Added import for `useFacilityAvailability` hook
- Fetch availability data using the facility ID
- Process data into a day-keyed object for easy access

### Data Processing
- Map database day_of_week integers (0-6) to day names
- Convert availability records into a structured format:
  ```javascript
  {
    monday: { start: "08:00", end: "22:00" },
    tuesday: { start: "08:00", end: "22:00" },
    // ... etc
  }
  ```

### Display Logic
- Updated opening hours display to use actual data when available
- Maintain fallback to default values for backward compatibility
- Show formatted time ranges (e.g., "08:00 - 22:00") instead of hardcoded text

## Verification
The fix has been tested to ensure:
1. Opening hours load correctly from the database
2. Changes made in the edit form appear on the detail page
3. Default values are shown for facilities without availability data
4. No breaking changes to existing functionality

## Result
Users can now see their updated opening hours on the facility detail page immediately after saving changes in the edit form. The display accurately reflects the data stored in the database.