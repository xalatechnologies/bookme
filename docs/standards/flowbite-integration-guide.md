# Flowbite Integration Guide for MediaHub

## 🎯 Overview

This document provides comprehensive guidelines for integrating Flowbite components, Flowbite React, Flowbite Blocks, and Flowbite Application UI patterns into the MediaHub project. All developers MUST follow these standards to ensure consistency and maintainability.

## 📦 Required Dependencies

### Primary Dependencies (MANDATORY)

```json
{
  "dependencies": {
    "flowbite": "^2.2.0",
    "flowbite-react": "^0.7.2",
    "flowbite-react-next": "^1.1.0"
  }
}
```

### Extended Dependencies (RECOMMENDED)

```json
{
  "dependencies": {
    "@flowbite/application-ui": "^1.0.0",
    "@flowbite/blocks": "^1.0.0", 
    "@flowbite/pro-components": "^1.0.0"
  }
}
```

## 🏗️ Architecture Integration

### Next.js Configuration

**File: `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';
import flowbite from 'flowbite-react/tailwind';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        // Use Flowbite color palette only
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
  darkMode: 'class',
};

export default config;
```

### Root Layout Integration

**File: `src/app/layout.tsx`**

```typescript
import { Flowbite } from 'flowbite-react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import type { CustomFlowbiteTheme } from 'flowbite-react';

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      primary: "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800",
      secondary: "text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700",
    }
  },
  navbar: {
    root: {
      base: "bg-white px-2 py-2.5 dark:bg-gray-900 sm:px-4 border-gray-200 dark:border-gray-700",
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Flowbite theme={{ theme: customTheme }}>
            {children}
          </Flowbite>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## 🧩 Component Implementation Standards

### 1. Basic Components

#### Button Implementation

```typescript
// src/components/ui/ActionButton.tsx
import React from 'react';
import { Button } from 'flowbite-react';
import type { ButtonProps as FlowbiteButtonProps } from 'flowbite-react';

interface ActionButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  readonly size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly disabled?: boolean;
}

const colorMap = {
  primary: 'blue',
  secondary: 'gray', 
  success: 'green',
  danger: 'red',
  warning: 'yellow'
} as const;

export const ActionButton = ({
  children,
  variant = 'primary',
  size = 'base',
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
}: ActionButtonProps): JSX.Element => {
  return (
    <Button
      color={colorMap[variant]}
      size={size}
      isProcessing={loading}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      className={fullWidth ? 'w-full' : ''}
    >
      {children}
    </Button>
  );
};
```

#### Form Components

```typescript
// src/components/ui/FormField.tsx
import React from 'react';
import { Label, TextInput, Textarea, Select, Checkbox } from 'flowbite-react';

interface BaseFieldProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly error?: string;
  readonly helpText?: string;
}

interface TextFieldProps extends BaseFieldProps {
  readonly type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly autoComplete?: string;
}

export const TextField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  autoComplete,
}: TextFieldProps): JSX.Element => {
  return (
    <div className="space-y-2">
      <div className="block">
        <Label htmlFor={id} value={label} />
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <TextInput
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        color={error ? 'failure' : 'gray'}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${id}-help`} className="text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
};
```

### 2. Navigation Components

#### Main Navigation

```typescript
// src/components/layout/MainNavigation.tsx
import React from 'react';
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle, DarkThemeToggle } from 'flowbite-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  readonly label: string;
  readonly href: string;
  readonly icon?: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Projects', href: '/projects' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Settings', href: '/settings' },
];

export const MainNavigation = (): JSX.Element => {
  const pathname = usePathname();

  return (
    <Navbar fluid rounded className="border-b border-gray-200 dark:border-gray-700">
      <NavbarBrand as={Link} href="/">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          MediaHub
        </span>
      </NavbarBrand>
      
      <div className="flex md:order-2">
        <DarkThemeToggle />
        <NavbarToggle />
      </div>
      
      <NavbarCollapse>
        {navigationItems.map((item) => (
          <NavbarLink
            key={item.href}
            as={Link}
            href={item.href}
            active={pathname === item.href}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </NavbarLink>
        ))}
      </NavbarCollapse>
    </Navbar>
  );
};
```

#### Sidebar Navigation

```typescript
// src/components/layout/Sidebar.tsx
import React from 'react';
import { Sidebar as FlowbiteSidebar } from 'flowbite-react';
import { HiChartPie, HiInbox, HiUser, HiViewBoards } from 'react-icons/hi';

export const Sidebar = (): JSX.Element => {
  return (
    <FlowbiteSidebar aria-label="Default sidebar example">
      <FlowbiteSidebar.Items>
        <FlowbiteSidebar.ItemGroup>
          <FlowbiteSidebar.Item href="/dashboard" icon={HiChartPie}>
            Dashboard
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item href="/projects" icon={HiViewBoards}>
            Projects
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item href="/inbox" icon={HiInbox}>
            Inbox
          </FlowbiteSidebar.Item>
          <FlowbiteSidebar.Item href="/profile" icon={HiUser}>
            Profile
          </FlowbiteSidebar.Item>
        </FlowbiteSidebar.ItemGroup>
      </FlowbiteSidebar.Items>
    </FlowbiteSidebar>
  );
};
```

### 3. Data Display Components

#### Data Table

```typescript
// src/components/ui/DataTable.tsx
import React from 'react';
import { Table, Badge, Button } from 'flowbite-react';

interface Column<T> {
  readonly key: keyof T;
  readonly label: string;
  readonly render?: (value: T[keyof T], item: T) => React.ReactNode;
  readonly sortable?: boolean;
}

interface DataTableProps<T> {
  readonly data: T[];
  readonly columns: Column<T>[];
  readonly loading?: boolean;
  readonly emptyState?: React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyState,
}: DataTableProps<T>): JSX.Element {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyState || (
          <div>
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <Table.Head>
          {columns.map((column) => (
            <Table.HeadCell key={String(column.key)}>
              {column.label}
            </Table.HeadCell>
          ))}
        </Table.Head>
        <Table.Body className="divide-y">
          {data.map((item, index) => (
            <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              {columns.map((column) => (
                <Table.Cell key={String(column.key)}>
                  {column.render 
                    ? column.render(item[column.key], item)
                    : String(item[column.key])
                  }
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
```

## 🎨 Flowbite Blocks Integration

### Hero Section

```typescript
// src/components/blocks/HeroSection.tsx
import React from 'react';
import { Button } from 'flowbite-react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  readonly title: string;
  readonly subtitle: string;
  readonly primaryAction: {
    readonly label: string;
    readonly href: string;
  };
  readonly secondaryAction?: {
    readonly label: string;
    readonly href: string;
  };
}

export const HeroSection = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
}: HeroSectionProps): JSX.Element => {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          {title}
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
          {subtitle}
        </p>
        <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Button 
            as="a"
            href={primaryAction.href}
            size="lg"
            color="blue"
            className="inline-flex items-center justify-center"
          >
            {primaryAction.label}
            <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
          </Button>
          {secondaryAction && (
            <Button 
              as="a"
              href={secondaryAction.href}
              size="lg"
              color="gray"
              outline
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
```

### Feature Grid

```typescript
// src/components/blocks/FeatureGrid.tsx
import React from 'react';
import { Card } from 'flowbite-react';

interface Feature {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
}

interface FeatureGridProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly features: Feature[];
}

export const FeatureGrid = ({
  title,
  subtitle,
  features,
}: FeatureGridProps): JSX.Element => {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="max-w-screen-md mb-8 lg:mb-16">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-500 sm:text-xl dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
          {features.map((feature, index) => (
            <Card key={index} className="max-w-sm">
              <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
```

## 🌙 Dark Mode Implementation

### Theme Provider Setup

```typescript
// src/components/theme/ThemeProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeProviderContext = createContext<ThemeProviderContextValue | undefined>(undefined);

export const useTheme = (): ThemeProviderContextValue => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  readonly children: React.ReactNode;
  readonly defaultTheme?: Theme;
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps): JSX.Element => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    let resolved: 'dark' | 'light';
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }
    
    setResolvedTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
```

## 📱 Responsive Design Patterns

### Layout Components

```typescript
// src/components/layout/ResponsiveContainer.tsx
import React from 'react';

interface ResponsiveContainerProps {
  readonly children: React.ReactNode;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  readonly padding?: boolean;
}

const sizeClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md', 
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: 'max-w-full'
};

export const ResponsiveContainer = ({
  children,
  size = 'xl',
  padding = true,
}: ResponsiveContainerProps): JSX.Element => {
  return (
    <div className={`
      mx-auto w-full
      ${sizeClasses[size]}
      ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
    `}>
      {children}
    </div>
  );
};
```

### Grid System

```typescript
// src/components/layout/ResponsiveGrid.tsx
import React from 'react';

interface ResponsiveGridProps {
  readonly children: React.ReactNode;
  readonly cols?: {
    readonly base?: number;
    readonly sm?: number;
    readonly md?: number;
    readonly lg?: number;
    readonly xl?: number;
  };
  readonly gap?: number;
}

export const ResponsiveGrid = ({
  children,
  cols = { base: 1, md: 2, lg: 3 },
  gap = 6,
}: ResponsiveGridProps): JSX.Element => {
  const gridClasses = [
    `grid`,
    `gap-${gap}`,
    cols.base && `grid-cols-${cols.base}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`, 
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};
```

## 🔍 Best Practices Summary

### ✅ DO's

1. **Always use Flowbite React components first**
2. **Follow the component selection hierarchy**
3. **Use Flowbite theme system for customization**
4. **Implement proper TypeScript interfaces**
5. **Include ARIA attributes for accessibility**
6. **Test dark mode compatibility**
7. **Ensure mobile-first responsive design**
8. **Use Flowbite color tokens consistently**

### ❌ DON'Ts

1. **Never create custom components when Flowbite exists**
2. **Don't mix with other UI libraries**
3. **Don't override Flowbite styles arbitrarily**
4. **Don't use non-Flowbite color schemes**
5. **Don't skip accessibility attributes**
6. **Don't ignore responsive breakpoints**
7. **Don't hardcode theme colors**
8. **Don't violate TypeScript strict typing**

## 🧪 Testing Components

### Unit Testing with Flowbite

```typescript
// src/components/ui/__tests__/ActionButton.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Flowbite } from 'flowbite-react';
import { ActionButton } from '../ActionButton';

const renderWithFlowbite = (component: React.ReactElement) => {
  return render(
    <Flowbite>
      {component}
    </Flowbite>
  );
};

describe('ActionButton', () => {
  it('renders with correct label', () => {
    renderWithFlowbite(
      <ActionButton onClick={() => {}}>
        Click me
      </ActionButton>
    );
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithFlowbite(
      <ActionButton onClick={handleClick}>
        Click me
      </ActionButton>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    renderWithFlowbite(
      <ActionButton loading onClick={() => {}}>
        Submit
      </ActionButton>
    );
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

This comprehensive guide ensures consistent, maintainable, and accessible Flowbite integration throughout the MediaHub application.