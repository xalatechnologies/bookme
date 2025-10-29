# Support Domain

Support ticket system features.

## Structure

```
support/
├── components/
│   ├── SupportTicketForm.tsx
│   └── SupportTicketList.tsx
├── hooks/
├── types.ts
├── constants.ts
├── index.ts
└── README.md
```

## Key Features

- Ticket creation
- Status tracking (open, in_progress, resolved, closed)
- Priority levels (low, medium, high, urgent)
- Category classification
- Ticket messaging/replies

## Usage

```tsx
import { SupportTicketForm, SupportTicketList } from '@/components/features/support';
import { hasSupportPermission, TICKET_STATUS } from '@/components/features/support';

if (hasSupportPermission(user.roles, 'VIEW_ALL_TICKETS')) {
  // Show all tickets
}
```

## Localization

Namespace: `support`
Keys: `SUPPORT_I18N_KEYS.STATUS.*`, `SUPPORT_I18N_KEYS.PRIORITY.*`

## RBAC

- `CREATE_TICKET` - All users
- `VIEW_ALL_TICKETS` - Facility managers & admins
- `ASSIGN_TICKETS` - Facility managers & admins
