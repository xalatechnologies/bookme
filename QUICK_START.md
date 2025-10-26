# Quick Start: Supabase Integration

## ✅ What's Ready

Your BookMe frontend is now configured with:

1. **Supabase Client** - Connected to local Supabase backend
2. **Authentication** - Magic link auth with user profiles
3. **React Query** - Optimized caching and state management
4. **Facilities Service** - Full CRUD with React Query hooks
5. **Database Types** - 103KB TypeScript types from your schema

## 🚀 Start Development

### 1. Start Supabase Backend

```bash
cd "/Volumes/Development/Xala Products/bookme"
supabase start
```

**Access Points:**
- Studio: http://127.0.0.1:54323
- API: http://127.0.0.1:54321
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### 2. Start Frontend

```bash
cd ~/Documents/xaheen/bookme
npm run dev
```

**Your app runs at:** http://localhost:3000

## 📝 Quick Examples

### Use Auth

```tsx
import { useAuth } from '@/contexts/AuthContext';

function Header() {
  const { user, signIn, signOut } = useAuth();

  if (!user) {
    return <button onClick={() => signIn('user@example.com')}>Sign In</button>;
  }

  return <button onClick={signOut}>Sign Out ({user.email})</button>;
}
```

### Use Facilities

```tsx
import { useFacilities } from '@/services/supabase/facilities.service';
import { useAuth } from '@/contexts/AuthContext';

function FacilityList() {
  const { currentOrgId } = useAuth();
  const { data: facilities, isLoading } = useFacilities(currentOrgId!);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {facilities?.map(f => (
        <div key={f.id}>{f.name}</div>
      ))}
    </div>
  );
}
```

### Create Facility

```tsx
import { useCreateFacility } from '@/services/supabase/facilities.service';

function CreateForm() {
  const create = useCreateFacility();

  const handleSubmit = (data) => {
    create.mutate(data, {
      onSuccess: () => alert('Created!'),
      onError: (err) => alert(err.message),
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 📚 Documentation

- **Complete Plan:** `SUPABASE_MIGRATION_PLAN.md`
- **Implementation Guide:** `IMPLEMENTATION_STARTED.md`
- **Backend Status:** `MIGRATION_COMPLETE.md`

## 🔧 Troubleshooting

**Problem:** Connection refused
**Solution:** Run `supabase start` in backend directory

**Problem:** Type errors
**Solution:** Restart Vite dev server

**Problem:** No data showing
**Solution:** Check auth and org membership

## 🎯 Next Steps

1. Test auth flow (sign in/out)
2. Test facilities CRUD
3. Migrate one component as proof of concept
4. Create more services (bookings, zones, etc.)

---

**Status:** ✅ Ready to code!
