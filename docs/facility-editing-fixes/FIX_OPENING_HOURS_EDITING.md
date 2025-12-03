# Fix: Opening Hours Editing Functionality

## Problem
The opening hours section in the facility edit form was not functional. The input fields had empty onChange handlers, and there was no mechanism to save the opening hours to the database or display them on the facility detail page.

## Solution
Implemented full opening hours editing functionality with the following components:

### 1. Backend Service Implementation
- Added `getAvailability` function to fetch facility availability data from the `facility_availability` table
- Added `updateAvailability` function to save facility availability data
- Created React Query hooks:
  - `useFacilityAvailability` - to fetch availability data
  - `useUpdateFacilityAvailability` - to update availability data

### 2. Frontend Implementation
- Integrated availability data fetching in FacilityEditPage
- Updated the useEffect hook to load availability data and populate the opening hours state
- Modified the handleSave function to save both facility data and availability data
- Implemented proper onChange handlers for all opening hours input fields
- Added unsaved changes tracking for opening hours modifications

### 3. Data Mapping
- Created mapping between day_of_week integers (0-6) and day names
- Properly converted between database format and UI format
- Handled default values for days without specific availability data

## Files Modified
1. `src/services/supabase/facilities.service.ts` - Added availability service functions and hooks
2. `src/pages/admin/FacilityEditPage.tsx` - Integrated availability functionality

## How It Works
1. When editing a facility, the system fetches existing availability data from the database
2. The opening hours inputs are populated with the fetched data or default values
3. When users change opening hours, the system tracks unsaved changes
4. When saving, both facility data and availability data are saved to their respective tables
5. The changes are immediately visible on the facility detail page

## Testing
The implementation has been tested to ensure:
- Opening hours load correctly from the database
- Changes to opening hours enable the save button
- Saving updates both facility and availability data
- Default values are used for new facilities
- Data is properly mapped between database and UI formats

This implementation allows administrators to fully manage facility opening hours, with changes reflected on both the edit form and the public facility detail page.