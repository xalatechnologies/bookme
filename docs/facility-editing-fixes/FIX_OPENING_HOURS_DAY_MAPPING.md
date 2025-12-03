# Fix: Opening Hours Day Mapping

## Problem
There was an inconsistency in how day_of_week integers were mapped to day names between the FacilityEditPage and FacilityInfoTabs components. This caused an off-by-one error where:
- Changes to Saturday opening hours in the edit form affected Friday time slots in the calendar
- Changes to Sunday opening hours in the edit form affected Saturday time slots in the calendar
- Sunday time slots in the calendar were not affected by any changes

## Root Cause
The inconsistency was in the dayMap definitions:
- FacilityEditPage used: 0=Monday, 1=Tuesday, ..., 6=Sunday
- FacilityInfoTabs used: 0=Sunday, 1=Monday, ..., 6=Saturday

According to the PostgreSQL standard and the database schema, the correct mapping should be:
- 0=Sunday, 1=Monday, ..., 6=Saturday

## Solution
Updated both components to use the correct day mapping:

### 1. FacilityEditPage Updates
- Fixed the dayMap in the useEffect hook to correctly map day_of_week integers to day names
- Fixed the dayMap in the handleSave function to correctly map day names to day_of_week integers

### 2. Verification
- Confirmed that the database schema uses the standard convention (0=Sunday, 1=Monday, ..., 6=Saturday)
- Ensured consistency between edit and view components

## Files Modified
1. `src/pages/admin/FacilityEditPage.tsx` - Fixed dayMap definitions in both the useEffect hook and handleSave function

## Implementation Details

### Correct Day Mapping
The correct mapping according to PostgreSQL standard is:
```
0 = Sunday
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
```

### Before Fix
FacilityEditPage was using:
```
0 = Monday (incorrect)
1 = Tuesday (incorrect)
...
6 = Sunday (incorrect)
```

### After Fix
Both components now use the correct mapping:
```
0 = Sunday (correct)
1 = Monday (correct)
...
6 = Saturday (correct)
```

## Verification
The fix has been tested to ensure:
1. Changes to opening hours in the edit form correctly affect the corresponding day in the calendar
2. Saturday changes affect Saturday time slots (not Friday)
3. Sunday changes affect Sunday time slots (not Saturday)
4. All days of the week are properly mapped
5. Data is saved and loaded correctly from the database

## Result
Users can now correctly edit opening hours for each day of the week, and those changes are properly reflected in the booking calendar for the correct days. The off-by-one error has been resolved, ensuring that:
- Monday-Friday changes affect the correct weekdays
- Saturday changes affect Saturday time slots
- Sunday changes affect Sunday time slots