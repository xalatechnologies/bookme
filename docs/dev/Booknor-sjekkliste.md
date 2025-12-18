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
- [x] Identifiser all logikk i `src/pages/Index.tsx`:
  - [x] Supabase-kall.
  - [x] Filter-håndtering (pris, tilgjengelighet, utstyr, parkering, wifi, fotografering osv.).
  - [x] Auth-basert redirect (admin vs vanlig bruker).
  - [x] Samspill mellom liste og kart.
- [x] Flytt datalogikk til:
  - [x] `services/business/facilities.service.ts` (eller tilsvarende).
- [x] Opprett hook:
  - [x] `useFacilitySearchLogic`:
    - [x] Henter liste over facilities.
    - [x] Håndterer filter-state.
    - [x] Håndterer ordning/sortering.
    - [x] Håndterer loading/error.
- [x] Del opp UI i rene komponenter:
  - [x] `<SearchFilters />`
  - [x] `<FacilityList />`
  - [x] `<FacilityMap />` (kartvisning).
- [x] Vurder bruk av `react-query` eller tilsvarende:
  - [x] Konfigurer queryClient.
  - [x] Bruk queries/mutations for datahenting/oppdatering.
- [x] Verifiser flyt:
  - [x] Bruker søker.
  - [x] Får opp liste + kart.
  - [x] Klikk på facility fører til riktig detaljside.

### 4.2 Booking-flyt og checkout
- [x] Gå gjennom `src/pages/Checkout.tsx`:
  - [x] Identifiser direkte Supabase-kall.
  - [x] Identifiser logikk for “bruker er ikke logget inn”.
- [x] Flytt datalogikk til dedikert service/hook:
  - [x] `useCheckoutLogic`.
- [x] Sørg for at:
  - [x] Ikke-innlogget bruker blir sendt til login.
  - [x] Etter login kommer bruker tilbake til samme booking-flyt.
  - [x] Feil i booking (manglende felter, kollisjon, RLS-feil) gir tydelige feilmeldinger.
- [x] Verifiser at det finnes en tydelig kvitteringsside etter fullført booking.

---

## 5. Roller, rutevern og admin-/staff-skille

### 5.1 Rolle-modell
- [x] Dokumenter alle roller i systemet:
  - [x] `owner`
  - [x] `admin`
  - [x] `staff` (deprecated, mapped to `case_handler`)
  - [x] `user` (kunde/sluttbruker).
- [x] Definer en rolle-matrise i kode (f.eks. `roles.ts`):
  - [x] `ROLE_ADMIN = ['owner', 'admin']`
  - [x] `ROLE_STAFF = ['case_handler']`
  - [x] `ROLE_USER = ['customer']`
- [x] Beskriv i `docs/security/ROLES_AND_PERMISSIONS.md` hvilke roller som:
  - [x] Har tilgang til adminpanel.
  - [x] Har tilgang til saksbehandler/staff-panel.
  - [x] Har kun sluttbruker-tilgang.

### 5.2 Protected routes og AdminRoutes
- [x] Gå gjennom `AdminRoutes.tsx` og `ProtectedRoute`-komponent.
- [x] Sørg for at:
  - [x] Admin-ruter kun krever roller i `ROLE_ADMIN`.
  - [x] Evt. staff-ruter krever roller i `ROLE_STAFF`.
  - [x] Ikke-autoriserte brukere får:
    - [x] Forutsigbar redirect (f.eks. til /login eller /unauthorized).
- [x] Test manuelt med ulike brukere:
  - [x] Admin-bruker.
  - [x] Staff-bruker.
  - [x] Vanlig bruker.
  - [x] Ikke-innlogget.

### 5.3 Skjule admin-funksjoner for staff
- [x] Gå gjennom `AdminLayout` og tilhørende navigasjon.
- [x] Identifiser menypunkter som KUN skal være tilgjengelig for system-/org-admin:
  - [x] Integrations.
  - [x] Audit log.
  - [x] Data retention.
  - [x] Localization (system-nivå).
- [x] Legg inn rolle-basert visning:
  - [x] Skjul disse menypunktene fullstendig for `staff` og `user`.
- [x] Verifiser at staff fortsatt har tilgang til:
  - [x] Daglig driftsrelevante moduler (bookinger, kalender, saksbehandling, etc.) etter forventet rolle.

---

## 6. Testing, kvalitet og CI

### 6.1 Enhetstester
- [x] Gå gjennom `tests/unit`:
  - [x] Kartlegg hvilke UI-komponenter som har tester.
  - [x] Identifiser kritiske komponenter som mangler tester (f.eks. komplekse formularer, bookingkomponenter).
- [x] Legg til tester for:
  - [x] Viktige UI-komponenter i booking-flyten.
  - [x] Viktige admin-komponenter (saksbehandling, godkjenning).

### 6.2 Integrasjonstester / flyt-tester
- [x] Opprett eller utvid integrasjonstester for:
  - [x] “Happy path” booking:
    - [x] Bruker søker etter lokale.
    - [x] Går til facility-detaljside.
    - [x] Starter booking.
    - [x] Fyller ut nødvendig informasjon.
    - [x] Går gjennom checkout.
    - [x] Får kvittering.
  - [x] Ikke-innlogget bruker:
    - [x] Prøver å booke.
    - [x] Blir sendt til login.
    - [x] Returnerer til riktig steg etter login.
  - [x] Admin-flyt:
    - [x] Admin ser liste over bookinger.
    - [x] Admin godkjenner en booking.
    - [x] Admin avviser en booking.
  - [x] Rollebegrensning:
    - [x] Staff med feil rolle får ikke tilgang til `/admin`.
    - [x] Vanlig bruker får ikke tilgang til admin-panel.

### 6.3 CI-oppsett (beskrives tydelig)
- [x] Opprett `docs/dev/CI_SETUP.md`.
- [x] Dokumenter at følgende kommandoer skal kjøre i CI:
  - [x] `npm run lint`
  - [x] `npm run test`
  - [x] `npm run build`
- [x] Beskriv ønsket pipeline (GitHub Actions / Azure DevOps / annen):
  - [x] Steg for installasjon (caching av node_modules).
  - [x] Steg for lint.
  - [x] Steg for test.
  - [x] Steg for build.
- [x] Verifiser at prosjektet bygger og tester grønt lokalt før CI-konfig settes opp.

---

## 7. Repo-hygiene og dokumentasjon

### 7.1 Fjerne støy og tunge kataloger
- [x] Sørg for at `node_modules/` ikke ligger i repo:
  - [x] Sjekk `.gitignore` for `node_modules`.
- [x] Sørg for at `.qoder/` og andre AI-spesifikke arbeidsmapper er ekskludert:
  - [x] Legg til relevante oppføringer i `.gitignore`.
- [x] Kontroller at bygg-artefakter ikke er committed (dist, build, coverage osv.).

### 7.2 Rydde i `docs/`
- [x] Identifiser dokumenter som faktisk er nyttige for utviklere:
  - [x] `docs/README.md`.
  - [x] `docs/adr/*` (arkitekturvalg).
  - [x] `docs/features/*` (feature-spesifikke beskrivelser).
  - [x] `docs/data/*` (datamodell, Supabase).
  - [x] `docs/testing/*` (teststrategi).
- [x] Identifiser AI-rapporter og støy:
  - [x] "A_PLUS_SUMMARY".
  - [x] "MASTER_COMPREHENSIVE_ANALYSIS".
  - [x] Andre meta-rapporter som ikke trengs for daglig utvikling.
- [x] Flytt slike filer til:
  - [x] Egen arkivmappe (`docs/archive/`) ELLER
  - [x] Fjern dem helt hvis de ikke har verdi.
- [x] Oppdater `docs/README.md` med:
  - [x] Kort oversikt over struktur og hvor man finner hva.

### 7.3 Environment-filer
- [x] Døp om eksisterende `/.env.local` mal til `.env.example` (uten reelle hemmeligheter).
- [x] Sørg for at `.env.local` og `.env.test` er i `.gitignore`.
- [x] Oppdater `README.md`:
  - [x] Beskriv:
    - [x] "Kopier `.env.example` til `.env.local` og fyll inn egne verdier."
- [x] Verifiser at ingen sensitive nøkler er committed.

---

## 8. Sikkerhet og kortfattet "security-story"

- [x] Opprett `docs/security/SECURITY_MODEL.md`.
- [x] Beskriv kort:
  - [x] At Supabase RLS brukes som primær datatilgangskontroll.
  - [x] Hvordan organisasjoner, brukere og memberships henger sammen.
  - [x] Hvordan roller (`owner`, `admin`, `staff`, `user`) begrenser tilgang.
  - [x] Hvilke tabeller er eksponert til klienten og under hvilke betingelser.
- [x] Legg inn referanse til relevante RLS-migrations-filer.
- [x] Verifiser at modellen er konsistent med faktisk implementert kode og policies.

---