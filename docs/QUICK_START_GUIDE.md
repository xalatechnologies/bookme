# BookMe - Quick Start Guide for Developers

**Welcome to the refactored BookMe codebase!** 🎉  
This guide will help you quickly understand the new architecture and start contributing.

---

## 🏗️ **New Architecture Overview**

BookMe now uses a **feature-based architecture** where code is organized by business domain rather than technical type.

### **Key Principles**

1. **Feature Domains**: Code organized by what it does (bookings, calendar, facilities)
2. **Co-location**: Related code lives together (components + hooks + types)
3. **Clear Boundaries**: Each feature owns its code
4. **Shared Utilities**: Common code in designated shared/ directories

---

## 📁 **Project Structure**

```
src/
├── components/
│   ├── features/          # Feature-based components
│   │   ├── bookings/      # Booking domain
│   │   ├── calendar/      # Calendar domain
│   │   ├── facilities/    # Facilities domain
│   │   └── ... (7 more)
│   ├── common/            # Shared components (buttons, forms, etc.)
│   ├── layouts/           # Layout components
│   └── ui/                # UI primitives (Radix/shadcn)
│
├── hooks/
│   ├── shared/            # Shared utility hooks
│   ├── auth/              # Auth hooks
│   └── ... (cross-cutting hooks)
│
├── services/
│   ├── supabase/          # Database layer
│   ├── shared/            # HTTP client, error handling
│   └── *.service.ts       # Business logic wrappers
│
├── pages/                 # Route pages
├── stores/                # Zustand stores
├── contexts/              # React contexts
└── types/                 # Global types
```

---

## 🎯 **Finding Code**

### **"Where do I find...?"**

| What you need | Where to look |
|---------------|---------------|
| Calendar components | `src/components/features/calendar/` |
| Booking logic | `src/components/features/bookings/` |
| Calendar hooks | `src/components/features/calendar/hooks/` |
| Form validation | `src/hooks/shared/useFormValidation.ts` |
| API calls | `src/services/` |
| Common button | `src/components/common/buttons/` |
| UI primitives | `src/components/ui/` |

### **Quick Find Commands**

```bash
# Find all calendar code
ls src/components/features/calendar/

# Find booking hooks
ls src/components/features/bookings/hooks/

# Find all services
ls src/services/
```

---

## 🚀 **Adding a New Feature**

### **Step 1: Create Feature Domain** (if new)

```bash
# Create feature directory
mkdir -p src/components/features/my-feature/{components,hooks}

# Create required files
touch src/components/features/my-feature/types.ts
touch src/components/features/my-feature/constants.ts
touch src/components/features/my-feature/index.ts
touch src/components/features/my-feature/README.md
```

### **Step 2: Create Component**

```typescript
// src/components/features/my-feature/components/MyComponent.tsx
import { useMyHook } from '../hooks';
import { MyFeatureType } from '../types';
import { MY_CONSTANT } from '../constants';

export const MyComponent = () => {
  const data = useMyHook();
  
  return <div>My Feature</div>;
};
```

### **Step 3: Create Hook** (if needed)

```typescript
// src/components/features/my-feature/hooks/useMyHook.ts
import { useState } from 'react';

export const useMyHook = () => {
  const [data, setData] = useState(null);
  
  // Hook logic
  
  return data;
};
```

### **Step 4: Create Barrel Exports**

```typescript
// src/components/features/my-feature/index.ts
export * from './components/MyComponent';
export * from './hooks/useMyHook';
export * from './types';
export * from './constants';
```

### **Step 5: Use in Pages**

```typescript
// src/pages/MyFeaturePage.tsx
import { MyComponent } from '@/components/features/my-feature';

export const MyFeaturePage = () => {
  return <MyComponent />;
};
```

---

## 📦 **Import Patterns**

### **Feature Components** (Local)

```typescript
// Within same feature
import { MyComponent } from '../components/MyComponent';
import { useMyHook } from '../hooks';

// From parent directory
import { MyComponent } from './components/MyComponent';
```

### **Cross-Feature Imports** (Explicit)

```typescript
// Using hooks from another feature
import { useAvailabilityStatus } from '@/components/features/bookings/hooks';

// Using components from another feature
import { CalendarView } from '@/components/features/calendar';
```

### **Shared Utilities** (Global)

```typescript
// Shared hooks
import { useModal, useFormValidation } from '@/hooks/shared';

// Or from main index
import { useModal } from '@/hooks';

// Shared components
import { Button } from '@/components/common/buttons';
```

### **Services**

```typescript
// From main service index
import { bookingsService, facilitiesService } from '@/services';

// Direct from service file
import { bookingsService } from '@/services/bookings.service';

// From Supabase layer
import { authService } from '@/services/supabase';
```

---

## 🔧 **Common Tasks**

### **Adding a New Hook**

**If feature-specific**:
```bash
# Add to feature hooks directory
touch src/components/features/my-feature/hooks/useMyHook.ts

# Export from feature hooks index
# Add to src/components/features/my-feature/hooks/index.ts
export { useMyHook } from './useMyHook';
```

**If shared utility**:
```bash
# Add to shared hooks
touch src/hooks/shared/useMyUtility.ts

# Export from shared index
# Add to src/hooks/shared/index.ts
export { useMyUtility } from './useMyUtility';
```

### **Adding a Service**

```typescript
// src/services/my-feature.service.ts
import { myFeatureSupabase } from './supabase';

export const myFeatureService = {
  async getData() {
    return myFeatureSupabase.getData();
  },
  
  async createItem(data) {
    return myFeatureSupabase.create(data);
  },
};

// Export from services/index.ts
export { myFeatureService } from './my-feature.service';
```

### **Adding Types**

**Feature-specific types**:
```typescript
// src/components/features/my-feature/types.ts
export interface MyFeatureType {
  id: string;
  name: string;
}
```

**Global types**:
```typescript
// src/types/my-feature.ts
export interface GlobalMyFeatureType {
  // ...
}
```

---

## 🧪 **Testing**

### **Run Tests**

```bash
# All tests
npm run test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### **Test Location**

```
tests/
├── unit/              # Unit tests
│   └── features/      # Feature-specific tests
├── integration/       # Integration tests
└── e2e/              # End-to-end tests
```

---

## 🏃 **Running the Project**

### **Development**

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser to http://localhost:5173
```

### **Build**

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### **Lint**

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint:fix
```

---

## 📚 **Documentation**

### **Available Docs**

| Document | Purpose |
|----------|---------|
| `EXECUTIVE_SUMMARY.md` | High-level overview |
| `REFACTORING_JOURNEY_COMPLETE.md` | Complete refactoring story |
| `FEATURE_BASED_ARCHITECTURE_STRATEGY.md` | Architecture details |
| `services/README.md` | Service layer guide |
| `features/*/README.md` | Feature-specific docs |

### **Quick Reference**

- **Architecture questions**: See `EXECUTIVE_SUMMARY.md`
- **How to add features**: This guide (above)
- **Service layer**: `services/README.md`
- **Specific feature**: `features/<feature>/README.md`
- **Progress tracking**: `.cursor-updates`

---

## 🎨 **Code Style**

### **Components**

```typescript
// Use functional components with TypeScript
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};
```

### **Hooks**

```typescript
// Export custom hooks with 'use' prefix
export const useMyData = () => {
  const [data, setData] = useState(null);
  return { data, setData };
};
```

### **Types**

```typescript
// Use interfaces for object shapes
export interface MyType {
  id: string;
  name: string;
}

// Use type for unions/intersections
export type Status = 'active' | 'inactive';
```

---

## ⚡ **Performance Tips**

### **Import Optimization**

```typescript
// ✅ Good - specific imports
import { Button } from '@/components/common/buttons';

// ❌ Avoid - barrel imports from large directories
import { Button } from '@/components/common';
```

### **Code Splitting**

```typescript
// Use React.lazy for route-level splitting
const MyPage = React.lazy(() => import('./pages/MyPage'));
```

### **Memo Usage**

```typescript
// Memo expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});
```

---

## 🐛 **Debugging**

### **Build Errors**

```bash
# Clean and rebuild
npm run clean
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### **Import Errors**

1. Check file path is correct
2. Verify barrel export exists
3. Ensure TypeScript paths are configured

### **Hook Errors**

1. Check hook is exported from index
2. Verify import path matches structure
3. Ensure hook follows React rules

---

## 🤝 **Contributing**

### **Before You Start**

1. ✅ Read this guide
2. ✅ Check `EXECUTIVE_SUMMARY.md`
3. ✅ Look at existing features for patterns
4. ✅ Run tests locally

### **Making Changes**

1. Create feature branch
2. Follow existing patterns
3. Write/update tests
4. Update documentation
5. Run `npm run build` to verify
6. Submit PR with clear description

### **PR Checklist**

- [ ] Code follows existing patterns
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Build successful
- [ ] No TypeScript errors
- [ ] No breaking changes

---

## 🆘 **Getting Help**

### **Common Issues**

| Issue | Solution |
|-------|----------|
| Can't find component | Check feature domain in `features/` |
| Import not found | Verify barrel export in `index.ts` |
| Build fails | Run `npm run clean && npm run build` |
| Tests fail | Check test setup in `tests/setup/` |

### **Resources**

- **Architecture**: `/docs/EXECUTIVE_SUMMARY.md`
- **Services**: `/docs/services/README.md`
- **Progress**: `/.cursor-updates`
- **Feature docs**: `/docs/features/`

---

## 🎯 **Key Takeaways**

1. **Feature-first organization** - Find code by what it does
2. **Co-location** - Related code lives together
3. **Clear imports** - Use explicit, predictable paths
4. **Type safety** - TypeScript everywhere
5. **Documentation** - Keep docs updated

---

## 🚀 **You're Ready!**

You now understand the BookMe architecture and can start contributing! Remember:

- **Look for patterns** in existing features
- **Follow the structure** established
- **Ask questions** when unsure
- **Update docs** as you go

**Happy coding! 🎉**

---

**Last Updated**: October 28, 2025  
**Version**: Post-Phase 4 Refactoring  
**Build**: 5.71s, 0 errors ✅
