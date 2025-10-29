# Messaging Feature Domain

Complete feature domain for messaging and communication.

## Overview

The messaging domain handles:
- User-to-user messaging
- Thread management
- Message inbox
- Real-time notifications

## Architecture

```
src/components/features/messaging/
├── components/
│   ├── MessageInbox/
│   ├── MessageThread/
│   └── CreateThreadModal/
├── hooks/
│   └── index.ts
├── types.ts                 # Message types
├── constants.ts             # Complete constants (105 lines)
├── index.ts                 # Barrel export
└── README.md                # This file
```

## Quick Start

```typescript
import {
  // Components
  MessageInbox,
  MessageThread,
  
  // Types
  MessageStatus,
  IThread,
  
  // Constants
  MESSAGE_STATUS,
  MESSAGING_I18N_KEYS,
  MESSAGING_PERMISSIONS,
  hasMessagingPermission
} from '@/components/features/messaging';
```

## Constants (105 lines)

- **Business Logic**: MESSAGE_STATUS, THREAD_STATUS
- **Localization**: I18N_NAMESPACE, MESSAGING_I18N_KEYS
- **RBAC**: MESSAGING_PERMISSIONS, hasMessagingPermission()
- **Design**: MESSAGING_DESIGN (thread items, messages)
- **Animations**: MESSAGING_ANIMATIONS
- **Performance**: MESSAGING_PERFORMANCE (cache, debounce)
