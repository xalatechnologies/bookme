# Booknor – Ferdigstillelses- og Oppryddings-sjekkliste

Mål: Gjøre prosjektet klart for seriøs produksjon (kommune-nivå) og utviklervennlig videreutvikling.  
Oppgave: Gå systematisk gjennom alle seksjoner. Ikke krysse av før oppgaven faktisk er verifisert i kode.

---

## 1. Arkitektur og prosjektstruktur

### 1.1 Konsolidere state-håndtering (Context vs Zustand)
- [x] Lag en oversikt over all bruk av React Context (`AuthContext`, `LanguageContext`, `UserProfileContext`) og Zustand-stores (`stores/*`).
- [x] Definer tydelig ansvar:
  - [x] Context brukes KUN til:
    - [x] Auth (innlogget bruker + session)
    - [x] UserProfile (profildata)
    - [x] Language (aktivt språk)
  - [x] Zustand brukes til:
    - [x] UI-state (toggles, modaler, steg i wizards)
    - [x] Midlertidig domene-state (draft booking, filter, cart, osv.)
- [x] Fjern duplisert state (samme ansvar både i Context og Zustand).
- [x] Oppdater alle komponenter til å bruke riktig kilde (Context eller store) etter den nye strukturen.
- [x] Dokumenter state-arkitekturen i `docs/dev/STATE_MANAGEMENT.md`.

### 1.2 Stramme opp lagdeling (services, hooks, pages)
- [x] Kartlegg alle steder som gjør direkte Supabase-kall utenom `services/*`.
- [x] For hver slik forekomst:
  - [x] Flytt datatilgang til `services/supabase/*` eller `services/business/*`.
  - [x] Eksponer funksjoner med tydelige, typed signaturer.
  - [x] Oppdater komponenter til å bruke services i stedet for direkte klient.
- [x] Opprett dedikerte hooks for "tunge" sider:
  - [x] `useIndexPageLogic` (for `Index.tsx`).
  - [ ] `useAdminSettingsLogic` (for `admin/SettingsPage.tsx`).
  - [ ] Andre hooks for sider med mye logikk (filter, redirect, mapping).
- [x] Flytt:
  - [x] Datahenting
  - [x] Filtrering og sortering
  - [x] Redirect-logikk
  - [x] Lokal business-logikk
  inn i disse hooks.
- [x] La page-komponentene hovedsakelig håndtere layout og sammensetting av UI-komponenter.
- [x] Dokumenter arkitekturvalget i `docs/adr/ADR_STATE_AND_SERVICE_LAYER.md`.

---

## 2. Frontend: UI-system, tema, knapper, farger, bakgrunner

### 2.1 Design-system som "single source of truth"
- [x] Opprett `docs/ui/DESIGN_SYSTEM.md`.
- [x] Beskriv alle knappetyper:
  - [x] List alle `buttonVariants` (f.eks. `primary`, `secondary`, `ghost`, `outline`, `danger`).
  - [x] List alle størrelser (`sm`, `md`, `lg`, `icon`).
  - [x] Angi regler for når hver variant skal brukes.
- [x] Beskriv kort-komponenter:
  - [x] Standard card (innhold).
  - [x] KPI/metric-card.
  - [x] Listekort (rad-kort med metadata).
- [x] Beskriv badges:
  - [x] Statusverdier (`pending`, `approved`, `rejected`, `cancelled`, osv.).
  - [x] Fargekoding per status.
- [x] Definer overordnet fargebruk:
  - [x] Primærfarge (call-to-action).
  - [x] Sekundærfarge (sekundære handlinger).
  - [x] Nøytrale flater (bakgrunn, kort, grensesnitt).
  - [x] Farger for `success`, `warning`, `danger`, `info`.
- [x] Sørg for at `src/components/ui/*` følger denne spesifikasjonen.

### 2.2 Konsekvent bruk av UI-komponenter
- [x] Søk gjennom prosjektet etter `<button className=` uten bruk av felles `Button`/`PrimaryButton`.
- [x] Erstatt slike tilfeller med:
  - [x] `Button`/`PrimaryButton` fra `components/ui`.
- [x] Sjekk at alle primær/sekundær-handlinger bruker design-system-knapper.
- [x] Sikre at lenker konsekvent bruker:
  - [x] `Link` for interne ruter.
  - [x] `<a>` for eksterne lenker med riktig attributter (`target`, `rel`).

### 2.3 Tema og dark mode
- [x] Gå gjennom `src/styles/theme.css`.
- [x] Bekreft hvilke tema som faktisk skal støttes:
  - [x] Kun light mode.
  - [ ] Light + dark mode med toggle.
- [x] Hvis kun light mode:
  - [x] Fjern ubrukte `dark`-spesifikke definisjoner som ikke er i bruk.
  - [x] Rydd i kommentarer i `main.tsx` relatert til dark mode.
- [ ] Hvis light + dark mode:
  - [ ] Implementer `useTheme`-hook.
  - [ ] Implementer `ThemeToggle`-komponent (ikonknapp o.l.).
  - [ ] Legg inn lagring av tema i `localStorage`.
  - [ ] Respekter `prefers-color-scheme` som default.
  - [ ] Fjern logikk i `main.tsx` som tvinger bort `dark` og `theme` i `localStorage`.
- [x] Verifiser at alle `background`/`foreground`-farger refererer til CSS-variabler fra `theme.css`.

### 2.4 Bakgrunn, layout og spacing
- [x] Definer følgende CSS-variabler (hvis ikke allerede gjort):
  - [x] `--background-page`
  - [x] `--background-card`
  - [x] `--background-muted`
- [x] Erstatt hardkodede Tailwind-klasser som `bg-gray-100`, `bg-slate-50` osv. i større layouts med klasser basert på CSS-variabler.
- [x] Opprett evt. layout-komponenter:
  - [x] `<PageBackground>` for sidebakgrunn.
  - [x] `<SectionBackground>` for seksjonsbakgrunn.
- [x] Gå gjennom `PublicLayout`, `AdminLayout`, `UserLayout`:
  - [x] Sikre konsistent bruk av bakgrunns-farger/variabler.
  - [x] Sikre konsistent spacing mellom seksjoner og kort.

---

## 3. Supabase, datamodell og RLS

### 3.1 RLS-policies for organisasjoner og multi-tenant
- [x] Gå gjennom `supabase/migrations/*rls_policies*.sql`.
- [x] Identifiser alle policies med `using (true)` (f.eks. `org_read_pub`).
- [x] Vurder om hver av disse er akseptabel i en kommune-setting.
- [x] For `organizations`:
  - [x] Endre `select`-policy til å begrense til:
    - [x] Organisasjoner brukeren har `memberships` i, eller
    - [x] Et begrenset sett med “public” metadata hvis nødvendig.
- [x] Verifiser at alle tabeller som inneholder sensitiv eller kunde-spesifikk informasjon har:
  - [x] `tenant`/org-grense i policy (via `org_id`).
  - [x] Korrekt tilknytning til `auth.uid()` hvor relevant.

### 3.2 Konsekvent bruk av org-filter i tjenester
- [x] Finn alle Supabase-queries i `services/supabase/*` og `services/business/*`.
- [x] Sjekk at alle queries som skal være multi-tenant:
  - [x] Filtrerer eksplisitt på `org_id`.
  - [x] Eller bruker helper som henter riktig `org_id` for innlogget bruker (`getOrgIdForUser` eller tilsvarende).
- [x] Lag en felles helper:
  - [x] `getCurrentOrgIdForUser(userId)` i en sentral modul.
- [x] Oppdater alle relevante services til å bruke denne helperen.

### 3.3 Dokumentasjon av datamodell
- [x] Opprett `docs/data/ENTITY_MODEL.md`.
- [x] Beskriv følgende entiteter:
  - [x] `organizations`
  - [x] `profiles`
  - [x] `memberships`
  - [x] `facilities`
  - [x] `bookings`
  - [x] `recurring_bookings`
  - [x] `amenities`
  - [x] `zones`
  - [x] `facility_rules`
  - [x] `notifications`
  - [x] `messages`
- [x] For hver entitet, dokumenter:
  - [x] Formål.
  - [x] Viktige felter.
  - [x] Relasjoner til andre tabeller.
- [x] Beskriv typiske bruksscenarier:
  - [x] Hvordan en booking opprettes og knyttes til facility, bruker og org.
  - [x] Hvordan approvals/godkjenning fungerer.
  - [x] Hvordan rammetid og facility-regler påvirker booking.

---

## 4. UX og brukerflyt

### 4.1 Landings- og søkeside (Index / booking-flyt)
- [ ] Identifiser all logikk i `src/pages/Index.tsx`:
  - [ ] Supabase-kall.
  - [ ] Filter-håndtering (pris, tilgjengelighet, utstyr, parkering, wifi, fotografering osv.).
  - [ ] Auth-basert redirect (admin vs vanlig bruker).
  - [ ] Samspill mellom liste og kart.
- [ ] Flytt datalogikk til:
  - [ ] `services/business/facilities.service.ts` (eller tilsvarende).
- [ ] Opprett hook:
  - [ ] `useFacilitySearchLogic`:
    - [ ] Henter liste over facilities.
    - [ ] Håndterer filter-state.
    - [ ] Håndterer ordning/sortering.
    - [ ] Håndterer loading/error.
- [ ] Del opp UI i rene komponenter:
  - [ ] `<SearchFilters />`
  - [ ] `<FacilityList />`
  - [ ] `<FacilityMap />` (kartvisning).
- [ ] Vurder bruk av `react-query` eller tilsvarende:
  - [ ] Konfigurer queryClient.
  - [ ] Bruk queries/mutations for datahenting/oppdatering.
- [ ] Verifiser flyt:
  - [ ] Bruker søker.
  - [ ] Får opp liste + kart.
  - [ ] Klikk på facility fører til riktig detaljside.

### 4.2 Booking-flyt og checkout
- [ ] Gå gjennom `src/pages/Checkout.tsx`:
  - [ ] Identifiser direkte Supabase-kall.
  - [ ] Identifiser logikk for “bruker er ikke logget inn”.
- [ ] Flytt datalogikk til dedikert service/hook:
  - [ ] `useCheckoutLogic`.
- [ ] Sørg for at:
  - [ ] Ikke-innlogget bruker blir sendt til login.
  - [ ] Etter login kommer bruker tilbake til samme booking-flyt.
  - [ ] Feil i booking (manglende felter, kollisjon, RLS-feil) gir tydelige feilmeldinger.
- [ ] Verifiser at det finnes en tydelig kvitteringsside etter fullført booking.

---

## 5. Roller, rutevern og admin-/staff-skille

### 5.1 Rolle-modell
- [ ] Dokumenter alle roller i systemet:
  - [ ] `owner`
  - [ ] `admin`
  - [ ] `staff`
  - [ ] `user` (kunde/sluttbruker).
- [ ] Definer en rolle-matrise i kode (f.eks. `roles.ts`):
  - [ ] `ROLE_ADMIN = ['owner', 'admin']`
  - [ ] `ROLE_STAFF = ['staff']`
  - [ ] `ROLE_USER = ['user']`
- [ ] Beskriv i `docs/security/ROLES_AND_PERMISSIONS.md` hvilke roller som:
  - [ ] Har tilgang til adminpanel.
  - [ ] Har tilgang til saksbehandler/staff-panel.
  - [ ] Har kun sluttbruker-tilgang.

### 5.2 Protected routes og AdminRoutes
- [ ] Gå gjennom `AdminRoutes.tsx` og `ProtectedRoute`-komponent.
- [ ] Sørg for at:
  - [ ] Admin-ruter kun krever roller i `ROLE_ADMIN`.
  - [ ] Evt. staff-ruter krever roller i `ROLE_STAFF`.
  - [ ] Ikke-autoriserte brukere får:
    - [ ] Forutsigbar redirect (f.eks. til /login eller /unauthorized).
- [ ] Test manuelt med ulike brukere:
  - [ ] Admin-bruker.
  - [ ] Staff-bruker.
  - [ ] Vanlig bruker.
  - [ ] Ikke-innlogget.

### 5.3 Skjule admin-funksjoner for staff
- [ ] Gå gjennom `AdminLayout` og tilhørende navigasjon.
- [ ] Identifiser menypunkter som KUN skal være tilgjengelig for system-/org-admin:
  - [ ] Integrations.
  - [ ] Reports.
  - [ ] Audit log.
  - [ ] Data retention.
  - [ ] Localization (system-nivå).
- [ ] Legg inn rolle-basert visning:
  - [ ] Skjul disse menypunktene fullstendig for `staff` og `user`.
- [ ] Verifiser at staff fortsatt har tilgang til:
  - [ ] Daglig driftsrelevante moduler (bookinger, kalender, saksbehandling, etc.) etter forventet rolle.

---

## 6. Testing, kvalitet og CI

### 6.1 Enhetstester
- [ ] Gå gjennom `tests/unit`:
  - [ ] Kartlegg hvilke UI-komponenter som har tester.
  - [ ] Identifiser kritiske komponenter som mangler tester (f.eks. komplekse formularer, bookingkomponenter).
- [ ] Legg til tester for:
  - [ ] Viktige UI-komponenter i booking-flyten.
  - [ ] Viktige admin-komponenter (saksbehandling, godkjenning).

### 6.2 Integrasjonstester / flyt-tester
- [ ] Opprett eller utvid integrasjonstester for:
  - [ ] “Happy path” booking:
    - [ ] Bruker søker etter lokale.
    - [ ] Går til facility-detaljside.
    - [ ] Starter booking.
    - [ ] Fyller ut nødvendig informasjon.
    - [ ] Går gjennom checkout.
    - [ ] Får kvittering.
  - [ ] Ikke-innlogget bruker:
    - [ ] Prøver å booke.
    - [ ] Blir sendt til login.
    - [ ] Returnerer til riktig steg etter login.
  - [ ] Admin-flyt:
    - [ ] Admin ser liste over bookinger.
    - [ ] Admin godkjenner en booking.
    - [ ] Admin avviser en booking.
  - [ ] Rollebegrensning:
    - [ ] Staff med feil rolle får ikke tilgang til `/admin`.
    - [ ] Vanlig bruker får ikke tilgang til admin-panel.

### 6.3 CI-oppsett (beskrives tydelig)
- [ ] Opprett `docs/dev/CI_SETUP.md`.
- [ ] Dokumenter at følgende kommandoer skal kjøre i CI:
  - [ ] `npm run lint`
  - [ ] `npm run test`
  - [ ] `npm run build`
- [ ] Beskriv ønsket pipeline (GitHub Actions / Azure DevOps / annen):
  - [ ] Steg for installasjon (caching av node_modules).
  - [ ] Steg for lint.
  - [ ] Steg for test.
  - [ ] Steg for build.
- [ ] Verifiser at prosjektet bygger og tester grønt lokalt før CI-konfig settes opp.

---

## 7. Repo-hygiene og dokumentasjon

### 7.1 Fjerne støy og tunge kataloger
- [ ] Sørg for at `node_modules/` ikke ligger i repo:
  - [ ] Sjekk `.gitignore` for `node_modules`.
- [ ] Sørg for at `.qoder/` og andre AI-spesifikke arbeidsmapper er ekskludert:
  - [ ] Legg til relevante oppføringer i `.gitignore`.
- [ ] Kontroller at bygg-artefakter ikke er committed (dist, build, coverage osv.).

### 7.2 Rydde i `docs/`
- [ ] Identifiser dokumenter som faktisk er nyttige for utviklere:
  - [ ] `docs/README.md`.
  - [ ] `docs/adr/*` (arkitekturvalg).
  - [ ] `docs/features/*` (feature-spesifikke beskrivelser).
  - [ ] `docs/data/*` (datamodell, Supabase).
  - [ ] `docs/testing/*` (teststrategi).
- [ ] Identifiser AI-rapporter og støy:
  - [ ] “A_PLUS_SUMMARY”.
  - [ ] “MASTER_COMPREHENSIVE_ANALYSIS”.
  - [ ] Andre meta-rapporter som ikke trengs for daglig utvikling.
- [ ] Flytt slike filer til:
  - [ ] Egen arkivmappe (`docs/archive/`) ELLER
  - [ ] Fjern dem helt hvis de ikke har verdi.
- [ ] Oppdater `docs/README.md` med:
  - [ ] Kort oversikt over struktur og hvor man finner hva.

### 7.3 Environment-filer
- [ ] Døp om eksisterende `/.env.local` mal til `.env.example` (uten reelle hemmeligheter).
- [ ] Sørg for at `.env.local` og `.env.test` er i `.gitignore`.
- [ ] Oppdater `README.md`:
  - [ ] Beskriv:
    - [ ] “Kopier `.env.example` til `.env.local` og fyll inn egne verdier.”
- [ ] Verifiser at ingen sensitive nøkler er committed.

---

## 8. Sikkerhet og kortfattet “security-story”

- [ ] Opprett `docs/security/SECURITY_MODEL.md`.
- [ ] Beskriv kort:
  - [ ] At Supabase RLS brukes som primær datatilgangskontroll.
  - [ ] Hvordan organisasjoner, brukere og memberships henger sammen.
  - [ ] Hvordan roller (`owner`, `admin`, `staff`, `user`) begrenser tilgang.
  - [ ] Hvilke tabeller er eksponert til klienten og under hvilke betingelser.
- [ ] Legg inn referanse til relevante RLS-migrations-filer.
- [ ] Verifiser at modellen er konsistent med faktisk implementert kode og policies.

---