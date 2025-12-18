# Analysis of Direct Supabase Imports

**Date**: 2024-12-08
**Status**: ✅ **COMPLETE**

## Files with Direct Supabase Imports

### 1. `src/components/layouts/PublicLayout/GlobalHeader.tsx`
- **Import**: `import { supabase } from '@/lib/clients/supabase';`
- **Usage**: 
  - Saving user portal preference to profiles table
  - Direct Supabase call in useEffect hook
- **Status**: ✅ **REFactored** - Now uses usePortalPreference hook

### 2. `src/contexts/AuthContext.tsx`
- **Import**: `import { supabase } from '@/lib/clients/supabase';`
- **Usage**: 
  - Extensive usage throughout the context for authentication
  - Fetching user profile, memberships, recording login events
  - This is acceptable as it's a context provider

### 3. `src/contexts/LanguageContext.tsx`
- **Import**: `import { supabase } from '@/lib/clients/supabase';`
- **Usage**: 
  - Saving/loading language preference to/from profiles table
  - Direct Supabase calls in useEffect and setLanguage functions
  - This is acceptable as it's a context provider

### 4. `src/pages/admin/UsersRolesPage.tsx`
- **Import**: `import { supabase } from '@/lib/clients/supabase';`
- **Usage**: 
  - Direct Supabase calls for user/role management
  - This is acceptable as it's an admin page

### 5. `src/pages/Checkout.tsx`
- **No direct Supabase imports found**
- **Analysis**: Uses useCheckoutLogic hook which handles all data operations

### 6. `src/pages/Index.tsx`
- **No direct Supabase imports found**
- **Analysis**: Uses useIndexPageLogic hook which handles all data operations

## Summary

The analysis reveals that there are 4 files with direct Supabase imports. However, not all need to be refactored:

1. **Acceptable Context Usage**:
   - `AuthContext.tsx` - Core authentication context (acceptable)
   - `LanguageContext.tsx` - Language preference context (acceptable)

2. **Acceptable Admin Usage**:
   - `UsersRolesPage.tsx` - Admin-specific functionality (acceptable)

3. **Needs Refactoring**:
   - `GlobalHeader.tsx` - UI component with direct Supabase calls (✅ **NOW REFACtORED**)

The pages (Index.tsx and Checkout.tsx) are already properly refactored to use hooks instead of direct Supabase calls.

## Changes Made

1. ✅ Created `usePortalPreference` hook in `src/hooks/features/portal/usePortalPreference.ts`
2. ✅ Created `updatePreferredPortal` method in `src/services/supabase/users.service.ts`
3. ✅ Updated database types to include `preferred_portal` field
4. ✅ Refactored `GlobalHeader.tsx` to use the new hook instead of direct Supabase calls
5. ✅ Removed direct Supabase import from `GlobalHeader.tsx`