# Troubleshooting: Facility Save Issue

## Problem
After implementing the contact fields feature, the "Lagre endringer" (Save changes) functionality is not working in the FacilityEditPage.

## Common Causes and Solutions

### 1. Check Browser Console for Errors
Open your browser's developer tools (F12) and check the Console tab for any JavaScript errors when you click "Lagre endringer".

**Common errors to look for:**
- TypeError: Cannot read property '...' of undefined
- TypeError: Cannot set property '...' of undefined
- Network errors (400, 401, 403, 500 status codes)

### 2. Check Network Tab
In the browser's developer tools, go to the Network tab and click "Lagre endringer". Look for:
- Failed API requests to Supabase
- Request payloads that might be missing required fields
- Response errors from the server

### 3. Verify Database Schema
The issue might be related to the database schema not being properly updated. Let's verify the columns exist:

```sql
-- Run this in your Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'facilities'
AND column_name IN ('contact_email', 'contact_phone');
```

You should see both columns listed.

### 4. Check FacilityEditPage State Management
The issue might be in how the contact information is being managed in the component state. 

**Verify that:**
- The `contactInfo` state is being properly updated when you type in the email/phone fields
- The `handleSave` function is correctly building the facilityData object

### 5. Test the Save Function Directly
Let's create a simple test to verify the save functionality works:

```javascript
// In your browser console, run this code:
const testData = {
  name: "Test Facility",
  description: "Test description",
  contact_email: "test@example.com",
  contact_phone: "+47 123 45 678",
  capacity: 50
};

// This assumes you have access to the supabase client
supabase
  .from('facilities')
  .update(testData)
  .eq('id', 'YOUR_FACILITY_ID')
  .then(result => {
    console.log('Update result:', result);
  })
  .catch(error => {
    console.error('Update error:', error);
  });
```

### 6. Check for Validation Errors
The database constraints we added might be causing issues:

```sql
-- Check if there are any constraint violations
SELECT id, name, contact_email, contact_phone
FROM facilities
WHERE contact_email IS NOT NULL AND contact_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
   OR contact_phone IS NOT NULL AND contact_phone !~ '^(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$';
```

### 7. Debug the HandleSave Function
Add some console.log statements to the handleSave function in FacilityEditPage.tsx to see what's happening:

```typescript
const handleSave = async (): Promise<void> => {
  if (!editedFacility) return;

  console.log('Saving facility:', editedFacility);
  console.log('Contact info:', contactInfo);

  try {
    // Update description with contact information for backward compatibility
    const updatedDescription = updateDescriptionWithContact(
      editedFacility.description || '',
      contactInfo.email,
      contactInfo.phone
    );
    
    console.log('Updated description:', updatedDescription);

    const facilityData = {
      ...editedFacility,
      description: updatedDescription,
      contact_email: contactInfo.email || null,
      contact_phone: contactInfo.phone || null,
      updated_at: new Date().toISOString(),
    };
    
    console.log('Facility data to save:', facilityData);

    if (id === "new" || window.location.pathname.includes('/facilities/new')) {
      // Create new facility
      console.log('Creating new facility');
      await createFacilityMutation.mutateAsync(facilityData as FacilityInsert);
      toast.success("Lokale opprettet!");
      navigate("/admin/facilities");
    } else {
      // Update existing facility
      console.log('Updating existing facility with ID:', id);
      await updateFacilityMutation.mutateAsync({
        id: id || "",
        updates: facilityData
      });
      toast.success("Lokale lagret!");
      setHasUnsavedChanges(false);
    }
  } catch (error) {
    console.error("Error saving facility:", error);
    toast.error("Feil ved lagring av lokale. Vennligst prøv igjen.");
  }
};
```

## Quick Fixes to Try

### 1. Restart Your Development Server
Sometimes changes don't take effect immediately:
```bash
# Stop your development server (Ctrl+C)
# Then restart it
npm run dev
```

### 2. Clear Browser Cache
Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R) to clear cached files.

### 3. Check for TypeScript Errors
Make sure there are no TypeScript compilation errors:
```bash
npm run type-check
```

### 4. Verify Environment Variables
Make sure your `.env.local` file has the correct Supabase configuration:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## If None of the Above Work

1. **Revert the migration temporarily** and test if saving works without the new columns
2. **Check the Supabase logs** in your dashboard for any database errors
3. **Create a minimal test case** with just the essential fields to isolate the issue

## Support
If you're still having issues, please provide:
1. Browser console errors
2. Network request/response details
3. Any error messages you see on screen