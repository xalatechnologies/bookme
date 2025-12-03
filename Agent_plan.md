# BOOKME_FULL_SAAS_AGENT_PLAN.md

Formål: Gjøre Booknor om til en komplett SaaS-plattform for både kommunal og privat sektor.
Mål: Sikker, skalerbar og fleksibel løsning som styres via konfig, ikke forks.
Strategi: Først refaktorering til domener og funksjonell kjerne. Deretter SaaS-lag med multi-tenant konfig, regelmotor v2, tema og pakker.

---

## 0. Forutsetninger

- [ ] Repo: booknor-1
- [ ] Frontend: Vite + React + TypeScript + Tailwind + shadcn/ui + TanStack Query
- [ ] Backend: Supabase (Postgres) med PostGIS og RLS
- [ ] Domene-struktur i bruk: src/domains/*
- [ ] Klienter i src/lib/clients/* (supabase.ts, mapbox.ts, queryClient.ts)

---

# DEL 1 — REFARKTORERING OG ARKITEKTURGRUNNLAG

## 1) Preflight og hygiene

- [ ] Fjern hemmeligheter fra repo (kun .env.example i git)
- [ ] Bekreft at miljøvariabler leses via import.meta.env.VITE_*
- [ ] Sett krav: VITE_MAPBOX_TOKEN, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- [ ] Søk og fjern hardkodede tokens i hele repoet
- [ ] Kartfiler skal bruke src/lib/clients/mapbox.ts for token
- [ ] Ha kun én HTTP-klient i bruk (slett duplikater)

## 2) Domene- og mappestruktur

- [ ] Finaliser struktur:
  - [ ] src/domains/facilities/{services,hooks,types,mappers,ui}
  - [ ] src/domains/bookings/{services,hooks,types,mappers,ui}
  - [ ] src/domains/rules/{services,hooks,types,evaluators}
  - [ ] src/domains/billing/services
  - [ ] src/domains/config/{services,hooks,types}
  - [ ] src/lib/clients/{supabase.ts,mapbox.ts,queryClient.ts}
  - [ ] src/lib/location.ts
  - [ ] src/lib/utils/cn.ts
  - [ ] src/components/ui
  - [ ] src/components/common (states, tables, forms)
  - [ ] src/providers/AppProviders.tsx
  - [ ] src/tests
- [ ] Flytt alt fra src/components/features/* inn i relevante domener
- [ ] Slett dupliserte utils og tomme mapper etter flytting

## 3) PostGIS og datamodell

- [ ] Aktiver PostGIS i DB (create extension if not exists postgis;)
- [ ] Legg til facilities.geom geography(Point,4326)
- [ ] Backfill geom fra lat/lng der det finnes
- [ ] Opprett GIST-indeks på facilities.geom
- [ ] Indeksér bookings(org_id, facility_id, starts_at, ends_at)
- [ ] Partielt indeks på bookings(status) for pending/approved
- [ ] Legg på EXCLUDE-constraint som hindrer overlapp i bookings

## 4) RLS og tenant-sikring

- [ ] Aktiver RLS på facilities, bookings, booking_rules, invoices
- [ ] Policies basert på org_id = current_setting('app.org_id')::uuid
- [ ] Legg org_id i JWT claims
- [ ] Sett app.org_id per sesjon i Supabase-klienten (RPC/headers)

## 5) Regelmotor v1 (minimum levedyktig)

- [ ] Opprett src/domains/rules/types/Rule.ts (union-typer)
- [ ] Opprett src/domains/rules/evaluators/* (eval per regeltype)
- [ ] Opprett src/domains/rules/services/ruleEngine.ts (evaluateAll)
- [ ] Kall ruleEngine.evaluateAll i bookings/services/createBooking.ts før insert
- [ ] Returner 409 med violations[] ved brudd
- [ ] Enhetstester for hver regeltype

## 6) Standard UI-tilstander

- [ ] Opprett src/components/common/states/EmptyState.tsx
- [ ] Opprett src/components/common/states/ErrorState.tsx
- [ ] Opprett src/components/common/states/LoadingState.tsx
- [ ] Bruk disse i lister og kart
- [ ] PR-mal krever tom/feil/loader i alle nye views

## 7) QueryClient og caching

- [ ] Sett standarder i src/lib/clients/queryClient.ts:
  - [ ] staleTime: 5m
  - [ ] gcTime: 10m
  - [ ] retry: 2
  - [ ] refetchOnWindowFocus: false
- [ ] Innfør konsistente cache keys:
  - [ ] ['facilities', orgId, filters]
  - [ ] ['bookings', orgId, facilityId, rangeKey]

## 8) CI/CD og QA

- [ ] Opprett GitHub Actions for lint, typecheck, test, build
- [ ] Sett coverage gate ≥ 80 %
- [ ] Bygg skal feile ved typefeil

---

# DEL 2 — SAAS-LAG OG MULTI-TENANT KONFIG

## 9) SaaS-tabeller og seeds

- [ ] Opprett tabell features(org_id, key, enabled, rollout)
- [ ] Legg til organizations.settings (jsonb), organizations.branding (jsonb), organizations.plan (text)
- [ ] Opprett rule_packs(name, sector, rules jsonb)
- [ ] Opprett tenant_rules(org_id, pack_id, overrides jsonb)
- [ ] Slå på RLS/policies for disse tabellene

## 10) Config-domene og providers

- [ ] Opprett src/domains/config/services/featureToggle.ts
- [ ] Opprett src/domains/config/services/tenantSettings.ts
- [ ] Opprett src/domains/config/services/rulePacks.ts
- [ ] Opprett src/domains/config/hooks/useTenant.ts
- [ ] Opprett src/domains/config/hooks/useFeatures.ts
- [ ] Opprett src/domains/config/types/Config.ts
- [ ] Opprett TenantProvider som:
  - [ ] Leser organizations.settings, features, themes/tokens
  - [ ] Kombinerer Global defaults → Plan → Tenant settings → Feature toggles → Resource overrides
  - [ ] Eksponerer config via Context
- [ ] Opprett Feature-komponent for gating i UI

## 11) Planer og features

- [ ] Seed planoppsett:
  - [ ] starter: booking, rule_engine
  - [ ] pro: booking, rule_engine, stripe_payments
  - [ ] enterprise: booking, rule_engine, saksflyt, ehf_peppol, bankid
- [ ] Seed globale features (default av/på)
- [ ] Sammenstill effektive features i TenantProvider

## 12) Regelmotor v2 og rule packs

- [ ] Seed rule_packs:
  - [ ] common_basic (maxDuration, buffer)
  - [ ] public_communal (approvalRequired, priorityGroups)
  - [ ] private_pro (onlinePayment)
- [ ] Hent og flett globalDefaults + packRules + tenantOverrides i ruleEngine
- [ ] Legg støtte for fremtidige regeltyper uten breaking changes

## 13) Tema og branding

- [ ] Integrer ThemeProvider i TenantProvider
- [ ] Les organizations.branding (logo, farger, fonter)
- [ ] Les themes.tokens (dark/light, spacing, radius)
- [ ] Bytt farger, logo og fonter per tenant uten redeploy
- [ ] Støtt dark/light per tenant og per bruker

## 14) Onboarding-løp

- [ ] Self-serve privat:
  - [ ] /onboarding wizard: profil → plan → tema → første lokale
  - [ ] Opprett org + seed defaults ved fullføring
- [ ] Kommunal:
  - [ ] Admin oppretter org i dashboard
  - [ ] CSV-import av lokaler
  - [ ] Slå på saksflyt, ehf_peppol, bankid

## 15) Drift og observability

- [ ] Opprett/bruk audit_logs (append-only)
- [ ] Implementer auditLogger service og kall ved kritiske events
- [ ] Strukturert JSON-logging i FE
- [ ] Integrer Sentry og OpenTelemetry (valgfritt i dev)

## 16) Rapporter og eksport

- [ ] Utnyttelsesgrad per lokale/tidsrom (SQL view)
- [ ] CSV/Excel-eksport med signed URLs
- [ ] iCal-feeds per lokale/tenant med revokerbare tokens

## 17) Ytelse og bundling

- [ ] vite.config.ts: manualChunks for vendor, radix/shadcn, mapbox, i18n
- [ ] rollup-plugin-visualizer i dev/CI
- [ ] Lazy load tunge views, memo i lister/kartmarkører
- [ ] SLO: P95 booking POST < 400 ms, P95 page load < 2.5 s

## 18) Tilgjengelighet

- [ ] Kjør axe/lighthouse lokalt og i CI
- [ ] Fiks kontrast, labels/ARIA, tastaturnavigasjon, feiloppsummering
- [ ] Oppdater PR-mal med a11y-sjekk

## 19) Testing

- [ ] Enhet: regelmotor, feature toggles, tenant config
- [ ] Integrasjon: opprett tenant → les features → evaluer regel
- [ ] e2e (Playwright): onboarding → booking → saksbehandling → konflikt → rapport
- [ ] CI rapporterer coverage og feil

## 20) Integrasjoner bak toggles (skrues på senere)

- [ ] BankID/ID-porten (Criipto) under feature:bankid
- [ ] EHF/Peppol under feature:ehf_peppol
- [ ] Stripe/Vipps under feature:payments
- [ ] Outlook/Graph under feature:outlook_sync
- [ ] Health-sider per integrasjon for admin

---

# AKSEPTANSEKRITERIER (SaaS-klar)

- [ ] Ingen hemmeligheter i repo
- [ ] All data isolert via org_id + RLS/policies
- [ ] Overlapp nektes av DB-constraint
- [ ] Regelmotor håndhever regler før insert og returnerer violations[]
- [ ] Feature toggles styrer funksjoner i UI og API
- [ ] Tema/branding per tenant uten redeploy
- [ ] Onboarding-løp fungerer for privat og kommunal
- [ ] Rapporter/eksport og iCal fungerer per tenant
- [ ] CI feiler ved typefeil/testfeil; coverage ≥ 80 %
- [ ] A11y-sjekk passert i CI

---

# KORTE PATCHES (DROP-IN)

## SQL: PostGIS og indekser

- [ ] Kjør:
  - [ ] create extension if not exists postgis;
  - [ ] alter table facilities add column if not exists geom geography(Point,4326);
  - [ ] update facilities set geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography where geom is null and lat is not null and lng is not null;
  - [ ] create index if not exists facilities_geom_idx on facilities using gist (geom);
  - [ ] create index if not exists bookings_org_fac_time_idx on bookings (org_id, facility_id, starts_at, ends_at);
  - [ ] create index concurrently if not exists bookings_status_idx on bookings (status) where status in ('pending','approved');
  - [ ] alter table bookings drop constraint if exists no_overlap;
  - [ ] alter table bookings add constraint no_overlap exclude using gist (facility_id with =, tstzrange(starts_at, ends_at, '[)') with &&);

## SQL: RLS-policies (skisse, gjenta per tabell)

- [ ] Kjør:
  - [ ] alter table facilities enable row level security;
  - [ ] drop policy if exists tenant_read_fac on facilities;
  - [ ] create policy tenant_read_fac on facilities for select using (org_id = current_setting('app.org_id')::uuid);
  - [ ] drop policy if exists tenant_write_fac on facilities;
  - [ ] create policy tenant_write_fac on facilities for insert with check (org_id = current_setting('app.org_id')::uuid);

## TS: QueryClient

- [ ] Opprett/oppdater src/lib/clients/queryClient.ts:
  - [ ] export const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, gcTime: 600000, retry: 2, refetchOnWindowFocus: false } } });

## TSX: Feature gate

- [ ] Opprett src/domains/config/hooks/useFeatures.ts med has(key)
- [ ] Opprett src/domains/config/ui/Feature.tsx som gjemmer children når feature mangler

## TS: Regelmotor merge

- [ ] I src/domains/rules/services/ruleEngine.ts: deepMerge(globalDefaults, packRules, tenantOverrides)

---

# 12-UKERS LEVERANSESPOR

## Uke 1–2: Kjerne

- [ ] PostGIS, indekser, EXCLUDE-constraint
- [ ] RLS + policies + org_id i JWT
- [ ] Regelmotor v1
- [ ] QueryClient standarder
- [ ] Empty/Error/Loading i alle views

## Uke 3–4: SaaS-lag

- [ ] features, rule_packs, tenant_rules, organizations.settings/branding/plan
- [ ] TenantProvider + Feature-komponent
- [ ] Seed av planer og rule packs
- [ ] Onboarding wizard (privat)

## Uke 5–6: Rapport/eksport/tema

- [ ] Utnyttelsesrapporter + CSV/Excel eksport
- [ ] iCal-feeds med revokerbare tokens
- [ ] Tema/branding pr tenant

## Uke 7–8: Admin og ytelse

- [ ] Feature-toggle admin-UI
- [ ] Bundling/manualChunks + visualizer
- [ ] A11y-sjekk i CI

## Uke 9–12: Polering og e2e

- [ ] Full e2e-regresjon (onboarding → booking → saksflyt)
- [ ] Revisjonsvisning
- [ ] Observability (Sentry/OTel)
- [ ] Dokumentasjon (ADR + runbooks)
