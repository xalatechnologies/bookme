# Fix: Facility Type Case Sensitivity Issue

## Problem
When creating a new facility through the admin interface at http://localhost:8000/admin/facilities/new, the facility was not being saved to the database due to a case sensitivity issue with the facility_type field:

```
{code: 'P0001', message: 'Invalid facility_type: Idrettshall. Must be a valid key in localized_db_values (facility_type)', details: null, hint: 'Valid keys: idrettshall, kulturhus, møterom, fotballbane, svømmehall, tennisbane, hall'}
```

## Root Cause Analysis
The issue was with the case sensitivity of the `facility_type` field. The database validation requires all facility_type values to be lowercase, but the frontend was allowing users to enter values in any case (e.g., "Idrettshall" instead of "idrettshall").

Valid facility_type values (all lowercase):
- idrettshall
- kulturhus
- møterom
- fotballbane
- svømmehall
- tennisbane
- hall

## Solution Implemented
I made the following changes to fix the facility creation issue:

### 1. Automatic Lowercase Conversion
Updated the `handleSave` function to automatically convert the facility_type to lowercase before saving:

```typescript
const facilityData: Partial<FacilityInsert> = {
  ...editedFacility,
  org_id: editedFacility.org_id || orgId, // Ensure org_id is always present
  facility_type: editedFacility.facility_type?.toLowerCase() || "møterom", // Ensure lowercase facility_type
  // ... other fields
};
```

### 2. Maintained Default Valid Value
Kept the default facility_type as "møterom" which is a valid lowercase value.

## Files Modified
1. `src/pages/admin/FacilityEditPage.tsx` - Updated handleSave function to convert facility_type to lowercase

## Verification
The fix ensures that:

1. Facility types are automatically converted to lowercase before being sent to the database
2. The database validation constraint is satisfied regardless of user input case
3. Facilities can be successfully created and saved to the database

## Testing
To test this fix:

1. Navigate to http://localhost:8000/admin/facilities/new
2. Fill out the facility form with all required information
3. Enter a facility type in any case (e.g., "Idrettshall", "IDRETTSHALL", "Idrettshall")
4. Click the "Lagre endringer" button
5. The new facility should now be properly created and saved to the database
6. The new facility should appear in the facilities list

## Additional Notes
This solution provides a better user experience by automatically handling case conversion rather than requiring users to remember to enter values in lowercase. The database constraint is still enforced, but the frontend now handles the conversion automatically.

For future reference, when adding or modifying facility types:
1. The system will automatically convert any input to lowercase
2. Only valid values from the predefined list will be accepted
3. The facility_type field is used for localization and categorization of facilities

The current solution maintains "møterom" (meeting room) as the default facility type, which is appropriate for most general-purpose facilities.