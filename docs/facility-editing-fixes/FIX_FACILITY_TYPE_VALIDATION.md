# Fix: Facility Type Validation Issue

## Problem
When creating a new facility through the admin interface at http://localhost:8000/admin/facilities/new, the facility was not being saved to the database due to an invalid facility_type value:

```
{code: 'P0001', message: 'Invalid facility_type: conference. Must be a valid key in localized_db_values (facility_type)', details: null, hint: 'Valid keys: idrettshall, kulturhus, møterom, fotballbane, svømmehall, tennisbane, hall'}
```

## Root Cause Analysis
The issue was with the `facility_type` field in the facility data. The database has a validation constraint that only allows specific values for the `facility_type` field. The frontend was using "conference" as the default value, which is not a valid option.

Valid facility_type values are:
- idrettshall
- kulturhus
- møterom
- fotballbane
- svømmehall
- tennisbane
// Hall is no longer a valid facility type and has been removed from the system

## Solution Implemented
I made the following changes to fix the facility creation issue:

### 1. Updated Default Facility Type
Changed the default facility_type in the `createNewFacilityTemplate` function from "conference" to "møterom" (meeting room), which is a valid value:

```typescript
const createNewFacilityTemplate = (): Partial<Facility> => ({
  // ... other fields
  facility_type: "møterom", // Changed from "conference" to valid value "møterom"
  // ... other fields
});
```

## Files Modified
1. `src/pages/admin/FacilityEditPage.tsx` - Updated createNewFacilityTemplate function

## Verification
The fix ensures that:

1. New facilities are created with a valid facility_type value
2. The database validation constraint is satisfied
3. Facilities can be successfully created and saved to the database

## Testing
To test this fix:

1. Navigate to http://localhost:8000/admin/facilities/new
2. Fill out the facility form with all required information
3. Click the "Lagre endringer" button
4. The new facility should now be properly created and saved to the database
5. The new facility should appear in the facilities list

## Additional Notes
For future reference, when adding or modifying facility types:

1. Only use valid values from the predefined list
2. Consider adding validation in the frontend to prevent invalid values
3. The facility_type field is used for localization and categorization of facilities

The current solution uses "møterom" (meeting room) as the default facility type, which is appropriate for most general-purpose facilities.

Note: The facility type "hall" has been deprecated and removed from the system. Any references to it should be updated to use a valid facility type.