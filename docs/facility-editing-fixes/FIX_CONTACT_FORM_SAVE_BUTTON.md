# Fix: Contact Form Save Button Issue

## Problem
When making changes to the contact information in the facility edit form, the "Lagre endringer" (Save changes) button was not becoming enabled, preventing users from saving their changes.

## Root Cause
The contact information input fields were correctly updating the `contactInfo` state but were not calling `setHasUnsavedChanges(true)` to enable the save button. This meant that even though the contact information was being updated, the system didn't recognize that there were unsaved changes.

## Solution
Updated the contact information input fields in `src/pages/admin/FacilityEditPage.tsx` to call `setHasUnsavedChanges(true)` when changes are made:

```typescript
// Before (missing setHasUnsavedChanges call):
<Input
  value={contactInfo.email}
  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
  className="w-full"
  placeholder="Sett inn e-post adresse..."
/>

// After (with setHasUnsavedChanges call):
<Input
  value={contactInfo.email}
  onChange={(e) => {
    setContactInfo({ ...contactInfo, email: e.target.value });
    setHasUnsavedChanges(true);
  }}
  className="w-full"
  placeholder="Sett inn e-post adresse..."
/>
```

The same fix was applied to the phone input field.

## Verification
The fix has been tested and verified to work correctly:
1. When contact information is changed, the save button becomes enabled
2. When no changes are made, the save button remains disabled
3. The contact information is properly saved to the separate database fields
4. The description field remains clean without embedded contact information

## Files Modified
- `src/pages/admin/FacilityEditPage.tsx` - Updated contact information input fields to properly track unsaved changes

## Testing
A test script was created at `scripts/test-contact-form.js` to verify the functionality works correctly.

This fix ensures that users can now save their changes when updating contact information in the facility edit form.