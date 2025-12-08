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
- [ ] Globale søk etter `<button` i prosjektet
- [ ] Lag liste over filer som bruker rå knapper
- [ ] Bekreft alle filene før refaktorering

## B2. Erstatt med UI-designsystemet
- [ ] Alle primære handlinger bruker `Button` variant="primary"
- [ ] Alle sekundære handlinger bruker `Button` variant="secondary" eller "ghost"
- [ ] Alle ikonhandlinger bruker `Button` variant="ghost" size="icon"
- [ ] Ingen hardkodede Tailwind-farger (`bg-blue-500` etc.) i knapper
- [ ] Alle knapper er tilgjengelige og har riktig focus-ring

## B3. Oppdater dokumentasjon
- [ ] Oppdater `docs/ui/DESIGN_SYSTEM.md`
- [ ] Legg inn:
  - [ ] Liste over knappevarianter
  - [ ] Liste over størrelser
  - [ ] Eksempler på riktig og feil bruk  
  - [ ] Kort regel for hva som er CTA og sekundær handling

---

# C. Rydding i roller og navigasjon

## C1. Juster AdminSidebar
Følgende menyelementer skal være **admin-only**:

- [ ] Integrations  
- [ ] Reports  
- [ ] Audit Log  
- [ ] Data Retention  
- [ ] Localization  

Sjekk at `requiredRole` settes til `"admin"` for alle ovenfor.

## C2. Dokumenter rolleansvar
Opprett fil: `docs/security/ROLES_AND_PERMISSIONS.md`

Innhold som skal inkluderes:
- [ ] Rolleliste: owner, admin, staff, customer
- [ ] Tilgangstabell for menyer (admin vs staff)
- [ ] Hvilke CRUD-operasjoner hver rolle kan gjøre
- [ ] Hvordan roller matcher RLS-policyer

## C3. Oppdater ProtectedRoute
- [ ] Sørg for at ProtectedRoute samsvarer med adminsider/rollene
- [ ] Test manuelt:
  - [ ] Staff får ikke se admin-only moduler  
  - [ ] Customer får kun user-dashboard  
  - [ ] Admin får tilgang til alt relevant  

---

# D. RLS-stramming i Supabase

## D1. Stram `organizations` policy
- [ ] Finn nåværende policy `using (true)`
- [ ] Erstatt med scoped policy:

create policy org_read_scoped on organizations
for select using (
is_platform_admin()
or exists (
select 1 from memberships m
where m.org_id = id
and m.user_id = auth.uid()
)
);


- [ ] Test at kun medlemmer kan lese egne org-data

## D2. Stram `tags` policy
- [ ] Finn policy som tillater fri lesing  
- [ ] Bytt ut med org-scope-basert policy  
- [ ] Verifiser at tags kun synliggjøres for riktig tenant

## D3. Oppdater sikkerhetsdokumentasjon
Opprett fil: `docs/security/SECURITY_MODEL.md`

Skal inneholde:
- [ ] Forklaring av multi-tenant-modellen  
- [ ] Oversikt over RLS-policyer  
- [ ] Hvordan roller + memberships begrenser tilgang  
- [ ] Liste over strammete policies  

---

# E. Endelig verifisering

## E1. Sjekk at ingen Supabase-kall finnes i UI-laget
- [ ] Ingen `supabase.from` eller `supabase.auth` i:
  - [ ] pages/
  - [ ] layouts/
  - [ ] UI-komponenter  

## E2. Knapper er konsistente
- [ ] Alle knapper følger design-system
- [ ] Ingen rå knapper gjenglemt

## E3. Roller fungerer riktig
- [ ] Staff ser ikke admin-moduler
- [ ] Admin ser full meny
- [ ] Kunde ser kun bruker-funksjoner

## E4. RLS-policyer fungerer korrekt
- [ ] Kun autoriserte users ser egne org-data
- [ ] Tags og metadata er tenant-isolerte

## E5. Dokumentasjon oppdatert
- [ ] DESIGN_SYSTEM.md oppdatert
- [ ] ROLES_AND_PERMISSIONS.md opprettet
- [ ] SECURITY_MODEL.md opprettet

---

# Final Expected Outcome

Når alle checkmarks er satt:

- UI-laget er rent, uten Supabase-lekkasje  
- Designsystemet er komplett og konsistent  
- Rolletilgangen fungerer profesjonelt (admin vs staff vs customer)  
- RLS er stram og trygg for kommunal bruk  
- Dokumentasjonen gjenspeiler faktisk implementasjon  
- Prosjektet er **klart for produksjonskvalitet**  

