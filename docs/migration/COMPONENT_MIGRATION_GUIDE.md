# Component Migration Guide: From Direct Store Access to Feature Hooks

**Version:** 1.0
**Date:** 2025-10-30
**Status:** Template for Phase 4+ Migrations

## Purpose

This guide provides step-by-step instructions for migrating components from direct Zustand store access to using feature hooks, following clean architecture principles.

## When to Use This Guide

✅ **Use when:**
- Component directly imports and uses Zustand stores
- Business logic is mixed into component code
- Component has complex filtering/validation logic
- Preparing for React Query integration

❌ **Don't use when:**
- Component only accesses simple UI state (consider `useState`)
- Store access is minimal (1-2 simple lookups)
- Feature hook doesn't exist yet (create it first)

## Prerequisites

Before migrating a component, ensure:
1. ✅ Feature hook exists for the domain (`useGroupManagement`, `useMessageManagement`, etc.)
2. ✅ Feature hook is documented and tested
3. ✅ You understand the component's current store usage
4. ✅ Data source strategy is decided (props vs. React Query)

## Migration Approaches

### Approach A: Props-Based Migration (Phase 4)
**When to use:** React Query not yet integrated
**Timeline:** Quick (1-2 hours per component)
**Requires:** Parent component provides data

### Approach B: Hook-Fetches Migration (Phase 6+)
**When to use:** After React Query integration
**Timeline:** Medium (2-4 hours per component)
**Requires:** React Query API hooks created

---

## Approach A: Props-Based Migration (Current Phase)

### Step 1: Analyze Current Component

**Checklist:**
- [ ] Identify all store imports
- [ ] List all store methods used
- [ ] Identify business logic in component
- [ ] Note UI state vs. data fetching
- [ ] Check for side effects

**Example Analysis:**
```typescript
// File: MessageInbox.tsx
// Store imports:
import { useMessageStore } from '@/stores/messageStore';

// Methods used:
const {
  getUserThreads,        // Data fetching
  getMessagesByThread,   // Data fetching
  updateThread,          // Mutation
  deleteThread,          // Mutation
  getAvailableParticipants // Data fetching
} = useMessageStore();

// Business logic in component:
const filtered = threads.filter(t =>
  searchQuery ? t.subject.includes(searchQuery) : true
);

// Identified issues:
// - Data fetching mixed with component
// - Filtering logic in component (should be in hook)
// - No loading/error states
```

### Step 2: Check Feature Hook Interface

Read the feature hook's TypeScript interface to see what it provides:

```typescript
// src/hooks/features/messages/useMessageManagement.ts
export interface IUseMessageManagementReturn {
  // Data
  readonly filteredMessages: readonly Message[]
  readonly threadedMessages: IThreadGrouping

  // Statistics
  readonly unreadCount: number

  // UI State
  readonly view: TMessageView
  readonly searchTerm: string

  // UI Actions
  readonly setSearchTerm: (term: string) => void

  // Business Operations
  readonly markMessagesAsRead: (userId, threadId?) => Message[]
  readonly canDeleteMessage: (message, userId) => PermissionResult
  readonly calculateThreadStats: (threadId) => ThreadStats
}
```

### Step 3: Plan Data Flow

**Before (Direct Store Access):**
```
Component
   ↓ calls
Store (getUserThreads)
   ↓ returns
Component (filters data)
   ↓ renders
UI
```

**After (Props-Based):**
```
Parent Component
   ↓ calls
Store (getUserThreads)
   ↓ passes as props
Child Component
   ↓ passes to hook
Feature Hook (filters data)
   ↓ returns filtered
Component
   ↓ renders
UI
```

### Step 4: Update Parent Component

Add data fetching to parent component:

```typescript
// Before: Parent didn't fetch data
function MessagingPage() {
  return <MessageInbox userId="current-user" />;
}

// After: Parent fetches and passes data
function MessagingPage() {
  // Temporarily keep store access at parent level
  const store = useMessageStore();
  const threads = store.getUserThreads("current-user");
  const messages = store.getAllMessages();

  return (
    <MessageInbox
      userId="current-user"
      threads={threads}
      messages={messages}
    />
  );
}
```

### Step 5: Update Child Component Interface

Add props for data, remove store import:

```typescript
// Before: Component fetched its own data
interface MessageInboxProps {
  readonly userId: string;
}

export const MessageInbox: React.FC<MessageInboxProps> = ({ userId }) => {
  const { getUserThreads, ... } = useMessageStore(); // ❌ Direct store access
  const threads = getUserThreads(userId);
  // ...
};

// After: Component receives data via props
interface MessageInboxProps {
  readonly userId: string;
  readonly threads: readonly MessageThread[];    // ✅ Data from props
  readonly messages: readonly Message[];         // ✅ Data from props
}

export const MessageInbox: React.FC<MessageInboxProps> = ({
  userId,
  threads,
  messages,
}) => {
  // No store import! ✅
  // ...
};
```

### Step 6: Integrate Feature Hook

Replace business logic with feature hook:

```typescript
// Before: Business logic in component
export const MessageInbox: React.FC<MessageInboxProps> = ({ userId, threads, messages }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // ❌ Filtering logic in component
  const filtered = threads.filter(t =>
    searchQuery ? t.subject.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  // ❌ Unread count calculation in component
  const unreadCount = messages.filter(m => !m.read && m.recipientId === userId).length;

  return <div>{/* ... */}</div>;
};

// After: Hook handles business logic
export const MessageInbox: React.FC<MessageInboxProps> = ({ userId, threads, messages }) => {
  // ✅ Feature hook provides filtered data and operations
  const {
    filteredMessages,
    threadedMessages,
    unreadCount,
    searchTerm,
    setSearchTerm,
    markMessagesAsRead,
    canDeleteMessage,
  } = useMessageManagement(messages, userId);

  // ✅ Clean presentation logic only
  return (
    <div>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search messages..."
      />
      <div>Unread: {unreadCount}</div>
      {/* Render threadedMessages */}
    </div>
  );
};
```

### Step 7: Test Component Behavior

**Testing Checklist:**
- [ ] Component renders without errors
- [ ] All existing functionality works
- [ ] Filtering/sorting works correctly
- [ ] Actions (delete, update) work
- [ ] Performance is unchanged or improved
- [ ] TypeScript compiles without errors
- [ ] No console warnings

**Test Script:**
```bash
# Run TypeScript compiler
npm run tsc --noEmit

# Run tests
npm run test MessageInbox

# Start dev server and manual test
npm run dev
```

### Step 8: Cleanup

Remove unused imports and code:

```typescript
// Before: Unused store import
import { useMessageStore } from '@/stores/messageStore'; // ❌ Remove
import { useMessageManagement } from '@/hooks/features/messages'; // ✅ Keep

// Before: Unused local state
const [searchQuery, setSearchQuery] = useState(""); // ❌ Remove (hook provides this)

// Before: Business logic functions
const filterThreads = (threads, query) => { ... }; // ❌ Remove (hook handles this)
```

---

## Approach B: Hook-Fetches Migration (Phase 6+)

**Prerequisites:**
- ✅ React Query is integrated
- ✅ API hooks are created (`useThreadsQuery`, `useMessagesQuery`)
- ✅ Feature hooks updated to fetch internally

### Step 1: Update Feature Hook to Fetch Data

```typescript
// Before: Hook accepts data as parameter
export const useMessageManagement = (messages: Message[], userId: string) => {
  // Hook works with provided data
  const filtered = useMemo(() => filterMessages(messages, userId), [messages, userId]);
  return { filteredMessages: filtered };
};

// After: Hook fetches data internally with React Query
export const useMessageManagement = (userId: string) => {
  // Hook fetches its own data
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['messages', userId],
    queryFn: () => fetchMessages(userId),
    staleTime: 5 * 60 * 1000,
  });

  // Business logic remains the same
  const filtered = useMemo(() => filterMessages(messages, userId), [messages, userId]);

  return {
    filteredMessages: filtered,
    isLoading,
    error,
  };
};
```

### Step 2: Simplify Component

```typescript
// Before (Approach A): Component receives data via props
export const MessageInbox: React.FC<{ userId: string; threads: Thread[]; messages: Message[]; }> = ({
  userId,
  threads,
  messages,
}) => {
  const { filteredMessages } = useMessageManagement(messages, userId);
  return <div>{/* ... */}</div>;
};

// After (Approach B): Component only passes userId
export const MessageInbox: React.FC<{ userId: string; }> = ({ userId }) => {
  const {
    filteredMessages,
    isLoading,
    error,
  } = useMessageManagement(userId); // Hook fetches data internally!

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* ... */}</div>;
};
```

### Step 3: Remove Parent Data Fetching

```typescript
// Before (Approach A): Parent fetched and passed data
function MessagingPage() {
  const store = useMessageStore();
  const threads = store.getUserThreads("current-user");

  return <MessageInbox threads={threads} userId="current-user" />;
}

// After (Approach B): Parent just renders component
function MessagingPage() {
  return <MessageInbox userId="current-user" />;
}
```

**Benefits:**
- ✅ Simpler component tree
- ✅ No prop drilling
- ✅ Better loading/error states
- ✅ Automatic caching and revalidation
- ✅ Components completely decoupled from stores

---

## Complete Migration Example

### Before Migration

```typescript
// MessageInbox.tsx - BEFORE
import { useMessageStore } from '@/stores/messageStore';

interface MessageInboxProps {
  readonly userId: string;
}

export const MessageInbox: React.FC<MessageInboxProps> = ({ userId }) => {
  // ❌ Direct store access
  const { getUserThreads, getMessagesByThread, deleteThread } = useMessageStore();

  // ❌ Component fetches data
  const threads = getUserThreads(userId);

  // ❌ Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // ❌ Business logic in component
  const filteredThreads = threads.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // ❌ More business logic
  const unreadCount = threads.reduce((count, thread) => {
    const messages = getMessagesByThread(thread.id);
    return count + messages.filter(m => !m.read && m.recipientId === userId).length;
  }, 0);

  const handleDeleteThread = (threadId: string) => {
    deleteThread(threadId);
  };

  return (
    <div>
      <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      <div>Unread: {unreadCount}</div>
      {filteredThreads.map(thread => (
        <div key={thread.id}>
          {thread.subject}
          <button onClick={() => handleDeleteThread(thread.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

**Issues:**
- 🔴 Tight coupling to store implementation
- 🔴 Business logic mixed with presentation
- 🔴 Hard to test
- 🔴 No loading states
- 🔴 Performance concerns (unreadCount recalculated on every render)

### After Migration (Approach A)

```typescript
// MessagingPage.tsx - Parent component (temporary)
import { useMessageStore } from '@/stores/messageStore';

export const MessagingPage = () => {
  const store = useMessageStore();
  const threads = store.getUserThreads("current-user");
  const messages = store.getAllMessages();

  return (
    <MessageInbox
      userId="current-user"
      threads={threads}
      messages={messages}
    />
  );
};

// MessageInbox.tsx - AFTER (Approach A)
import { useMessageManagement } from '@/hooks/features/messages';

interface MessageInboxProps {
  readonly userId: string;
  readonly threads: readonly MessageThread[];
  readonly messages: readonly Message[];
}

export const MessageInbox: React.FC<MessageInboxProps> = ({
  userId,
  threads,
  messages,
}) => {
  // ✅ Feature hook provides all business logic
  const {
    filteredMessages,
    threadedMessages,
    unreadCount,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    markMessagesAsRead,
    canDeleteMessage,
  } = useMessageManagement(messages, userId);

  const handleDeleteThread = (threadId: string) => {
    // Business logic moved to hook
    if (!canDeleteMessage(threadId, userId)) {
      alert("Cannot delete this message");
      return;
    }
    // Delete via mutation
  };

  // ✅ Clean presentation logic
  return (
    <div>
      <Input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="resolved">Resolved</SelectItem>
      </Select>
      <div>Unread: {unreadCount}</div>
      {Object.entries(threadedMessages).map(([threadId, messages]) => (
        <div key={threadId}>
          {messages.map(message => (
            <div key={message.id}>{message.content}</div>
          ))}
          <button onClick={() => handleDeleteThread(threadId)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Business logic in hook (testable)
- ✅ Presentation logic in component
- ✅ Performance optimized (memoization in hook)
- ✅ Easier to maintain
- ✅ Ready for React Query migration

### After Migration (Approach B - Future)

```typescript
// MessageInbox.tsx - AFTER (Approach B with React Query)
import { useMessageManagement } from '@/hooks/features/messages';

interface MessageInboxProps {
  readonly userId: string;
}

export const MessageInbox: React.FC<MessageInboxProps> = ({ userId }) => {
  // ✅ Hook fetches data internally
  const {
    filteredMessages,
    threadedMessages,
    unreadCount,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    markMessagesAsRead,
    canDeleteMessage,
    deleteMessage,
  } = useMessageManagement(userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const handleDeleteThread = async (threadId: string) => {
    if (!canDeleteMessage(threadId, userId)) {
      alert("Cannot delete this message");
      return;
    }
    await deleteMessage.mutateAsync(threadId);
  };

  // ✅ Same clean presentation logic
  return (
    <div>
      <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      <div>Unread: {unreadCount}</div>
      {/* ... render logic ... */}
    </div>
  );
};

// MessagingPage.tsx - Parent simplified!
export const MessagingPage = () => {
  return <MessageInbox userId="current-user" />;
};
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Missing Data Dependencies

**Problem:**
```typescript
// Hook doesn't receive all needed data
const { filtered } = useMessageManagement(messages); // Missing userId!
```

**Solution:**
```typescript
// Pass all required parameters
const { filtered } = useMessageManagement(messages, userId);
```

### Pitfall 2: Breaking Parent-Child Contract

**Problem:**
```typescript
// Parent expects component to handle data fetching
<MessageInbox userId="123" /> // No data passed!
```

**Solution:**
```typescript
// Parent provides all required data
<MessageInbox userId="123" threads={threads} messages={messages} />
```

### Pitfall 3: Duplicating State

**Problem:**
```typescript
// Component creates local state when hook provides it
const { searchTerm } = useMessageManagement(...);
const [localSearch, setLocalSearch] = useState(""); // ❌ Duplicate!
```

**Solution:**
```typescript
// Use hook's state management
const { searchTerm, setSearchTerm } = useMessageManagement(...);
// Use searchTerm and setSearchTerm directly
```

### Pitfall 4: Over-Fetching Data

**Problem:**
```typescript
// Parent fetches everything, even if not needed
const allData = store.getAllData(); // Fetches 10,000 records
<Component data={allData} />
```

**Solution:**
```typescript
// Parent fetches only what's needed
const relevantData = store.getDataForUser(userId);
<Component data={relevantData} />
```

### Pitfall 5: Forgetting TypeScript Types

**Problem:**
```typescript
interface Props {
  data: any; // ❌ Loses type safety
}
```

**Solution:**
```typescript
interface Props {
  readonly data: readonly Message[]; // ✅ Full type safety
}
```

---

## Testing Strategy

### Unit Testing Feature Hooks

```typescript
import { renderHook } from '@testing-library/react';
import { useMessageManagement } from './useMessageManagement';

describe('useMessageManagement', () => {
  const mockMessages = [
    { id: '1', subject: 'Test', content: 'Hello', read: false },
    { id: '2', subject: 'Another', content: 'World', read: true },
  ];

  it('filters messages by search term', () => {
    const { result } = renderHook(() => useMessageManagement(mockMessages, 'user-1'));

    act(() => {
      result.current.setSearchTerm('Test');
    });

    expect(result.current.filteredMessages).toHaveLength(1);
    expect(result.current.filteredMessages[0].subject).toBe('Test');
  });

  it('calculates unread count correctly', () => {
    const { result } = renderHook(() => useMessageManagement(mockMessages, 'user-1'));

    expect(result.current.unreadCount).toBe(1);
  });
});
```

### Integration Testing Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageInbox } from './MessageInbox';

describe('MessageInbox', () => {
  const mockThreads = [...];
  const mockMessages = [...];

  it('displays threads correctly', () => {
    render(<MessageInbox userId="user-1" threads={mockThreads} messages={mockMessages} />);

    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  it('filters threads when searching', () => {
    render(<MessageInbox userId="user-1" threads={mockThreads} messages={mockMessages} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    expect(screen.queryByText('Another Subject')).not.toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });
});
```

---

## Migration Checklist

### Pre-Migration
- [ ] Feature hook exists and is documented
- [ ] Component's store usage is analyzed
- [ ] Migration approach selected (A or B)
- [ ] Tests written for current behavior
- [ ] Git branch created for migration

### During Migration
- [ ] Parent component updated (if Approach A)
- [ ] Component interface updated with new props
- [ ] Store imports removed from component
- [ ] Feature hook integrated
- [ ] Business logic moved to hook
- [ ] Presentation logic remains in component
- [ ] TypeScript types are correct
- [ ] All tests pass

### Post-Migration
- [ ] Component behavior verified manually
- [ ] Performance benchmarked (no regression)
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Migration logged in tracking document
- [ ] PR created and merged

---

## Success Metrics

### Code Quality
- ✅ Component LOC reduced by 30-50%
- ✅ Business logic in hooks (not components)
- ✅ No direct store imports in components
- ✅ TypeScript strict mode passes

### Performance
- ✅ Re-render count unchanged or reduced
- ✅ Bundle size unchanged or reduced
- ✅ No new performance warnings

### Maintainability
- ✅ Easier to test (mock hooks)
- ✅ Easier to change data source
- ✅ Consistent patterns across codebase

---

## Next Steps After Migration

1. **Track Progress**: Update migration status in tracking document
2. **Share Learnings**: Document any issues or improvements discovered
3. **Plan Next Migration**: Select next component from priority list
4. **Consider Optimization**: After 5-10 migrations, review for patterns

---

## Support

**Questions?** Check these resources:
- `FEATURE_HOOKS_SUMMARY.md` - Hook documentation
- `COMPONENT_STORE_USAGE_AUDIT.md` - Component analysis
- `PHASE_4_PROGRESS_REPORT.md` - Migration strategy

**Found a better pattern?** Update this guide and share with the team!

---

**Last Updated:** 2025-10-30
**Version:** 1.0
**Next Review:** After 5 component migrations
