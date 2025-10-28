# Groups Domain

Group booking and member management features.

## Structure

```
groups/
├── components/
│   ├── GroupInvitationModal.tsx
│   └── GroupMemberList.tsx
├── hooks/
├── types.ts
├── constants.ts
├── index.ts
└── README.md
```

## Key Features

- Group creation and management
- Member invitations
- Role-based permissions (owner, admin, member)
- Group bookings

## Usage

```tsx
import { GroupInvitationModal } from '@/components/features/groups';
import { hasGroupPermission } from '@/components/features/groups';
```
