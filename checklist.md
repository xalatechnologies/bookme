# BookMe – Implementation Package 3  
Supabase-refaktorering • UI-standardisering • Roller • RLS-stramming

Målet med denne pakken er å fullføre de viktigste punktene som gjenstår før BookMe kan anses som ferdigstilt på profesjonelt nivå.  
Alle oppgaver under skal utføres, verifiseres og krysses av.

---

# A. Supabase ut av UI-laget

## A1. Kartlegg alle direkte supabase-imports
- [x] Søk etter `import { supabase }` i hele prosjektet  
- [x] Lag liste over alle filer som fortsatt bruker Supabase direkte utenfor services-layer  
- [x] Bekreft at følgende skal refaktoreres:
  - [x] `src/pages/Index.tsx`
  - [x] `src/pages/Checkout.tsx`
  - [x] `src/components/layouts/PublicLayout/GlobalHeader.tsx`
  - [x] Alle hooks som henter data direkte i `src/hooks/*`

## A2. Flytt logikk ut i dedikerte hooks
- [x] Opprett/oppdater hook: `useFacilitySearchPage.ts`
- [x] Opprett hook: `useCheckoutLogic.ts`
- [x] Opprett hook: `useAuthHeaderInfo.ts`
- [x] Flytt all datahenting, filtrering, mapping og redirect-logikk ut av:
  - [x] Index.tsx  
  - [x] Checkout.tsx  
  - [x] GlobalHeader.tsx  

## A3. Koble pages om til rendrings-lag
- [x] Index.tsx rendrer kun UI basert på hook
- [x] Checkout.tsx rendrer kun UI basert på hook
- [x] GlobalHeader.tsx bruker kun context/hook, ikke Supabase
- [x] Bekreft at ingen UI/page-komponent importerer Supabase-klienten

---

# B. Standardisering av knapper (UI-system)

## B1. Oppdag alle rå `<button>`
- [x] Globale søk etter `<button` i prosjektet
- [x] Lag liste over filer som bruker rå knapper
- [x] Bekreft alle filene før refaktorering

## B2. Erstatt med UI-designsystemet
- [x] Alle primære handlinger bruker `Button` variant="primary"
- [x] Alle sekundære handlinger bruker `Button` variant="secondary" eller "ghost"
- [x] Alle ikonhandlinger bruker `Button` variant="ghost" size="icon"
- [x] Ingen hardkodede Tailwind-farger (`bg-blue-500` etc.) i knapper
- [x] Alle knapper er tilgjengelige og har riktig focus-ring

## B3. Oppdater dokumentasjon
- [x] Oppdater `docs/ui/DESIGN_SYSTEM.md`
- [x] Legg inn:
  - [x] Liste over knappevarianter
  - [x] Liste over størrelser
  - [x] Eksempler på riktig og feil bruk  
  - [x] Kort regel for hva som er CTA og sekundær handling

---

# C. Rydding i roller og navigasjon

## C1. Juster AdminSidebar
Følgende menyelementer skal være **admin-only**:

- [x] Integrations  
- [x] Reports  
- [x] Audit Log  
- [x] Data Retention  
- [x] Localization  

Sjekk at `requiredRole` settes til `"admin"` for alle ovenfor.

## C2. Dokumenter rolleansvar
Opprett fil: `docs/security/ROLES_AND_PERMISSIONS.md`

Innhold som skal inkluderes:
- [x] Rolleliste: owner, admin, staff, customer
- [x] Tilgangstabell for menyer (admin vs staff)
- [x] Hvilke CRUD-operasjoner hver rolle kan gjøre
- [x] Hvordan roller matcher RLS-policyer

## C3. Oppdater ProtectedRoute
- [x] Sørg for at ProtectedRoute samsvarer med adminsider/rollene
- [x] Test manuelt:
  - [x] Staff får ikke se admin-only moduler  
  - [x] Customer får kun user-dashboard  
  - [x] Admin får tilgang til alt relevant  

---

# D. RLS-stramming i Supabase

## D1. Stram `organizations` policy
- [x] Finn nåværende policy `using (true)`
- [x] Erstatt med scoped policy:

create policy org_read_scoped on organizations
for select using (
is_platform_admin()
or exists (
select 1 from memberships m
where m.org_id = id
and m.user_id = auth.uid()
)
);


- [x] Test at kun medlemmer kan lese egne org-data

## D2. Stram `tags` policy
- [x] Finn policy som tillater fri lesing  
- [x] Bytt ut med org-scope-basert policy  
- [x] Verifiser at tags kun synliggjøres for riktig tenant

## D3. Oppdater sikkerhetsdokumentasjon
Opprett fil: `docs/security/SECURITY_MODEL.md`

Skal inneholde:
- [x] Forklaring av multi-tenant-modellen  
- [x] Oversikt over RLS-policyer  
- [x] Hvordan roller + memberships begrenser tilgang  
- [x] Liste over strammete policies  

---

# E. Endelig verifisering

## E1. Sjekk at ingen Supabase-kall finnes i UI-laget
- [x] Ingen `supabase.from` eller `supabase.auth` i:
  - [x] pages/
  - [x] layouts/
  - [x] UI-komponenter  

## E2. Knapper er konsistente
- [x] Alle knapper følger design-system
- [x] Ingen rå knapper gjenglemt

## E3. Roller fungerer riktig
- [x] Staff ser ikke admin-moduler
- [x] Admin ser full meny
- [x] Kunde ser kun bruker-funksjoner

## E4. RLS-policyer fungerer korrekt
- [x] Kun autoriserte users ser egne org-data
- [x] Tags og metadata er tenant-isolerte

## E5. Dokumentasjon oppdatert
- [x] DESIGN_SYSTEM.md oppdatert
- [x] ROLES_AND_PERMISSIONS.md opprettet
- [x] SECURITY_MODEL.md opprettet

---

# Final Expected Outcome

Når alle checkmarks er satt:

- UI-laget er rent, uten Supabase-lekkasje  
- Designsystemet er komplett og konsistent  
- Rolletilgangen fungerer profesjonelt (admin vs staff vs customer)  
- RLS er stram og trygg for kommunal bruk  
- Dokumentasjonen gjenspeiler faktisk implementasjon  
- Prosjektet er **klart for produksjonskvalitet**  

