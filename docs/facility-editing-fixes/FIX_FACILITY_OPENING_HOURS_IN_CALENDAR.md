# Fix: Facility Opening Hours in Calendar

## Problem
The opening hours set in the facility edit page were not being used in the booking process calendar. The calendar was using hardcoded opening hours (08:00-22:00) for all days instead of the actual facility availability data.

## Solution
Updated the system to use actual facility availability data in the booking calendar:

### 1. Backend Service Updates
- Enhanced the `useFacilityAvailability` hook to fetch actual facility availability data
- Updated the availability data processing to properly format time values (removing seconds)

### 2. Availability Calculation Hook
- Modified `useAvailabilityCalculation` hook to accept facility availability data
- Updated the mock availability calculation to use actual facility opening hours
- Added logic to mark time slots as unavailable when they fall outside facility opening hours

### 3. Facility Detail Page Integration
- Updated `FacilityInfoTabs` component to fetch and process facility availability data
- Passed facility availability data to the `useAvailabilityCalculation` hook
- Updated `FacilityCalendar` component to receive and use custom availability status function

### 4. Calendar Component Updates
- Modified `FacilityCalendar` to accept and pass down custom availability status function
- Updated time slot generation to respect facility-specific opening hours

## Files Modified
1. `src/hooks/features/calendar/useAvailabilityCalculation.ts` - Added facility availability support
2. `src/components/features/facilities/components/FacilityDetail/FacilityInfoTabs.tsx` - Integrated facility availability data
3. `src/components/features/calendar/components/FacilityCalendar/index.tsx` - Updated to use custom availability status

## Implementation Details

### Data Flow
1. Facility availability data is fetched using `useFacilityAvailability` hook
2. Data is processed into a day-keyed object for easy access
3. Processed data is passed to `useAvailabilityCalculation` hook
4. Hook uses the data to determine if time slots are within facility opening hours
5. Custom availability status function is passed to `FacilityCalendar`
6. Calendar uses the custom function to mark time slots as available/unavailable

### Time Formatting
- All time values are formatted to remove seconds (HH:MM instead of HH:MM:SS)
- Consistent formatting across edit and view pages

### Availability Logic
- Time slots outside facility opening hours are marked as "unavailable"
- Existing mock booking conflict logic is preserved
- Weekend evening restrictions are still applied

## Verification
The fix has been tested to ensure:
1. Facility availability data is correctly fetched and processed
2. Time slots in the calendar respect facility opening hours
3. Different opening hours for different days are properly handled
4. Existing functionality (booking conflicts, etc.) remains intact
5. Time formatting is consistent across the application

## Result
Users now see accurate availability information in the booking calendar that matches the opening hours they set in the facility edit page. Time slots outside facility opening hours are properly marked as unavailable, providing a better booking experience.