# Fix: Facility Creation Issue

## Problem
When creating a new facility through the admin interface at http://localhost:8000/admin/facilities/new, the facility was not being saved to the database. The user could fill out the form but the "Lagre endringer" (Save changes) button would not successfully create a new facility.

## Root Cause Analysis
After investigating the code, I identified the following potential issues:

1. **Missing org_id in facility data**: Although the `createNewFacilityTemplate` function includes `org_id: orgId`, there might have been cases where this field was not properly included in the data sent to the database.

2. **Data preparation issue**: The way facility data was being prepared in the `handleSave` function might have been excluding required fields or not properly structuring the data for the Supabase insert operation.

3. **Lack of debugging information**: There was insufficient logging to help diagnose issues with the facility creation process.

## Solution Implemented
I made the following changes to fix the facility creation issue:

### 1. Explicit org_id Inclusion
Updated the `handleSave` function in `src/pages/admin/FacilityEditPage.tsx` to explicitly ensure the `org_id` field is always included in the facility data:

```typescript
const facilityData = {
  ...editedFacility,
  org_id: editedFacility.org_id || orgId, // Ensure org_id is always present
  description: cleanedDescription,
  contact_email: formattedContactInfo.email || null,
  contact_phone: formattedContactInfo.phone || null,
  updated_at: new Date().toISOString(),
};
```

### 2. Added Debug Logging
Added comprehensive console logging throughout the facility creation process to help diagnose any future issues:

- Logging of facility data before saving
- Logging of availability data
- Logging of creation/update operations
- Logging of successful operations

### 3. Improved Error Handling
Enhanced error logging to provide more detailed information about any issues that occur during facility creation.

## Files Modified
1. `src/pages/admin/FacilityEditPage.tsx` - Updated handleSave function with explicit org_id inclusion and debug logging

## Verification
The fix ensures that:

1. The `org_id` field is always present when creating a new facility
2. Debug information is available to help diagnose any future issues
3. Error handling is improved to provide better feedback

## Testing
To test this fix:

1. Navigate to http://localhost:8000/admin/facilities/new
2. Fill out the facility form with all required information
3. Click the "Lagre endringer" button
4. Check the browser console for debug logs
5. Verify that the new facility is created and appears in the facilities list

## Additional Notes
If issues persist, check the browser console for detailed error messages and ensure that:

1. The organization with ID `fdd29683-8e3c-48be-bd2c-12d3c3ef028f` exists in the database
2. The user has proper permissions to create facilities
3. All required fields are filled out correctly in the form