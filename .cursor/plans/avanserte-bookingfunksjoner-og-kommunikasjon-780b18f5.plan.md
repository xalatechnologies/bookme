<!-- 780b18f5-3eeb-47ba-9c0a-e81724785fd0 717c307a-87be-4035-b1ed-27b20420d3cf -->
# Implementeringsplan: Avanserte Bookingfunksjoner, Kommunikasjon og Tilgjengelighet

## Fase 1: Avanserte Bookingfunksjoner

### 1.1 Gjentakende Bookinger - Datamodell

Opprett `src/types/recurringBooking.ts`:

```typescript
import { RecurrencePattern } from '@/utils/recurrenceEngine';

export interface RecurringBooking {
  readonly id: string;
  readonly userId: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly recurrencePattern: RecurrencePattern;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly timeSlots: readonly string[];
  readonly purpose: string;
  readonly attendees: number;
  readonly activityType: string;
  readonly actorType: 'private-person' | 'lag-foreninger' | 'paraply' | 'private-firma' | 'kommunale-enheter';
  readonly status: 'active' | 'paused' | 'cancelled';
  readonly occurrences: readonly {
    readonly id: string;
    readonly date: Date;
    readonly status: 'pending' | 'confirmed' | 'cancelled';
  }[];
  readonly pricing: {
    readonly basePrice: number;
    readonly totalPrice: number;
    readonly discount: number;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

### 1.2 Gjentakende Bookinger - Store

Opprett `src/stores/recurringBookingStore.ts`:

```typescript
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { RecurringBooking } from "@/types/recurringBooking";

interface RecurringBookingState {
  readonly bookings: readonly RecurringBooking[];
  readonly addBooking: (booking: Omit<RecurringBooking, 'id' | 'createdAt' | 'updatedAt'>) => string;
  readonly updateBooking: (id: string, updates: Partial<RecurringBooking>) => void;
  readonly cancelBooking: (id: string) => void;
  readonly pauseBooking: (id: string) => void;
  readonly resumeBooking: (id: string) => void;
  readonly cancelOccurrence: (bookingId: string, occurrenceId: string) => void;
  readonly getBookingById: (id: string) => RecurringBooking | undefined;
  readonly getUserBookings: (userId: string) => readonly RecurringBooking[];
}
```

Implementer full localStorage-basert logikk med CRUD-operasjoner.

### 1.3 Gjentakende Bookinger - UI Komponenter

Opprett `src/components/booking/RecurringBookingModal.tsx`:

- RecurrencePatternSelector (velg ukentlig, månedlig, custom)
- WeekdaySelector (velg dager i uken)
- TimeRangeSelector (start/slutt dato)
- OccurrencePreview (vis fremtidige bookinger)
- PricingSummary (totalsum med rabatter)

Opprett `src/components/booking/RecurringBookingCard.tsx`:

- Vis gjentakende booking med mønsterbeskrivelse
- Knapper: Pause, Gjenoppta, Avbryt serie, Endre
- Liste over kommende occurrences
- Status-badges

### 1.4 Gruppebookinger - Datamodell

Opprett `src/types/group.ts`:

```typescript
export interface BookingGroup {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly ownerId: string;
  readonly members: readonly {
    readonly userId: string;
    readonly name: string;
    readonly email: string;
    readonly role: 'owner' | 'admin' | 'member';
    readonly joinedAt: string;
  }[];
  readonly invitations: readonly {
    readonly email: string;
    readonly status: 'pending' | 'accepted' | 'declined';
    readonly invitedAt: string;
  }[];
  readonly bookings: readonly string[]; // booking IDs
  readonly createdAt: string;
}
```

### 1.5 Gruppebookinger - Store

Opprett `src/stores/groupStore.ts`:

```typescript
interface GroupState {
  readonly groups: readonly BookingGroup[];
  readonly createGroup: (group: Omit<BookingGroup, 'id' | 'createdAt'>) => string;
  readonly updateGroup: (id: string, updates: Partial<BookingGroup>) => void;
  readonly addMember: (groupId: string, userId: string, name: string, email: string) => void;
  readonly removeMember: (groupId: string, userId: string) => void;
  readonly inviteMember: (groupId: string, email: string) => void;
  readonly respondToInvitation: (groupId: string, email: string, response: 'accepted' | 'declined') => void;
  readonly getUserGroups: (userId: string) => readonly BookingGroup[];
}
```

### 1.6 Gruppebookinger - UI Komponenter

Opprett `src/components/group/GroupManagementCard.tsx`:

- Liste over alle grupper brukeren er medlem av
- Opprett ny gruppe-knapp
- Vis gruppens medlemmer og bookinger

Opprett `src/components/group/GroupInvitationModal.tsx`:

- Inviter medlemmer via e-post
- Vis ventende invitasjoner
- Administrer medlemsroller

Opprett `src/components/group/GroupBookingFlow.tsx`:

- Velg gruppe ved booking
- Vis kostnadsdeling mellom medlemmer
- Gruppefakturering-oversikt

## Fase 2: Kommunikasjon og Support

### 2.1 Meldingssystem - Datamodell

Opprett `src/types/message.ts`:

```typescript
export interface Message {
  readonly id: string;
  readonly threadId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly senderType: 'user' | 'admin';
  readonly recipientId: string;
  readonly recipientType: 'user' | 'admin';
  readonly content: string;
  readonly attachments?: readonly {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly base64Data: string;
    readonly size: number;
  }[];
  readonly status: 'sent' | 'delivered' | 'read';
  readonly createdAt: string;
  readonly readAt?: string;
}

export interface MessageThread {
  readonly id: string;
  readonly subject: string;
  readonly participants: readonly {
    readonly id: string;
    readonly name: string;
    readonly type: 'user' | 'admin';
  }[];
  readonly relatedBookingId?: string;
  readonly status: 'active' | 'resolved' | 'closed';
  readonly priority: 'low' | 'medium' | 'high';
  readonly messages: readonly string[]; // message IDs
  readonly lastMessageAt: string;
  readonly createdAt: string;
}
```

### 2.2 Meldingssystem - Store

Opprett `src/stores/messageStore.ts`:

```typescript
interface MessageState {
  readonly threads: readonly MessageThread[];
  readonly messages: readonly Message[];
  readonly createThread: (thread: Omit<MessageThread, 'id' | 'createdAt' | 'lastMessageAt'>) => string;
  readonly sendMessage: (message: Omit<Message, 'id' | 'createdAt' | 'status'>) => string;
  readonly markAsRead: (messageId: string) => void;
  readonly closeThread: (threadId: string) => void;
  readonly getUserThreads: (userId: string) => readonly MessageThread[];
  readonly getThreadMessages: (threadId: string) => readonly Message[];
}
```

### 2.3 Meldingssystem - UI Komponenter

Opprett `src/components/messaging/MessageInbox.tsx`:

- Liste over alle meldingstråder
- Søk og filtrering
- Status-badges (ulest, aktiv, løst)
- Prioritetsmarkering

Opprett `src/components/messaging/MessageThread.tsx`:

- Chat-lignende visning av meldinger
- Skriv ny melding med vedlegg
- Fil-opplasting (Base64-encoding)
- Status-indikatorer

Opprett `src/components/messaging/MessageComposer.tsx`:

- Ny melding-modal
- Velg mottaker (admin/bruker)
- Emne og innhold
- Vedlegg-håndtering

### 2.4 Support-system - Datamodell

Opprett `src/types/support.ts`:

```typescript
export interface SupportTicket {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly category: 'booking' | 'technical' | 'billing' | 'feedback' | 'other';
  readonly subject: string;
  readonly description: string;
  readonly status: 'open' | 'in-progress' | 'waiting-user' | 'resolved' | 'closed';
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly assignedTo?: string;
  readonly attachments?: readonly {
    readonly id: string;
    readonly name: string;
    readonly base64Data: string;
  }[];
  readonly replies: readonly {
    readonly id: string;
    readonly authorId: string;
    readonly authorName: string;
    readonly authorType: 'user' | 'admin';
    readonly content: string;
    readonly createdAt: string;
  }[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly resolvedAt?: string;
}
```

### 2.5 Support-system - Store

Opprett `src/stores/supportStore.ts`:

```typescript
interface SupportState {
  readonly tickets: readonly SupportTicket[];
  readonly createTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => string;
  readonly addReply: (ticketId: string, reply: Omit<SupportTicket['replies'][0], 'id' | 'createdAt'>) => void;
  readonly updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  readonly assignTicket: (ticketId: string, adminId: string) => void;
  readonly getUserTickets: (userId: string) => readonly SupportTicket[];
}
```

### 2.6 Support-system - UI Komponenter

Opprett `src/components/support/SupportTicketForm.tsx`:

- Kategori-velger
- Emne og beskrivelse
- Fil-opplasting
- Prioritets-valg

Opprett `src/components/support/TicketList.tsx`:

- Liste over alle tickets
- Filtrering etter status/kategori
- Søkefunksjonalitet

Opprett `src/components/support/TicketDetail.tsx`:

- Full ticket-visning
- Svar-funksjonalitet
- Status-oppdatering
- Vedlegg-visning

### 2.7 Varslinger - Datamodell

Opprett `src/types/notification.ts`:

```typescript
export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly type: 'booking' | 'message' | 'system' | 'payment' | 'reminder';
  readonly title: string;
  readonly content: string;
  readonly priority: 'low' | 'medium' | 'high';
  readonly read: boolean;
  readonly actionUrl?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: string;
  readonly readAt?: string;
}

export interface NotificationPreferences {
  readonly userId: string;
  readonly email: {
    readonly bookingConfirmation: boolean;
    readonly bookingReminder: boolean;
    readonly messages: boolean;
    readonly systemUpdates: boolean;
  };
  readonly browser: {
    readonly enabled: boolean;
    readonly bookingReminder: boolean;
    readonly messages: boolean;
  };
}
```

### 2.8 Varslinger - Store og Komponenter

Opprett `src/stores/notificationStore.ts` med CRUD-operasjoner.

Opprett `src/components/notifications/NotificationCenter.tsx`:

- Dropdown med uleste notifikasjoner
- Marker alle som lest
- Filtrer etter type

Opprett `src/components/notifications/NotificationPreferences.tsx`:

- Varslingsinnstillinger
- Per kategori on/off toggles
- Browser-tillatelse-håndtering

## Fase 3: Tilgjengelighet og UX

### 3.1 WCAG 2.2 AA Compliance

Oppdater alle eksisterende komponenter med:

**ARIA-attributter i `src/components/ui/` komponenter:**

- `role`, `aria-label`, `aria-labelledby`
- `aria-describedby` for hjelpetekster
- `aria-expanded`, `aria-controls` for dropdowns
- `aria-live` for dynamisk innhold

**Tastaturnavigasjon:**

- Tab-indekser på alle interaktive elementer
- Escape-key for lukking av modaler
- Arrow keys for listenavigasjon
- Enter/Space for aktivering

**Fokusmarkering:**

Opprett `src/styles/accessibility.css`:

```css
*:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
  border-radius: 4px;
}

.skip-to-main {
  position: absolute;
  left: -9999px;
  z-index: 999;
}

.skip-to-main:focus {
  left: 50%;
  transform: translateX(-50%);
  top: 10px;
}
```

**Kontrast og farger:**

- Minimum 4.5:1 kontrast for normal tekst
- Minimum 3:1 for store tekster
- Oppdater Tailwind-farger i `tailwind.config.ts`

### 3.2 Progressive Web App (PWA)

Opprett `public/manifest.json`:

```json
{
  "name": "BookMe - Lokalebookingssystem",
  "short_name": "BookMe",
  "description": "Book og administrer lokaler enkelt",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Opprett `public/service-worker.js`:

```javascript
const CACHE_NAME = 'bookme-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### 3.3 Offline-støtte

Opprett `src/utils/offlineStorage.ts`:

```typescript
export class OfflineStorage {
  private static readonly OFFLINE_QUEUE_KEY = 'offline_actions_queue';

  static queueAction(action: {
    type: string;
    data: unknown;
    timestamp: string;
  }): void {
    const queue = this.getQueue();
    queue.push(action);
    localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }

  static getQueue(): Array<unknown> {
    const stored = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static clearQueue(): void {
    localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
  }
}
```

Opprett `src/hooks/useOfflineStatus.ts`:

```typescript
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync offline actions
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};
```

### 3.4 Touch-optimalisering

Opprett `src/styles/touch.css`:

```css
@media (hover: none) and (pointer: coarse) {
  button, a, .clickable {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }

  .touch-feedback:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
```

### 3.5 Skjermleserstøtte

Opprett `src/components/accessibility/ScreenReaderOnly.tsx`:

```typescript
export const ScreenReaderOnly = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);
```

Legg til i alle komponenter:

- Beskrivende aria-labels
- Live regions for dynamiske oppdateringer
- Skip-links for navigasjon

## Fase 4: Integrasjon og Testing

### 4.1 Integrasjon med eksisterende bookingflow

Oppdater `src/pages/facilities/[id]/book.tsx`:

- Legg til "Gjentakende booking"-toggle
- Integrer RecurringBookingModal
- Integrer GroupBookingFlow

Oppdater `src/pages/Checkout.tsx`:

- Støtte for gjentakende bookinger
- Støtte for gruppebookinger
- Vis totalpris for hele serien

### 4.2 Brukerside-integrasjon

Oppdater `src/pages/user/Bookings.tsx`:

- Egen tab for gjentakende bookinger
- Vis gruppebookinger
- Lenke til meldingssenter

Opprett `src/pages/user/Messages.tsx`:

- Full meldingsinbox
- Integrasjon med MessageInbox-komponent

Opprett `src/pages/user/Support.tsx`:

- Support-ticket oversikt
- Opprett ny ticket

### 4.3 Admin-side integrasjon

Oppdater `src/pages/admin/BookingsPage.tsx`:

- Vis gjentakende bookinger
- Administrer gruppebookinger
- Lenke til meldinger

Opprett `src/pages/admin/Messages.tsx`:

- Admin meldingsinbox
- Svar på brukermeldinger

Opprett `src/pages/admin/Support.tsx`:

- Ticket-administrasjon
- Tilordne tickets
- Endre status

### 4.4 Testing og Validering

For hver ny funksjon:

1. Test localStorage CRUD-operasjoner
2. Test UI-interaksjoner
3. Test tastaturnavigasjon
4. Test med skjermleser (NVDA/JAWS)
5. Test på mobil (touch)
6. Test offline-funksjonalitet
7. Valider WCAG-compliance med axe DevTools

## Tekniske Krav

Alle implementeringer må følge:

- TypeScript strict mode
- Readonly interfaces
- Explicit return types
- shadcn/ui komponenter
- Tailwind CSS mobile-first
- Dark mode support
- WCAG 2.2 AA compliance
- localStorage som datalagring
- React Toastify for notifikasjoner
- Lucide React for ikoner

### To-dos

- [ ] Opprett datamodell for gjentakende bookinger (RecurringBooking type og RecurringBookingStore)
- [ ] Implementer UI-komponenter for gjentakende bookinger (Modal, Card, Selector)
- [ ] Opprett datamodell for gruppebookinger (BookingGroup type og GroupStore)
- [ ] Implementer UI-komponenter for gruppebookinger (Management, Invitation, Flow)
- [ ] Opprett datamodell for meldingssystem (Message, MessageThread types og MessageStore)
- [ ] Implementer UI-komponenter for meldingssystem (Inbox, Thread, Composer)
- [ ] Opprett datamodell for support-system (SupportTicket type og SupportStore)
- [ ] Implementer UI-komponenter for support (TicketForm, TicketList, TicketDetail)
- [ ] Implementer varslingssystem med preferences (Notification types, store, og UI)
- [ ] Implementer WCAG 2.2 AA compliance (ARIA, tastatur, fokus, kontrast)
- [ ] Sett opp Progressive Web App (manifest.json, service worker, ikoner)
- [ ] Implementer offline-støtte (OfflineStorage, useOfflineStatus hook, synkronisering)
- [ ] Implementer touch-optimalisering (touch.css, minimum berøringsområder)
- [ ] Forbedre skjermleserstøtte (ScreenReaderOnly component, live regions, skip links)
- [ ] Integrer nye funksjoner i eksisterende bookingflow
- [ ] Integrer i brukersider (Messages, Support, oppdater Bookings)
- [ ] Integrer i admin-sider (Messages, Support, oppdater BookingsPage)
- [ ] Test og valider alle nye funksjoner (localStorage, UI, tastatur, skjermleser, mobil, offline, WCAG)