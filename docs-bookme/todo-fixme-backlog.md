# bookme-todo-fixme-backlog.md

# BookMe – TODO/FIXME Backlog og Implementeringsplan

## Omfang og mål
Dette dokumentet samler alle TODO/FIXME kommentarer i kodebasen og organiserer dem etter prioritet, kategori og implementeringskompleksitet. Dette gir en klar roadmap for å fullføre applikasjonen.

## Definisjoner og antakelser
- **TODO**: Funksjonalitet som må implementeres
- **FIXME**: Kode som må fikses eller forbedres
- **HACK**: Midlertidige løsninger som må erstattes
- **XXX**: Kritiske problemer som må håndteres

## Prioritering
- **🔴 Høy prioritet**: Kritiske funksjoner for grunnleggende brukeropplevelse
- **🟡 Medium prioritet**: Viktige funksjoner for full funksjonalitet
- **🟢 Lav prioritet**: Nice-to-have funksjoner og forbedringer

---

## 🔴 HØY PRIORITET - Kritiske funksjoner

### 1. Backend/API Integrasjoner (8 stk)
**Filer**: `src/pages/admin/FacilitiesPage.tsx`, `src/pages/admin/BookingsPage.tsx`, `src/pages/Checkout.tsx`

#### FacilitiesPage.tsx
- `TODO: Call API to update facility status` (3 steder)
  - **Beskrivelse**: Implementer API-kall for å oppdatere fasilitetsstatus
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-6 timer

- `TODO: Implement status toggle`
  - **Beskrivelse**: Implementer toggle-funksjonalitet for fasilitetsstatus
  - **Kompleksitet**: Lav
  - **Estimert tid**: 2-3 timer

#### BookingsPage.tsx
- `TODO: Implement deletion logic`
  - **Beskrivelse**: Implementer sletting av bookinger
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

- `TODO: Implement bulk approval logic`
  - **Beskrivelse**: Implementer massegodkjenning av bookinger
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

- `TODO: Implement bulk rejection logic`
  - **Beskrivelse**: Implementer masseavslag av bookinger
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

#### Checkout.tsx
- `TODO: Implement save functionality when backend is available`
  - **Beskrivelse**: Implementer lagring av bestillinger til backend
  - **Kompleksitet**: Høy
  - **Estimert tid**: 8-10 timer

### 2. Brukerfunksjonalitet (25 stk)
**Filer**: `src/pages/user/Bookings.tsx`, `src/pages/user/UserDashboard.tsx`, `src/pages/user/UserProfile.tsx`, `src/pages/user/UserSettings.tsx`, `src/pages/user/UserNotifications.tsx`, `src/pages/user/UserFavorites.tsx`, `src/pages/user/UserReceipts.tsx`

#### Bookings.tsx
- ✅ `TODO: Implement edit` - Rediger booking
  - **Beskrivelse**: Implementer redigering av eksisterende bookinger
  - **Kompleksitet**: Høy
  - **Estimert tid**: 8-10 timer

- ✅ `TODO: Implement withdraw` - Trekk tilbake booking
  - **Beskrivelse**: Implementer mulighet til å trekke tilbake bookinger
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Implement reschedule` - Endre tidspunkt
  - **Beskrivelse**: Implementer endring av bookingtidspunkt
  - **Kompleksitet**: Høy
  - **Estimert tid**: 8-10 timer

- ✅ `TODO: Implement cancel` - Avlys booking
  - **Beskrivelse**: Implementer avlysning av bookinger
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Implement share` - Del booking
  - **Beskrivelse**: Implementer deling av bookinger
  - **Kompleksitet**: Lav
  - **Estimert tid**: 2-3 timer

- ✅ `TODO: Implement add to calendar` - Legg til i kalender
  - **Beskrivelse**: Implementer eksport til eksterne kalendere
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-6 timer

- ✅ `TODO: Implement new request` - Send ny forespørsel
  - **Beskrivelse**: Implementer sending av nye forespørsler
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

#### UserDashboard.tsx
- ✅ `TODO: Implement mark as read` - Marker som lest
  - **Beskrivelse**: Implementer markering av notifikasjoner som lest
  - **Kompleksitet**: Lav
  - **Estimert tid**: 2-3 timer

- ✅ `TODO: Implement edit booking` - Rediger booking
  - **Beskrivelse**: Implementer redigering av bookinger fra dashboard
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

- ✅ `TODO: Implement cancel booking` - Avlys booking
  - **Beskrivelse**: Implementer avlysning av bookinger fra dashboard
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Implement add to calendar` - Legg til i kalender
  - **Beskrivelse**: Implementer kalendereksport fra dashboard
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-6 timer

- ✅ `TODO: Implement contact admin` - Kontakt admin
  - **Beskrivelse**: Implementer kontaktfunksjonalitet med admin
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

#### UserProfile.tsx
- ✅ `TODO: Implement account deletion` - Slett konto
  - **Beskrivelse**: Implementer konto-sletting med GDPR-compliance
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

#### UserSettings.tsx
- ✅ `TODO: Implement save settings` - Lagre innstillinger
  - **Beskrivelse**: Implementer lagring av brukerinnstillinger
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

#### UserNotifications.tsx
- ✅ `TODO: Implement actual save to backend` (4 steder)
  - **Beskrivelse**: Implementer lagring av notifikasjonsinnstillinger til backend
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-6 timer

#### UserFavorites.tsx
- ✅ `TODO: Implement real availability check` - Ekte tilgjengelighetssjekk
  - **Beskrivelse**: Implementer sanntids-tilgjengelighetssjekk
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

- ✅ `TODO: Navigate to facility detail page` - Naviger til fasilitetsdetaljer
  - **Beskrivelse**: Implementer navigasjon til fasilitetsdetaljer
  - **Kompleksitet**: Lav
  - **Estimert tid**: 1-2 timer

- ✅ `TODO: Navigate to booking page` - Naviger til bookingside
  - **Beskrivelse**: Implementer navigasjon til bookingside
  - **Kompleksitet**: Lav
  - **Estimert tid**: 1-2 timer

- ✅ `TODO: Open quick view modal` - Åpne hurtigvisning
  - **Beskrivelse**: Implementer hurtigvisning-modal for favoritter
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

#### UserReceipts.tsx
- ✅ `TODO: Implement download receipt` - Last ned kvittering
  - **Beskrivelse**: Implementer nedlasting av kvitteringer
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Show toast notification` - Vis toast-melding
  - **Beskrivelse**: Implementer toast-meldinger for kvitteringshandlinger
  - **Kompleksitet**: Lav
  - **Estimert tid**: 1-2 timer

- ✅ `TODO: Implement send receipt email` - Send kvittering på e-post
  - **Beskrivelse**: Implementer e-post sending av kvitteringer
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Navigate to payment portal` - Naviger til betalingsportal
  - **Beskrivelse**: Implementer navigasjon til betalingsportal
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

- ✅ `TODO: Implement CSV export` - CSV-eksport
  - **Beskrivelse**: Implementer CSV-eksport av kvitteringer
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

---

## 🟡 MEDIUM PRIORITET - Viktige funksjoner

### 3. Admin-funksjonalitet (20 stk)
**Filer**: `src/components/admin/facilities/AdminFacilityListItem.tsx`, `src/components/admin/facilities/AdminFacilityCard.tsx`, `src/pages/admin/UsersRolesPage.tsx`, `src/pages/admin/AuditLogPage.tsx`, `src/pages/admin/ReportsPage.tsx`, `src/pages/admin/DeletionPlanPage.tsx`, `src/pages/admin/IntegrationsPage.tsx`, `src/pages/admin/NotificationsPage.tsx`

#### AdminFacilityListItem.tsx
- ✅ `TODO: Implement save functionality` - Lagre-funksjonalitet
  - **Beskrivelse**: Implementer lagring av fasilitetsendringer
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Open facility editing modal` - Åpne redigeringsmodal
  - **Beskrivelse**: Implementer redigeringsmodal for fasiliteter
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Open image upload modal` - Åpne bildeopplastingsmodal
  - **Beskrivelse**: Implementer bildeopplastingsmodal
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

- ✅ `TODO: Open all amenities modal` - Åpne alle fasiliteter-modal
  - **Beskrivelse**: Implementer modal for visning av alle fasiliteter
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

#### AdminFacilityCard.tsx
- ✅ `TODO: Implement save functionality` - Lagre-funksjonalitet
  - **Beskrivelse**: Implementer lagring av fasilitetsendringer
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Open facility editing modal` - Åpne redigeringsmodal
  - **Beskrivelse**: Implementer redigeringsmodal for fasiliteter
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Open image upload modal` - Åpne bildeopplastingsmodal
  - **Beskrivelse**: Implementer bildeopplastingsmodal
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

- ✅ `TODO: Open all amenities modal` - Åpne alle fasiliteter-modal
  - **Beskrivelse**: Implementer modal for visning av alle fasiliteter
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

#### UsersRolesPage.tsx
- ✅ `TODO: Implement save user logic` - Lagre brukerlogikk
  - **Beskrivelse**: Implementer lagring av brukerendringer
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

- ✅ `TODO: Implement save role logic` - Lagre rollelogikk
  - **Beskrivelse**: Implementer lagring av rolleendringer
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

- ✅ `TODO: Implement deactivate user logic` - Deaktiver brukerlogikk
  - **Beskrivelse**: Implementer deaktivering av brukere
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Implement delete user logic` - Slett brukerlogikk
  - **Beskrivelse**: Implementer sletting av brukere
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

- ✅ `TODO: Implement resend invitation logic` - Send invitasjon på nytt
  - **Beskrivelse**: Implementer gjenutsending av invitasjoner
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

- ✅ `TODO: Implement deactivate role logic` - Deaktiver rollelogikk
  - **Beskrivelse**: Implementer deaktivering av roller
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Implement view users with role logic` - Vis brukere med rolle
  - **Beskrivelse**: Implementer visning av brukere med spesifikk rolle
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Implement bulk actions` - Massehandlinger
  - **Beskrivelse**: Implementer massehandlinger for brukere og roller
  - **Kompleksitet**: Høy
  - **Estimert tid**: 8-10 timer

#### AuditLogPage.tsx
- ✅ `TODO: Implement CSV export` - CSV-eksport
  - **Beskrivelse**: Implementer CSV-eksport av audit-logger
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

#### ReportsPage.tsx
- ✅ `TODO: Implement CSV export` - CSV-eksport
  - **Beskrivelse**: Implementer CSV-eksport av rapporter
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

- ✅ `TODO: Implement PDF export` - PDF-eksport
  - **Beskrivelse**: Implementer PDF-eksport av rapporter
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

#### DeletionPlanPage.tsx
- ✅ `TODO: Implement manual deletion` - Manuell sletting
  - **Beskrivelse**: Implementer manuell sletting av data
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

#### IntegrationsPage.tsx
- ✅ `TODO: Show toast notification` - Vis toast-melding
  - **Beskrivelse**: Implementer toast-meldinger for integrasjoner
  - **Kompleksitet**: Lav
  - **Estimert tid**: 1-2 timer

#### NotificationsPage.tsx
- ✅ `TODO: Implement toggle functionality` (2 steder) - Toggle-funksjonalitet
  - **Beskrivelse**: Implementer toggle-funksjonalitet for notifikasjoner
  - **Kompleksitet**: Lav
  - **Estimert tid**: 2-3 timer

### 4. Søk og navigasjon (4 stk)
**Filer**: `src/components/user/header/UserSearchField.tsx`, `src/components/admin/header/SearchField.tsx`, `src/components/facility/FacilityCardUser.tsx`

#### UserSearchField.tsx
- ✅ `TODO: Implement search functionality for facilities` - Søkefunksjonalitet for fasiliteter
  - **Beskrivelse**: Implementer søkefunksjonalitet for fasiliteter
  - **Kompleksitet**: Høy
  - **Estimert tid**: 8-10 timer

#### AdminSearchField.tsx
- ✅ `TODO: Implement search functionality` - Søkefunksjonalitet
  - **Beskrivelse**: Implementer admin-søkefunksjonalitet
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

#### FacilityCardUser.tsx
- ✅ `TODO: Navigate to booking flow` - Naviger til bookingflyt
  - **Beskrivelse**: Implementer navigasjon til bookingflyt
  - **Kompleksitet**: Lav
  - **Estimert tid**: 1-2 timer

- ✅ `TODO: Implement share functionality` - Delingsfunksjonalitet
  - **Beskrivelse**: Implementer delingsfunksjonalitet for fasiliteter
  - **Kompleksitet**: Lav
  - **Estimert tid**: 2-3 timer

### 5. Notifikasjoner og kommunikasjon (6 stk)
**Filer**: `src/components/user/header/UserNotificationBell.tsx`, `src/components/admin/header/NotificationBell.tsx`, `src/components/facility/detail/FacilityContactInfo.tsx`

#### UserNotificationBell.tsx
- ✅ `TODO: Implement mark as read functionality` - Marker som lest
  - **Beskrivelse**: Implementer markering av notifikasjoner som lest
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

- ✅ `TODO: Implement mark all as read functionality` - Marker alle som lest
  - **Beskrivelse**: Implementer markering av alle notifikasjoner som lest
  - **Kompleksitet**: Lav
  - **Estimert tid**: 2-3 timer

#### AdminNotificationBell.tsx
- ✅ `TODO: Implement mark as read functionality` - Marker som lest
  - **Beskrivelse**: Implementer markering av admin-notifikasjoner som lest
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

- ✅ `TODO: Implement mark all as read functionality` - Marker alle som lest
  - **Beskrivelse**: Implementer markering av alle admin-notifikasjoner som lest
  - **Kompleksitet**: Lav
  - **Estimert tid**: 2-3 timer

#### FacilityContactInfo.tsx
- ✅ `TODO: Implement booking functionality` - Bookingfunksjonalitet
  - **Beskrivelse**: Implementer bookingfunksjonalitet fra kontaktinfo
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

- ✅ `TODO: Implement contact functionality` - Kontaktfunksjonalitet
  - **Beskrivelse**: Implementer kontaktfunksjonalitet
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

---

## 🟢 LAV PRIORITET - Nice-to-have funksjoner

### 6. Språk og autentisering (3 stk)
**Filer**: `src/components/user/header/UserProfileDropdown.tsx`, `src/components/admin/header/ProfileDropdown.tsx`, `src/components/GlobalHeader.tsx`

#### UserProfileDropdown.tsx
- ✅ `TODO: Implement user logout` - Brukerutlogging
  - **Beskrivelse**: Implementer brukerutlogging
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

- ✅ `TODO: Implement language change` - Språkendring
  - **Beskrivelse**: Implementer språkendring
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

#### AdminProfileDropdown.tsx
- ✅ `TODO: Implement language change` - Språkendring
  - **Beskrivelse**: Implementer admin-språkendring
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

#### GlobalHeader.tsx
- ✅ `TODO: Implement logout logic` - Utloggingslogikk
  - **Beskrivelse**: Implementer global utloggingslogikk
  - **Kompleksitet**: Medium
  - **Estimert tid**: 3-4 timer

### 7. Kalender og tilgjengelighet (2 stk)
**Filer**: `src/components/calendar/FacilityCalendar.tsx`, `src/pages/user/UserFacilities.tsx`

#### FacilityCalendar.tsx
- ✅ `TODO: Implement holiday checking` - Helligdagssjekk
  - **Beskrivelse**: Implementer sjekk for helligdager
  - **Kompleksitet**: Medium
  - **Estimert tid**: 4-5 timer

#### UserFacilities.tsx
- ✅ `TODO: Implement real availability check` - Ekte tilgjengelighetssjekk
  - **Beskrivelse**: Implementer sanntids-tilgjengelighetssjekk
  - **Kompleksitet**: Høy
  - **Estimert tid**: 6-8 timer

---

## 📊 Samlet oversikt

### Statistikk
- **Totalt antall TODO/FIXME**: 74
- **Høy prioritet**: 33 (45%) - **25 fullført (76%)**
- **Medium prioritet**: 30 (40%) - **30 fullført (100%)** ✅
- **Lav prioritet**: 11 (15%) - **11 fullført (100%)** ✅

### Kategorisering etter funksjonalitet
1. **Backend/API integrasjoner**: 8 stk (11%) - **0 fullført (0%)**
2. **Brukerfunksjonalitet**: 25 stk (34%) - **25 fullført (100%)** ✅
3. **Admin-funksjonalitet**: 20 stk (27%) - **20 fullført (100%)** ✅
4. **Søk og navigasjon**: 4 stk (5%) - **4 fullført (100%)** ✅
5. **Notifikasjoner og kommunikasjon**: 6 stk (8%) - **6 fullført (100%)** ✅
6. **Språk og autentisering**: 3 stk (4%) - **3 fullført (100%)** ✅
7. **Kalender og tilgjengelighet**: 2 stk (3%) - **2 fullført (100%)** ✅

### Estimert total tid
- **Høy prioritet**: 150-200 timer
- **Medium prioritet**: 120-150 timer
- **Lav prioritet**: 30-40 timer
- **Totalt**: 300-390 timer

### Kategorisering etter kompleksitet
- **Lav kompleksitet**: 20 (27%)
- **Medium kompleksitet**: 35 (47%)
- **Høy kompleksitet**: 19 (26%)

### Anbefalt implementeringsrekkefølge
1. **Fase 1**: Backend/API integrasjoner (høy prioritet)
2. **Fase 2**: Grunnleggende brukerfunksjonalitet (høy prioritet)
3. **Fase 3**: Admin-funksjonalitet (medium prioritet)
4. **Fase 4**: Søk og navigasjon (medium prioritet)
5. **Fase 5**: Notifikasjoner og kommunikasjon (medium prioritet)
6. **Fase 6**: Språk og autentisering (lav prioritet)
7. **Fase 7**: Kalender og tilgjengelighet (lav prioritet)

---

## 📝 Notater
- Alle estimater er basert på erfaring med React/TypeScript-utvikling
- Kompleksitet tar hensyn til både frontend og backend-integrasjon
- Prioritering er basert på brukeropplevelse og forretningsverdi
- Dokumentet oppdateres kontinuerlig etter hvert som TODO-er implementeres
