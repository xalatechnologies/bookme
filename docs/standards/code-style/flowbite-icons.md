# Flowbite Icons

Comprehensive guide for implementing Flowbite Icons with React Icons, Heroicons, and Lucide React for consistent iconography.

## Overview

Flowbite Icons provides a curated collection of SVG icons optimized for web applications, with support for multiple icon libraries and consistent styling patterns.

### Installation

```bash
# Primary icon libraries
npm install react-icons
npm install @heroicons/react
npm install lucide-react

# Flowbite integration
npm install flowbite-react flowbite
```

### Configuration

```typescript
// Icon library imports
import { 
  HiHome, 
  HiUser, 
  HiCog, 
  HiMail,
  HiSearch,
  HiBell 
} from 'react-icons/hi';

import { 
  HomeIcon, 
  UserIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';

import { 
  Home, 
  User, 
  Settings,
  Mail,
  Search,
  Bell
} from 'lucide-react';
```

## Icon Usage Patterns

### Button Icons
```typescript
import { Button } from 'flowbite-react';
import { HiDownload, HiPlus, HiTrash, HiPencil } from 'react-icons/hi';

// ✅ Icons in buttons with consistent sizing
const IconButtons: React.FC = () => {
  return (
    <div className="flex space-x-4">
      {/* Primary action with icon */}
      <Button>
        <HiPlus className="w-4 h-4 mr-2" />
        Add Item
      </Button>
      
      {/* Secondary action */}
      <Button color="gray">
        <HiDownload className="w-4 h-4 mr-2" />
        Download
      </Button>
      
      {/* Icon-only buttons */}
      <Button size="sm" color="gray">
        <HiPencil className="w-4 h-4" />
      </Button>
      
      <Button size="sm" color="failure">
        <HiTrash className="w-4 h-4" />
      </Button>
    </div>
  );
};
```

### Navigation Icons
```typescript
import { Sidebar, Navbar } from 'flowbite-react';
import { 
  HiChartPie, 
  HiViewBoards, 
  HiInbox, 
  HiUser, 
  HiShoppingBag,
  HiCog,
  HiLogout
} from 'react-icons/hi';

// ✅ Sidebar navigation with icons
const NavigationWithIcons: React.FC = () => {
  return (
    <Sidebar>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item href="/dashboard" icon={HiChartPie}>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item href="/kanban" icon={HiViewBoards}>
            Kanban
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={HiInbox}>
            Inbox
          </Sidebar.Item>
          <Sidebar.Item href="/users" icon={HiUser}>
            Users
          </Sidebar.Item>
          <Sidebar.Item href="/products" icon={HiShoppingBag}>
            Products
          </Sidebar.Item>
        </Sidebar.ItemGroup>
        
        <Sidebar.ItemGroup>
          <Sidebar.Item href="/settings" icon={HiCog}>
            Settings
          </Sidebar.Item>
          <Sidebar.Item href="/logout" icon={HiLogout}>
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};
```

### Form Icons
```typescript
import { TextInput, Label, Select } from 'flowbite-react';
import { HiMail, HiLockClosed, HiSearch, HiCalendar } from 'react-icons/hi';

// ✅ Form inputs with icons
const FormWithIcons: React.FC = () => {
  return (
    <form className="space-y-4">
      {/* Email input with icon */}
      <div>
        <Label htmlFor="email" value="Email" />
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <HiMail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <TextInput
            id="email"
            type="email"
            placeholder="name@company.com"
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Password input with icon */}
      <div>
        <Label htmlFor="password" value="Password" />
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <HiLockClosed className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <TextInput
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Search input */}
      <div>
        <Label htmlFor="search" value="Search" />
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <HiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <TextInput
            id="search"
            type="search"
            placeholder="Search..."
            className="pl-10"
          />
        </div>
      </div>
    </form>
  );
};
```

### Status Icons
```typescript
import { Badge, Alert } from 'flowbite-react';
import { 
  HiCheckCircle, 
  HiXCircle, 
  HiExclamationTriangle, 
  HiInformationCircle,
  HiClock
} from 'react-icons/hi';

// ✅ Status indicators with icons
const StatusIndicators: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Status badges */}
      <div className="flex space-x-2">
        <Badge color="success" icon={HiCheckCircle}>
          Active
        </Badge>
        <Badge color="failure" icon={HiXCircle}>
          Inactive
        </Badge>
        <Badge color="warning" icon={HiClock}>
          Pending
        </Badge>
        <Badge color="info" icon={HiInformationCircle}>
          Draft
        </Badge>
      </div>
      
      {/* Alert messages */}
      <div className="space-y-2">
        <Alert color="success" icon={HiCheckCircle}>
          Your changes have been saved successfully.
        </Alert>
        
        <Alert color="failure" icon={HiXCircle}>
          There was an error processing your request.
        </Alert>
        
        <Alert color="warning" icon={HiExclamationTriangle}>
          Please review your information before submitting.
        </Alert>
        
        <Alert color="info" icon={HiInformationCircle}>
          This feature is currently in beta.
        </Alert>
      </div>
    </div>
  );
};
```

## Icon Library Comparison

### React Icons (Heroicons v1)
```typescript
import { 
  HiHome,           // Solid version
  HiOutlineHome,    // Outline version
  HiUser,
  HiOutlineUser,
  HiCog,
  HiOutlineCog
} from 'react-icons/hi';

// ✅ Consistent sizing and styling
<HiHome className="w-5 h-5 text-gray-600" />
<HiOutlineHome className="w-5 h-5 text-gray-600" />
```

### Heroicons v2
```typescript
import { 
  HomeIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';

import { 
  HomeIcon as HomeSolid,
  UserIcon as UserSolid,
  CogIcon as CogSolid
} from '@heroicons/react/24/solid';

// ✅ Modern Heroicons v2 usage
<HomeIcon className="w-6 h-6 text-gray-600" />
<HomeSolid className="w-6 h-6 text-blue-600" />
```

### Lucide React
```typescript
import { 
  Home,
  User,
  Settings,
  Mail,
  Search,
  Bell,
  ChevronDown
} from 'lucide-react';

// ✅ Lucide icons with consistent styling
<Home className="w-5 h-5 text-gray-600" />
<User className="w-5 h-5 text-gray-600" />
<Settings className="w-5 h-5 text-gray-600" />
```

## Icon Sizing Standards

### Size Guidelines
```typescript
// ✅ Consistent icon sizes
const IconSizes = {
  xs: 'w-3 h-3',      // 12px - Small badges, indicators
  sm: 'w-4 h-4',      // 16px - Form inputs, small buttons
  base: 'w-5 h-5',    // 20px - Default size, navigation
  lg: 'w-6 h-6',      // 24px - Headers, large buttons
  xl: 'w-8 h-8',      // 32px - Feature icons, avatars
  '2xl': 'w-10 h-10', // 40px - Hero sections, large features
};

// ✅ Usage examples
<HiUser className="w-4 h-4" />  {/* Small */}
<HiUser className="w-5 h-5" />  {/* Default */}
<HiUser className="w-6 h-6" />  {/* Large */}
```

### Contextual Sizing
```typescript
// ✅ Context-appropriate icon sizes
const ContextualIcons: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Small context - form inputs */}
      <div className="flex items-center space-x-2">
        <HiMail className="w-4 h-4 text-gray-400" />
        <span className="text-sm">Email notifications</span>
      </div>
      
      {/* Medium context - navigation */}
      <div className="flex items-center space-x-3">
        <HiHome className="w-5 h-5 text-gray-600" />
        <span className="text-base">Dashboard</span>
      </div>
      
      {/* Large context - feature highlights */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <HiShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Security First</h3>
          <p className="text-gray-600">Enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
};
```

## Interactive Icons

### Hover States
```typescript
import { useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';

// ✅ Interactive icon with hover states
const InteractiveIcon: React.FC = () => {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <button
      onClick={() => setIsLiked(!isLiked)}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {isLiked ? (
        <HiHeart className="w-5 h-5 text-red-500" />
      ) : (
        <HiOutlineHeart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
      )}
    </button>
  );
};
```

### Loading States
```typescript
import { Spinner } from 'flowbite-react';
import { HiRefresh } from 'react-icons/hi';

// ✅ Icon with loading state
const RefreshButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };
  
  return (
    <Button onClick={handleRefresh} disabled={isLoading}>
      {isLoading ? (
        <Spinner size="sm" className="mr-2" />
      ) : (
        <HiRefresh className="w-4 h-4 mr-2" />
      )}
      Refresh
    </Button>
  );
};
```

## Best Practices

### Icon Selection
```typescript
// ✅ Use semantic icons
const SemanticIcons = {
  // Actions
  create: HiPlus,
  edit: HiPencil,
  delete: HiTrash,
  save: HiCheck,
  cancel: HiX,
  
  // Navigation
  home: HiHome,
  back: HiArrowLeft,
  forward: HiArrowRight,
  up: HiArrowUp,
  down: HiArrowDown,
  
  // Status
  success: HiCheckCircle,
  error: HiXCircle,
  warning: HiExclamationTriangle,
  info: HiInformationCircle,
  
  // Content
  search: HiSearch,
  filter: HiFilter,
  sort: HiSortAscending,
  view: HiEye,
  hide: HiEyeOff,
};
```

### Accessibility
```typescript
// ✅ Accessible icon usage
const AccessibleIcons: React.FC = () => {
  return (
    <div>
      {/* Decorative icons - hidden from screen readers */}
      <button className="flex items-center space-x-2">
        <HiUser className="w-4 h-4" aria-hidden="true" />
        <span>User Profile</span>
      </button>
      
      {/* Functional icons - with labels */}
      <button aria-label="Delete item">
        <HiTrash className="w-4 h-4" />
      </button>
      
      {/* Icons with tooltips */}
      <button title="Refresh data" aria-label="Refresh data">
        <HiRefresh className="w-4 h-4" />
      </button>
    </div>
  );
};
```

### Performance
```typescript
// ✅ Optimize icon imports
// Import only needed icons
import { HiHome, HiUser, HiCog } from 'react-icons/hi';

// ❌ Avoid importing entire libraries
// import * as HeroIcons from 'react-icons/hi';

// ✅ Create icon components for reuse
const IconButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
    aria-label={label}
  >
    <Icon className="w-5 h-5" />
  </button>
);
```