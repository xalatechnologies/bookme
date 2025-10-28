# Hardcoded Strings Analysis

## Analysis Date
January 27, 2025

## Total Components Scanned
156 TSX files in `/src/components`

## Components with Hardcoded Strings

### High Priority (Norwegian strings that need immediate fixing)

#### Messaging Components
1. **CreateThreadModal.tsx** - IN PROGRESS
   - Remaining: "Du trenger bookede lokaler for å kunne sende meldinger."
   
2. **MessageInbox.tsx**
   - "Søk i meldinger..."
   - "Status", "Prioritet" (select placeholders)

3. **MessageThread.tsx**
   - "Skriv en melding..."

#### Booking Components
4. **BookingDetailsPanel.tsx** - IN PROGRESS
   - "Bookingdetaljer", "Ukjent lokale", "Status:", "Dato:", "Tidspunkt:", "Varighet:", 
   - "Totalpris:", "Notater:", "Booking-ID:", "Handlinger:", "Rediger", "Avlys", "Del"
   - "time", "timer" (duration formatting)
   - "Legg til kalender"

5. **GroupBookingFlow.tsx**
   - "Beskriv formålet med gruppebokingen..."
   - "Velg tidspunkt"

6. **RecurrencePatternSelector.tsx**
   - "Velg uke", "Velg dag", "Velg sluttdato"

7. **StepByStepBooking Components**
   - Step2Details.tsx
   - Step5Actions.tsx
   - StepProgressIndicator.tsx
   - BookingSidebar.tsx

#### Field/Form Components
8. **FieldConfigModal.tsx**
   - "F.eks. 'Etasje nummer'"
   - "F.eks. 'floorNumber'"

## Categorization

### JSON Translation Keys (Static UI Labels)
- Button labels: "Rediger", "Avlys", "Del", "Legg til kalender"
- Field labels: "Bookingdetaljer", "Status:", "Dato:", "Varighet:", etc.
- Placeholders: Message/form input placeholders
- Messages: Validation, success, error messages
- Time units: "time", "timer", "tegn"

### Database Translations (Dynamic Values)
Already implemented:
- Facility types (idrettshall, kulturhus, etc.)
- Locations (drammen_sentrum, strømsø, etc.)
- Booking statuses (pending, paid, cancelled, etc.)
- Ticket statuses, priorities, categories
- Accessibility features
- Capacity ranges

### Implementation Strategy

**Phase 1: Add All Missing Translation Keys**
- Add booking detail labels to common.json or bookings.json
- Add messaging labels to common.json
- Add calendar/step labels to calendar.json or bookings.json
- Add time unit labels

**Phase 2: Update Components Batch by Batch**
- Messaging components (3 files)
- Booking detail components (5 files)
- Step components (4 files)
- Form/field components (2 files)

**Phase 3: Verification**
- Build and lint check after each batch
- Test language switching
- Verify no missing keys in console

## Translation Keys to Add

### common.json
```json
{
  "messages": {
    "needBookedVenues": "You need booked venues to send messages."
  },
  "bookingDetails": {
    "title": "Booking Details",
    "unknownVenue": "Unknown venue",
    "statusLabel": "Status:",
    "dateLabel": "Date:",
    "timeLabel": "Time:",
    "durationLabel": "Duration:",
    "totalPriceLabel": "Total Price:",
    "notesLabel": "Notes:",
    "bookingIdLabel": "Booking ID:",
    "actionsLabel": "Actions:",
    "edit": "Edit",
    "cancel": "Cancel Booking",
    "share": "Share",
    "addToCalendar": "Add to Calendar"
  },
  "time": {
    "hour": "hour",
    "hours": "hours"
  }
}
```

## Status

- ✅ SearchFilter - Fully localized with database values
- ✅ CreateThreadModal - Partially complete, 1 string remaining
- ⏳ BookingDetailsPanel - In progress
- ⏳ MessageInbox - Pending
- ⏳ MessageThread - Pending
- ⏳ GroupBookingFlow - Pending
- ⏳ RecurrencePatternSelector - Pending
- ⏳ StepByStep components - Pending

