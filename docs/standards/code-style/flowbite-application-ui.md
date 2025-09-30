# Flowbite Application UI Components

Comprehensive guide for implementing Flowbite Pro Application UI components with TypeScript, React, and Next.js.

## Overview

Flowbite Application UI provides pre-built, production-ready components for complex web applications including dashboards, admin panels, e-commerce platforms, and SaaS applications.

### Installation

```bash
# Install Flowbite Pro
npm install flowbite-react flowbite
npm install @types/react @types/react-dom

# Install required dependencies
npm install react-icons lucide-react
npm install @headlessui/react @heroicons/react
```

### Configuration

```typescript
// tailwind.config.js
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flowbite-react/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'),
  ],
};

export default config;
```

## Application Layout Components

### Admin Dashboard Header
```typescript
import { Navbar, Avatar, Dropdown, Button, TextInput } from 'flowbite-react';
import { HiSearch, HiBell, HiCog, HiLogout, HiUser } from 'react-icons/hi';

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onSearch: (query: string) => void;
  onNotificationClick: () => void;
}

// ✅ Complete dashboard header with search and user menu
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onSearch,
  onNotificationClick
}) => {
  return (
    <Navbar
      fluid
      rounded={false}
      className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div className="flex items-center justify-between w-full">
        {/* Logo and Brand */}
        <Navbar.Brand href="/dashboard">
          <img
            src="/logo.svg"
            className="mr-3 h-6 sm:h-9"
            alt="Company Logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Dashboard
          </span>
        </Navbar.Brand>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <TextInput
              type="search"
              placeholder="Search..."
              className="pl-10"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button
            color="gray"
            size="sm"
            onClick={onNotificationClick}
            className="relative"
          >
            <HiBell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt={user.name}
                img={user.avatar}
                rounded
                size="sm"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium truncate">
                {user.name}
              </span>
              <span className="block text-sm text-gray-500 truncate">
                {user.email}
              </span>
            </Dropdown.Header>
            
            <Dropdown.Item icon={HiUser}>
              Profile
            </Dropdown.Item>
            <Dropdown.Item icon={HiCog}>
              Settings
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item icon={HiLogout}>
              Sign out
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
};
```

### Responsive Sidebar Navigation
```typescript
import { Sidebar, Badge } from 'flowbite-react';
import { 
  HiChartPie, 
  HiViewBoards, 
  HiInbox, 
  HiUser, 
  HiShoppingBag, 
  HiArrowSmRight,
  HiTable,
  HiSupport
} from 'react-icons/hi';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    color: 'info' | 'success' | 'warning' | 'failure';
  };
  children?: NavigationItem[];
}

// ✅ Multi-level sidebar with badges and collapsible sections
const AppSidebar: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed = false }) => {
  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: HiChartPie,
    },
    {
      label: 'Kanban',
      href: '/kanban',
      icon: HiViewBoards,
      badge: { text: 'Pro', color: 'info' }
    },
    {
      label: 'Inbox',
      href: '/inbox',
      icon: HiInbox,
      badge: { text: '4', color: 'failure' }
    },
    {
      label: 'Users',
      href: '/users',
      icon: HiUser,
      children: [
        { label: 'All Users', href: '/users', icon: HiUser },
        { label: 'Add User', href: '/users/add', icon: HiUser },
      ]
    },
    {
      label: 'Products',
      href: '/products',
      icon: HiShoppingBag,
      children: [
        { label: 'All Products', href: '/products', icon: HiShoppingBag },
        { label: 'Add Product', href: '/products/add', icon: HiShoppingBag },
      ]
    },
    {
      label: 'Sign In',
      href: '/auth/signin',
      icon: HiArrowSmRight,
    },
    {
      label: 'Sign Up',
      href: '/auth/signup',
      icon: HiTable,
    },
  ];

  return (
    <Sidebar
      aria-label="Application sidebar"
      collapsed={isCollapsed}
      className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
    >
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          {navigationItems.map((item) => (
            <div key={item.href}>
              {item.children ? (
                <Sidebar.Collapse icon={item.icon} label={item.label}>
                  {item.children.map((child) => (
                    <Sidebar.Item
                      key={child.href}
                      href={child.href}
                      icon={child.icon}
                    >
                      {child.label}
                    </Sidebar.Item>
                  ))}
                </Sidebar.Collapse>
              ) : (
                <Sidebar.Item
                  href={item.href}
                  icon={item.icon}
                  label={item.badge?.text}
                  labelColor={item.badge?.color}
                >
                  {item.label}
                </Sidebar.Item>
              )}
            </div>
          ))}
        </Sidebar.ItemGroup>
        
        <Sidebar.ItemGroup>
          <Sidebar.Item href="/help" icon={HiSupport}>
            Help
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};
```

## Dashboard Components

### Statistics Cards Grid
```typescript
import { Card, Button } from 'flowbite-react';
import { 
  HiTrendingUp, 
  HiTrendingDown, 
  HiUsers, 
  HiShoppingCart, 
  HiCurrencyDollar,
  HiEye
} from 'react-icons/hi';

interface StatisticCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

// ✅ Reusable statistic card component
const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  };

  return (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <div className="flex items-center mt-1">
            {change.type === 'increase' ? (
              <HiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <HiTrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.value}%
            </span>
            <span className="text-sm text-gray-500 ml-1">
              {change.period}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ✅ Dashboard statistics grid
const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: { value: 20.1, type: 'increase' as const, period: 'from last month' },
      icon: HiCurrencyDollar,
      color: 'blue' as const,
    },
    {
      title: 'Active Users',
      value: 2350,
      change: { value: 180.1, type: 'increase' as const, period: 'from last month' },
      icon: HiUsers,
      color: 'green' as const,
    },
    {
      title: 'Sales',
      value: 12234,
      change: { value: 19, type: 'increase' as const, period: 'from last month' },
      icon: HiShoppingCart,
      color: 'yellow' as const,
    },
    {
      title: 'Page Views',
      value: 573,
      change: { value: 5.2, type: 'decrease' as const, period: 'from last week' },
      icon: HiEye,
      color: 'purple' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <StatisticCard key={index} {...stat} />
      ))}
    </div>
  );
};
```

### Advanced Data Table
```typescript
import { Table, Badge, Button, Dropdown, Checkbox, TextInput } from 'flowbite-react';
import { HiDotsVertical, HiSearch, HiDownload, HiPlus } from 'react-icons/hi';
import { useState, useMemo } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  avatar: string;
}

interface DataTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onBulkAction: (action: string, userIds: string[]) => void;
}

// ✅ Advanced data table with sorting, filtering, and bulk actions
const UsersDataTable: React.FC<DataTableProps> = ({
  users,
  onEdit,
  onDelete,
  onBulkAction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [users, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredAndSortedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const statusConfig = {
      active: { color: 'success' as const, text: 'Active' },
      inactive: { color: 'failure' as const, text: 'Inactive' },
      pending: { color: 'warning' as const, text: 'Pending' },
    };
    
    const config = statusConfig[status];
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Table Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiSearch className="w-4 h-4 text-gray-500" />
            </div>
            <TextInput
              type="search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {selectedUsers.length > 0 && (
            <Dropdown label={`Actions (${selectedUsers.length})`} size="sm">
              <Dropdown.Item onClick={() => onBulkAction('activate', selectedUsers)}>
                Activate Users
              </Dropdown.Item>
              <Dropdown.Item onClick={() => onBulkAction('deactivate', selectedUsers)}>
                Deactivate Users
              </Dropdown.Item>
              <Dropdown.Item onClick={() => onBulkAction('delete', selectedUsers)}>
                Delete Users
              </Dropdown.Item>
            </Dropdown>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" color="gray">
            <HiDownload className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <HiPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell className="p-4">
              <Checkbox
                checked={selectedUsers.length === filteredAndSortedUsers.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </Table.HeadCell>
            <Table.HeadCell 
              className="cursor-pointer"
              onClick={() => handleSort('name')}
            >
              Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Table.HeadCell>
            <Table.HeadCell 
              className="cursor-pointer"
              onClick={() => handleSort('email')}
            >
              Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Table.HeadCell>
            <Table.HeadCell>Role</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell 
              className="cursor-pointer"
              onClick={() => handleSort('lastLogin')}
            >
              Last Login {sortField === 'lastLogin' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filteredAndSortedUsers.map((user) => (
              <Table.Row key={user.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell className="p-4">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                  />
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{user.name}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>
                  <Badge color="info">{user.role}</Badge>
                </Table.Cell>
                <Table.Cell>{getStatusBadge(user.status)}</Table.Cell>
                <Table.Cell>{user.lastLogin}</Table.Cell>
                <Table.Cell>
                  <Dropdown
                    arrowIcon={false}
                    inline
                    label={<HiDotsVertical className="w-4 h-4" />}
                  >
                    <Dropdown.Item onClick={() => onEdit(user)}>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => onDelete(user.id)}>
                      Delete
                    </Dropdown.Item>
                  </Dropdown>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};
```