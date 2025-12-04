# Component Reusability Analysis & Design System

**Generated**: 2025-10-28  
**Focus**: Identifying duplicated patterns and creating reusable components

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Duplicated Patterns Found](#duplicated-patterns-found)
3. [Reusable Components to Create](#reusable-components-to-create)
4. [Component API Design](#component-api-design)
5. [Migration Strategy](#migration-strategy)
6. [Benefits & Impact](#benefits--impact)

---

## Executive Summary

### Critical Findings

🔴 **Major Duplication Issues:**
- **Status Badge**: Implemented 10+ times across different files
- **Filter Components**: 8 different implementations
- **Form Fields**: 30+ repetitive patterns
- **Card Layouts**: 25+ variations of same pattern
- **Modal Dialogs**: Inconsistent implementations
- **Loading States**: Different patterns in each file

### Opportunity

By creating **15 highly reusable components**, we can:
- ✅ Reduce codebase by ~3,000 lines
- ✅ Ensure consistent UI/UX
- ✅ Simplify maintenance
- ✅ Speed up development

---

## Duplicated Patterns Found

### 1. Status Badge (10+ duplications) 🔴 **CRITICAL**

**Found in:**
1. `BookingsPage.tsx` (line 330)
2. `UserReceipts.tsx` (line 236)
3. `BookingList.tsx` (line 79)
4. `BookingCard/index.tsx` (line 27)
5. `RecurringBookingCard.tsx` (line 29, 48)
6. `IntegrationsPage.tsx` (line 97)
7. `ReportsPage.tsx` (line 142)
8. `UsersRolesPage.tsx` (line 540)
9. `ApprovalsPage.tsx` (estimated)
10. `SupportTicketList.tsx` (estimated)

**Current Pattern:**
```typescript
// ❌ Duplicated in every file
const getStatusBadge = (status: string): JSX.Element => {
  const statusConfig = {
    paid: { 
      label: "Betalt", 
      className: "bg-green-100 text-green-800",
      icon: CheckCircle
    },
    pending: { 
      label: "Venter", 
      className: "bg-yellow-100 text-yellow-800",
      icon: Clock
    },
    // ... same logic everywhere
  };
  
  return (
    <Badge className={statusConfig[status].className}>
      <Icon className="h-3 w-3" />
      {statusConfig[status].label}
    </Badge>
  );
};
```

**Impact:** ~400 lines of duplicated code

---

### 2. Filter Components (8+ duplications)

**Found in:**
- `BookingFiltersBar.tsx`
- `FacilityFilters.tsx`
- `UserFilters.tsx`
- `SearchFilters.tsx`
- Repeated in multiple admin pages

**Common Pattern:**
```typescript
// ❌ Same structure everywhere
<div className="filters-container">
  <Select>
    <SelectTrigger>Status</SelectTrigger>
    <SelectContent>
      {/* Hardcoded options */}
    </SelectContent>
  </Select>
  
  <Select>
    <SelectTrigger>Type</SelectTrigger>
    {/* Same pattern */}
  </Select>
  
  <Button onClick={clearFilters}>Clear</Button>
</div>
```

**Impact:** ~800 lines of duplicated code

---

### 3. Form Field Wrapper (30+ duplications)

**Pattern:**
```typescript
// ❌ Repeated 30+ times
<div className="form-field">
  <label className="block text-sm font-medium">
    {label}
    {required && <span className="text-red-500">*</span>}
  </label>
  <Input {...props} />
  {error && <p className="text-sm text-red-500">{error}</p>}
</div>
```

**Impact:** ~600 lines of duplicated code

---

### 4. Card Layout (25+ variations)

**Pattern:**
```typescript
// ❌ Similar structure everywhere
<Card>
  <CardHeader>
    <div className="flex justify-between">
      <CardTitle>{title}</CardTitle>
      <Badge>{status}</Badge>
    </div>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Impact:** ~1,000 lines of duplicated code

---

### 5. Data Table (6+ duplications)

**Found in:**
- `BookingsPage.tsx`
- `UsersRolesPage.tsx`
- `FacilitiesPage.tsx`
- `ReportsPage.tsx`
- etc.

**Pattern:**
```typescript
// ❌ Table structure repeated everywhere
<table>
  <thead>
    <tr>
      {/* Headers */}
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id}>
        {/* Columns */}
      </tr>
    ))}
  </tbody>
</table>
```

**Impact:** ~800 lines of duplicated code

---

### 6. Empty State (15+ duplications)

**Pattern:**
```typescript
// ❌ Same empty state everywhere
{items.length === 0 && (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 mx-auto text-gray-400" />
    <p className="text-gray-500">No items found</p>
    <Button onClick={onCreate}>Create New</Button>
  </div>
)}
```

**Impact:** ~300 lines

---

### 7. Loading Skeleton (12+ duplications)

**Pattern:**
```typescript
// ❌ Different implementations everywhere
{loading && (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
  </div>
)}
```

**Impact:** ~200 lines

---

## Reusable Components to Create

### Component Library Structure

```
src/components/common/
├── status/
│   ├── StatusBadge.tsx        ⭐ Priority 1
│   └── index.ts
├── filters/
│   ├── FilterBar.tsx          ⭐ Priority 2
│   ├── FilterSelect.tsx
│   └── index.ts
├── forms/
│   ├── FormField.tsx          ⭐ Priority 3
│   ├── FormSection.tsx
│   └── index.ts
├── cards/
│   ├── DataCard.tsx           ⭐ Priority 4
│   ├── StatCard.tsx
│   └── index.ts
├── tables/
│   ├── DataTable.tsx          ⭐ Priority 5
│   └── index.ts
├── states/
│   ├── EmptyState.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   └── index.ts
└── feedback/
    ├── Toast.tsx
    ├── ConfirmDialog.tsx
    └── index.ts
```

---

## Component API Design

### 1. StatusBadge Component ⭐ **Priority 1**

```typescript
// src/components/common/status/StatusBadge.tsx

import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'pending';

interface StatusConfig {
  readonly variant: StatusVariant;
  readonly label?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly showIcon?: boolean;
  readonly size?: 'sm' | 'md' | 'lg';
}

export interface StatusBadgeProps {
  readonly status: string;
  readonly translationKey?: string;
  readonly variant?: StatusVariant;
  readonly showIcon?: boolean;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const defaultStatusConfig: Record<string, StatusConfig> = {
  // Booking statuses
  approved: { variant: 'success', icon: CheckCircle },
  pending: { variant: 'warning', icon: Clock },
  rejected: { variant: 'error', icon: XCircle },
  cancelled: { variant: 'error', icon: XCircle },
  
  // Payment statuses
  paid: { variant: 'success', icon: CheckCircle },
  unpaid: { variant: 'warning', icon: AlertCircle },
  refunded: { variant: 'info', icon: CheckCircle },
  
  // General statuses
  active: { variant: 'success', icon: CheckCircle },
  inactive: { variant: 'error', icon: XCircle },
  processing: { variant: 'warning', icon: Clock },
  completed: { variant: 'success', icon: CheckCircle },
};

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

const iconSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  translationKey,
  variant,
  showIcon = true,
  size = 'sm',
  className = '',
}) => {
  const { t } = useTranslation('common');
  
  const config = defaultStatusConfig[status.toLowerCase()] || {
    variant: 'info',
    icon: AlertCircle,
  };
  
  const finalVariant = variant || config.variant;
  const Icon = config.icon;
  const label = translationKey 
    ? t(translationKey) 
    : t(`statuses.${status.toLowerCase()}`, status);
  
  return (
    <Badge className={`${variantStyles[finalVariant]} ${className}`}>
      {showIcon && Icon && (
        <Icon className={`${iconSizes[size]} mr-1`} />
      )}
      {label}
    </Badge>
  );
};

// Convenience exports for common use cases
export const BookingStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <StatusBadge status={status} translationKey={`bookings.statuses.${status}`} />
);

export const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <StatusBadge status={status} translationKey={`payments.statuses.${status}`} />
);

export const UserStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <StatusBadge status={status} translationKey={`users.statuses.${status}`} />
);
```

**Usage:**
```typescript
// Simple usage
<StatusBadge status="approved" />

// With custom variant
<StatusBadge status="custom" variant="success" />

// Domain-specific
<BookingStatusBadge status="pending" />
<PaymentStatusBadge status="paid" />

// Custom translation
<StatusBadge 
  status="processing" 
  translationKey="custom.my_status"
  showIcon={false}
  size="lg"
/>
```

---

### 2. FilterBar Component ⭐ **Priority 2**

```typescript
// src/components/common/filters/FilterBar.tsx

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';

export interface FilterConfig {
  readonly id: string;
  readonly type: 'select' | 'date' | 'search' | 'multi-select';
  readonly label: string;
  readonly options?: readonly { value: string; label: string }[];
  readonly value: any;
  readonly onChange: (value: any) => void;
  readonly placeholder?: string;
}

export interface FilterBarProps {
  readonly filters: readonly FilterConfig[];
  readonly onClear?: () => void;
  readonly showFilterIcon?: boolean;
  readonly className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onClear,
  showFilterIcon = true,
  className = '',
}) => {
  const { t } = useTranslation('common');
  
  const hasActiveFilters = filters.some(f => f.value !== '' && f.value !== null);
  
  return (
    <div className={`flex flex-wrap gap-4 items-center ${className}`}>
      {showFilterIcon && (
        <Filter className="h-5 w-5 text-gray-400" />
      )}
      
      {filters.map(filter => (
        <div key={filter.id} className="flex-shrink-0">
          {filter.type === 'select' && (
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.placeholder || filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {filter.type === 'search' && (
            <Input
              placeholder={filter.placeholder || filter.label}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-[200px]"
            />
          )}
          
          {/* Add more filter types as needed */}
        </div>
      ))}
      
      {hasActiveFilters && onClear && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-gray-600"
        >
          <X className="h-4 w-4 mr-1" />
          {t('filters.clear')}
        </Button>
      )}
    </div>
  );
};
```

**Usage:**
```typescript
const filters: FilterConfig[] = [
  {
    id: 'status',
    type: 'select',
    label: t('filters.status'),
    options: [
      { value: 'all', label: t('filters.all') },
      { value: 'active', label: t('statuses.active') },
      { value: 'inactive', label: t('statuses.inactive') },
    ],
    value: filterStatus,
    onChange: setFilterStatus,
  },
  {
    id: 'search',
    type: 'search',
    label: t('common.search'),
    value: searchQuery,
    onChange: setSearchQuery,
    placeholder: t('placeholders.search'),
  },
];

<FilterBar 
  filters={filters} 
  onClear={handleClearFilters}
/>
```

---

### 3. FormField Component ⭐ **Priority 3**

```typescript
// src/components/common/forms/FormField.tsx

import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  readonly name: string;
  readonly label: string;
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea';
  readonly value: string | number;
  readonly onChange: (value: string | number) => void;
  readonly error?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly helperText?: string;
  readonly rows?: number; // for textarea
  readonly className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  helperText,
  rows = 4,
  className = '',
}) => {
  const { t } = useTranslation('common');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
  };
  
  const InputComponent = type === 'textarea' ? Textarea : Input;
  const inputProps = type === 'textarea' ? { rows } : { type };
  
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <InputComponent
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={error ? 'border-red-500' : ''}
        {...inputProps}
      />
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};
```

**Usage:**
```typescript
<FormField
  name="email"
  label={t('forms.email')}
  type="email"
  value={formData.email}
  onChange={(value) => setFormData({ ...formData, email: value })}
  error={errors.email}
  required
  placeholder="user@example.com"
/>
```

---

### 4. DataCard Component ⭐ **Priority 4**

```typescript
// src/components/common/cards/DataCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface CardAction {
  readonly label: string;
  readonly onClick: () => void;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly variant?: 'default' | 'destructive';
}

export interface DataCardProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly status?: React.ReactNode;
  readonly actions?: readonly CardAction[];
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly className?: string;
  readonly onClick?: () => void;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  subtitle,
  status,
  actions,
  children,
  footer,
  className = '',
  onClick,
}) => {
  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {status}
            
            {actions && actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      className={action.variant === 'destructive' ? 'text-red-600' : ''}
                    >
                      {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>{children}</CardContent>
      
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t">
          {footer}
        </div>
      )}
    </Card>
  );
};
```

**Usage:**
```typescript
<DataCard
  title={booking.facility}
  subtitle={formatDate(booking.date)}
  status={<BookingStatusBadge status={booking.status} />}
  actions={[
    { label: 'View', onClick: () => handleView(booking.id), icon: Eye },
    { label: 'Edit', onClick: () => handleEdit(booking.id), icon: Edit },
    { label: 'Delete', onClick: () => handleDelete(booking.id), icon: Trash, variant: 'destructive' },
  ]}
  onClick={() => handleCardClick(booking.id)}
>
  <div className="space-y-2">
    <p>Duration: {booking.duration}</p>
    <p>Price: {formatPrice(booking.price)}</p>
  </div>
</DataCard>
```

---

### 5. DataTable Component ⭐ **Priority 5**

```typescript
// src/components/common/tables/DataTable.tsx

import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ColumnDef<T> {
  readonly id: string;
  readonly header: string;
  readonly accessor: (row: T) => React.ReactNode;
  readonly sortable?: boolean;
  readonly width?: string;
  readonly align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  readonly data: readonly T[];
  readonly columns: readonly ColumnDef<T>[];
  readonly onRowClick?: (row: T) => void;
  readonly selectable?: boolean;
  readonly selectedRows?: readonly string[];
  readonly onSelectionChange?: (ids: readonly string[]) => void;
  readonly getRowId?: (row: T) => string;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly onSort?: (column: string) => void;
  readonly loading?: boolean;
  readonly emptyMessage?: string;
  readonly className?: string;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row: any) => row.id,
  sortBy,
  sortOrder = 'asc',
  onSort,
  loading = false,
  emptyMessage,
  className = '',
}: DataTableProps<T>) {
  const { t } = useTranslation('common');
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(data.map(getRowId));
    } else {
      onSelectionChange?.([]);
    }
  };
  
  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, rowId]);
    } else {
      onSelectionChange?.(selectedRows.filter(id => id !== rowId));
    }
  };
  
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {selectable && (
              <th className="px-4 py-3 w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </th>
            )}
            
            {columns.map(column => (
              <th
                key={column.id}
                className={`px-4 py-3 text-${column.align || 'left'} ${column.width || ''}`}
              >
                {column.sortable && onSort ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSort(column.id)}
                    className="font-semibold"
                  >
                    {column.header}
                    {sortBy === column.id && (
                      sortOrder === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> :
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <span className="font-semibold">{column.header}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8">
                <div className="animate-pulse">Loading...</div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8 text-gray-500">
                {emptyMessage || t('table.empty')}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const rowId = getRowId(row);
              const isSelected = selectedRows.includes(rowId);
              
              return (
                <tr
                  key={rowId}
                  className={`border-t hover:bg-gray-50 dark:hover:bg-gray-800 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(rowId, checked as boolean)}
                      />
                    </td>
                  )}
                  
                  {columns.map(column => (
                    <td
                      key={column.id}
                      className={`px-4 py-3 text-${column.align || 'left'}`}
                    >
                      {column.accessor(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
```

**Usage:**
```typescript
const columns: ColumnDef<IBooking>[] = [
  {
    id: 'facility',
    header: t('table.facility'),
    accessor: (row) => row.facility,
    sortable: true,
  },
  {
    id: 'date',
    header: t('table.date'),
    accessor: (row) => formatDate(row.date),
    sortable: true,
  },
  {
    id: 'status',
    header: t('table.status'),
    accessor: (row) => <BookingStatusBadge status={row.status} />,
    align: 'center',
  },
  {
    id: 'price',
    header: t('table.price'),
    accessor: (row) => formatPrice(row.price),
    align: 'right',
  },
];

<DataTable
  data={bookings}
  columns={columns}
  onRowClick={handleRowClick}
  selectable
  selectedRows={selected}
  onSelectionChange={setSelected}
  sortBy={sortColumn}
  sortOrder={sortOrder}
  onSort={handleSort}
  loading={isLoading}
/>
```

---

## Migration Strategy

### Phase 1: Create Core Components (Week 1)

**Priority Order:**
1. ✅ StatusBadge - Replace 10+ instances
2. ✅ FilterBar - Replace 8+ instances
3. ✅ FormField - Replace 30+ instances
4. ✅ DataCard - Replace 25+ instances
5. ✅ DataTable - Replace 6+ instances

**Estimated Time:** 20 hours

### Phase 2: Migrate Existing Code (Week 2)

**Strategy:**
- Migrate file by file
- Test after each migration
- Update imports progressively

**Order:**
1. Start with pages (easier to test)
2. Then feature components
3. Finally common components

**Estimated Time:** 30 hours

### Phase 3: Create Additional Components (Week 3)

- EmptyState
- LoadingState
- ErrorState
- ConfirmDialog
- Toast notifications

**Estimated Time:** 15 hours

---

## Benefits & Impact

### Code Reduction

| Component | Files Affected | Lines Saved |
|-----------|---------------|-------------|
| StatusBadge | 10+ | ~400 |
| FilterBar | 8+ | ~800 |
| FormField | 30+ | ~600 |
| DataCard | 25+ | ~1,000 |
| DataTable | 6+ | ~800 |
| **Total** | **79+** | **~3,600** |

### Maintenance Impact

**Before:**
- Fix a bug → Update 10+ files
- Change styling → Update 25+ files
- Add feature → Copy-paste & modify

**After:**
- Fix a bug → Update 1 file ✅
- Change styling → Update 1 file ✅
- Add feature → Extend component API ✅

### Consistency Impact

- ✅ All status badges look identical
- ✅ All filters behave the same
- ✅ All forms have same validation style
- ✅ All cards have same interaction patterns
- ✅ All tables have same features

### Development Speed

**New feature requiring:**
- Status display
- Filters
- Form
- Table

**Before:** 4 hours (build from scratch)  
**After:** 30 minutes (compose components) ✅

---

## Next Steps

1. **Review & Approve** this plan
2. **Create components** in priority order
3. **Migrate existing code** file by file
4. **Test thoroughly** after each migration
5. **Document usage** with examples
6. **Train team** on new components

---

**Status**: 📋 Ready for Implementation  
**Estimated Effort**: 65 hours total (~2 weeks full-time)  
**Impact**: Reduce codebase by ~3,600 lines, improve consistency, speed up development

