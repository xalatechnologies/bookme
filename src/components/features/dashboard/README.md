# Dashboard Domain

Dashboard features for both admin and user views.

## Structure

```
dashboard/
├── admin/              # Admin dashboard components
│   ├── ApprovalQueue.tsx
│   ├── DailyTasks.tsx
│   ├── KPICard.tsx
│   ├── RecentEvents.tsx
│   ├── SystemAlerts.tsx
│   ├── TodaysBookings.tsx
│   ├── TrendCard.tsx
│   └── index.ts
├── user/               # User dashboard components
│   ├── ActivityFeed.tsx
│   ├── BookingFilters.tsx
│   ├── BookingList.tsx
│   ├── HeroBanner.tsx
│   ├── HeroSection.tsx
│   ├── QuickActions.tsx
│   ├── SystemMessageFilters.tsx
│   ├── SystemMessages.tsx
│   └── index.ts
├── hooks/              # Dashboard hooks
├── types.ts            # Dashboard types
├── constants.ts        # Config, i18n, RBAC, design
├── index.ts            # Barrel export
└── README.md           # This file
```

## Key Features

### Admin Dashboard
- **KPI Cards**: Key metrics (bookings, revenue, users)
- **Trend Visualization**: Charts and graphs
- **Approval Queue**: Pending bookings/requests
- **System Alerts**: Important notifications
- **Recent Activity**: Latest events

### User Dashboard
- **Hero Section**: Welcome banner
- **My Bookings**: Personal booking list
- **Quick Actions**: Common tasks
- **Activity Feed**: User activity history
- **System Messages**: Notifications

## Usage Examples

### Admin Dashboard
```tsx
import { KPICard, TrendCard, ApprovalQueue } from '@/components/features/dashboard/admin';

<KPICard
  label="Total Bookings"
  value={1234}
  change={12}
  trend="up"
/>
```

### User Dashboard
```tsx
import { QuickActions, BookingList } from '@/components/features/dashboard/user';

<QuickActions />
<BookingList bookings={myBookings} />
```

### Permissions
```tsx
import { hasDashboardPermission } from '@/components/features/dashboard';

if (hasDashboardPermission(user.roles, 'VIEW_ADMIN_DASHBOARD')) {
  // Show admin dashboard
}
```

## Localization

Namespaces:
- `dashboard` - Main namespace
- Keys: `DASHBOARD_I18N_KEYS.ADMIN.*`, `DASHBOARD_I18N_KEYS.USER.*`

## RBAC

Permissions:
- `VIEW_USER_DASHBOARD` - All users
- `VIEW_ADMIN_DASHBOARD` - Facility managers & admins
- `VIEW_ANALYTICS` - Facility managers & admins
- `EXPORT_DATA` - Facility managers & admins
