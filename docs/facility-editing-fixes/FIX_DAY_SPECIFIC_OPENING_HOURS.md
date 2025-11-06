# Fix: Day-Specific Opening Hours in Calendar

## Problem
The booking calendar was not correctly displaying day-specific opening hours. Instead of showing different time slots for each day based on that day's opening hours, it was using a single opening hours range for all days, causing issues like:
- Friday showing time slots only up to 20:00 instead of 22:00
- Calendar not respecting different opening hours for different days

## Root Cause
The TimeSlotGrid component was generating a fixed set of time slots based on a single [openingHoursStart](file:///Users/aminismail/Documents/GitHub/bookme-1/src/components/features/calendar/components/FacilityCalendar/index.tsx#L123-L123) and [openingHoursEnd](file:///Users/aminismail/Documents/GitHub/bookme-1/src/components/features/calendar/components/FacilityCalendar/index.tsx#L124-L124) value, which meant it was using the same opening hours for all days of the week.

## Solution
Updated the system to generate time slots based on the maximum opening hours across all days and then mark individual slots as unavailable based on day-specific hours:

### 1. Facility Detail Page Updates
- Added functions to calculate the earliest opening hour and latest closing hour across all days
- Updated FacilityCalendar component to use these calculated values for time slot generation
- Ensured time slots are generated for the full range of possible opening hours

### 2. Availability Calculation
- Enhanced the availability calculation to properly check day-specific opening hours
- Time slots outside a specific day's opening hours are marked as "unavailable"
- Maintained existing booking conflict detection logic

## Files Modified
1. `src/components/features/facilities/components/FacilityDetail/FacilityInfoTabs.tsx` - Added time range calculation functions and updated FacilityCalendar props

## Implementation Details

### Time Slot Generation
- Time slots are now generated based on the earliest opening hour and latest closing hour across all days
- This ensures all possible time slots are available for selection
- Individual slots are marked as unavailable based on day-specific opening hours

### Example
If a facility has:
- Monday-Friday: 07:00-22:00
- Saturday: 10:00-20:00
- Sunday: 12:00-18:00

The calendar will:
- Generate time slots from 07:00-22:00 (earliest start to latest end)
- Show available slots from 07:00-22:00 on weekdays
- Show available slots from 10:00-20:00 on Saturday (07:00-09:00 and 21:00-22:00 marked as unavailable)
- Show available slots from 12:00-18:00 on Sunday (07:00-11:00 and 19:00-22:00 marked as unavailable)

## Verification
The fix has been tested to ensure:
1. Time slots are generated for the full range of possible opening hours
2. Day-specific opening hours are properly respected
3. Time slots outside opening hours are marked as unavailable
4. Existing functionality (booking conflicts, etc.) remains intact

## Result
Users now see accurate availability information in the booking calendar that properly respects different opening hours for different days of the week. The calendar generates time slots for the full range of possible hours and then marks individual slots as unavailable based on each day's specific opening hours.