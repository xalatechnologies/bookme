# booknor — Frontend-first sjekkliste (STRICT Standards Edition)

> Formål: Implementer hele UI/UX med **dummy data først** via adapter-lag, i tråd med prosjektets regler og standarder fra `/docs/standards/*` og krav i PRD/SRSD. Ingen businesslogikk i komponenter. Alt via veldefinerte adaptere, zod-validering og MSW. Etterpå byttes adaptere til Supabase/Stripe uten UI-endringer.

## Fase 0 — Regelverk, kvalitet og porter
- [ ] **TypeScript-konfig (STRICT)** i rot og per pkg, i tråd med `docs/standards/typescript-standards.md`:
  - `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitOverride: true`, `noFallthroughCasesInSwitch: true`.
  - `paths` for `@ui/*`, `@types/*`, `@utils/*`, `@mocks/*`.
  - Alle funksjoner har **eksplisitte returtyper**. Preferer `readonly` og `as const`.
- [ ] **ESLint/Prettier** i tråd med `coding-standards.md` og `code-style.md`:
  - ESLint: react, jsx-a11y, import, unicorn, ts-eslint. Forby `any`, `console.*` i prod, ubrukte imports.
  - Prettier: standard config, 2 spaces, semi, single quotes, printWidth 100.
  - Lint-staged + husky: kjør `lint`, `typecheck`, `test` på pre-commit.
- [ ] **Navngivning og struktur** som i `code-style.md`:
  - Components PascalCase, utils camelCase, typer PascalCase, konstante SCREAMING_SNAKE_CASE.
  - Mappestruktur per `coding-standards.md` (ui, icons, blocks, features).
- [ ] **shadcn/ui-integrasjon** pr `ui-components.md`:
  - Avhengigheter: `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`.
  - `components.json` konfigurert med shadcn/ui paths og theming.
  - `app/layout.tsx` med `ThemeProvider` og CSS variables for theming.
- [ ] **HTML/CSS/Icons-stil** etter `code-style/html-style.md`, `css-style.md`, `ui-components.md`.
- [ ] **WCAG 2.2 AA** obligatorisk: tastatur, aria, kontrast. Ingen tapp-feller.
- [ ] **Security & Privacy**: grunnleggende ISO 27001-hygiene, ingen secrets i klient, .env håndteres via Vercel Secrets/GitHub Secrets.
- [ ] **Kvalitetsporter i CI**: Lint + typecheck må være grønne. Testdekning min 80% på utils og adaptere. Playwright smoke på mock.

Akseptanse: `pnpm dev` starter i mock-modus, Storybook kjører, lint og typecheck grønne, shadcn/ui tema aktivt.

## Fase 1 — Monorepo og baselayers
- [ ] Struktur
  - `/apps/web` Next.js 15 App Router, `"use client"` kun der nødvendig.
  - `/packages/ui` Tailwind preset, shadcn/ui komponenter, tilgjengelige UI-komponenter.
  - `/packages/types` domene-typer + zod-schema.
  - `/packages/utils` dato/tid (Luxon), valuta, prisberegning, featureFlags.
  - `/packages/mocks` faker-seed og MSW helpers.
- [ ] Scripts (root): `dev`, `build`, `lint`, `typecheck`, `test`, `e2e`, `storybook`, `prettier:check`.
- [ ] Importalias og TS path-mapping.
Akseptanse: turborepo bygger alle pakker; imports funker uten relative stier.

## Fase 2 — Designsystem og tokens
- [ ] Tailwind preset: fargepalett, spacing, radius, skygger, fokus-states per standards.
- [ ] `globals.css`: typografi, mørk/lys-støtte, reduser bevegelse respekt.
- [ ] UI-kit i `@ui`: Button, Input, Select, Modal, Card, Badge, Rating, Tabs, Pagination, EmptyState, Skeleton, Alert.
- [ ] Storybook med docs-tab og a11y-addon.
Akseptanse: alle UI-komponenter dokumentert i Storybook; axe 0 kritiske feil.

## Fase 3 — Domene-typer og validering
- [ ] Typer og zod: `Profile`, `VenueType`, `Venue`, `Availability`, `Booking`, `BookingStatus`, `Payment`, `Message`, `Review` i tråd med PRD/SRSD.
- [ ] Pris-API i `@utils/pricing`: time/dag, 30-min avrunding, min 1 time, valuta-formattering.
- [ ] Egendefinert error-typologi: `Result<T, E>` eller `Either`-mønster for adaptere.
Akseptanse: 100% branch coverage i utils med Vitest.

## Fase 4 — Mock-datasjikt
- [ ] MSW handlers i `apps/web/src/mocks/handlers.ts` for:
  - `/api/auth`, `/api/venues`, `/api/availability`, `/api/bookings`, `/api/messages`, `/api/reviews`, `/api/payments`.
- [ ] Faker seed i `@mocks/seed`: 12 venues, 60 reviews, 25 bookings, to roller (tenant/landlord).
- [ ] `dataClient` + adapterkontrakter i `apps/web/src/data`:
  - `auth.adapter`, `venues.adapter`, `availability.adapter`, `bookings.adapter`, `messages.adapter`, `reviews.adapter`, `payments.adapter`.
  - Alle returnerer zod-validerte objekter; aldri `any`.
- [ ] React Query klient med retry, staleTime per ressurs, errorBoundary integrasjon.
Akseptanse: alle adapterkall fungerer i mock; tilfeldig 5% 4xx/5xx simulert uten å brekke UI.

## Fase 5 — Navigasjon og sider (UI + dummy)
- [ ] Ruter: `/`, `/search`, `/venue/[id]`, `/booking/new`, `/booking/[id]`, `/dashboard`, `/auth/signin`.
- [ ] Home: hero med søkefelt (by, fra/til, type), utvalgte venues.
- [ ] Search: filterpanel (type, kapasitet, pris, rating, tilgjengelighet), liste, sortering, paginering.
- [ ] Venue: galleri, tittel, rating, pris, kapasitet, tabs (Beskrivelse, Tilgjengelighet, Regler, Anmeldelser), DateTime-picker, “Sjekk pris” (mock `quote()`).
- [ ] Booking wizard: 1 Detaljer → 2 Oppsummering → 3 Betaling (dummy) → 4 Kvittering. Zustand/Context for state.
- [ ] Dashboard: Tenant (bookinger, kvitteringer, meldinger) og Landlord (venues, kommende bookinger, meldinger, dummy omsetning).
- [ ] Auth: mock sign-in som toggler rolle og profil.
Akseptanse: full happy-path på mock fra søk til kvittering; dashboard reflekterer booking.

## Fase 6 — Komponentdetaljer og tilgjengelighet
- [ ] Inputs: datovelger, tidsvelger, number stepper, pris-slider, multi-select. Semantisk markup og labels/aria-*.
- [ ] Kalender: ukevisning med blackout/åpningstider i henhold til standard CSS/HTML-guidene.
- [ ] Cards: `VenueCard` med bilde, pris, rating, CTA.
- [ ] Modals: avbryt booking, bekreft sletting, policy.
- [ ] Notifikasjoner: Toasts og Alerts for suksess/feil.
Akseptanse: Tabb-rekkefølge er logisk; fokus synlig; skjermleser leser feltene riktig.

## Fase 7 — Meldinger (mock realtime)
- [ ] Booking-detalj viser chat-tråd; polling 5s i mock.
- [ ] `messages.adapter`: `listByBooking`, `send`. Optimistic update.
Akseptanse: To nettlesere ser nye meldinger innen 5 sekunder.

## Fase 8 — Anmeldelser (mock)
- [ ] Etter “completed” booking kan rating/kommentar opprettes.
- [ ] `reviews.adapter`: `create`, `listByVenue`; snitt-rating vises i header og kort.
Akseptanse: Snitt oppdateres og reflekteres i søk/venue-side.

## Fase 9 — Tomtilstander, skjeletter og feiltilstander
- [ ] Skeletons for lister/detaljer, EmptyState-komponenter for null-resultater.
- [ ] Tilfeldige 4xx/5xx fra MSW håndteres i UI med feilmeldinger og retry.
Akseptanse: Ingen ukontrollerte exceptions; brukervennlig feilhåndtering.

## Fase 10 — Testing
- [ ] Unit: utils, adaptere (zod), UI-komponenter.
- [ ] Integration: søkeflyt, wizard-flyt, dashboard-rollefilter.
- [ ] E2E (Playwright): landing → søk → venue → quote → wizard → kvittering.
- [ ] Accessibility-tests: axe i Storybook + E2E a11y-sjekk.
Akseptanse: `pnpm test` grønt; E2E passerer i mock; dekning ≥ 80% for utils/adaptere.

## Fase 11 — Observability i dev
- [ ] Strukturert logging av nøkkelhendelser (quote beregnet, steg fullført, adapter-feil).
- [ ] Dev-banner som viser `DATA_MODE` og rolle.
Akseptanse: Loggene er nyttige og ikke-bråkete.

## Fase 12 — Live-tilkobling uten UI-endringer
> Bytt adaptere én og én. UI er hellig.
- [ ] Auth → Supabase Auth. Opprett `profiles` ved første innlogging. RLS dokumentert.
- [ ] Venues → Supabase (liste, getById, søk m/fulltekst). Signerte URLer for bilder.
- [ ] Availability → Supabase (uke + unntak). Prisberegning kan fortsatt være i front for MVP.
- [ ] Bookings → Supabase RPC/server-route med transaksjon og låsing for kollisjonskontroll.
- [ ] Payments → Stripe Payment Intent server-side. Webhook oppdaterer `payments` og `bookings`.
- [ ] Messages/Reviews → Supabase Realtime/DB.
Akseptanse: Staging med `DATA_MODE=live` speiler mock-UX. Samtidige bookinger kolliderer aldri i prod.

## Fase 13 — Ytelse, i18n og tilgjengelighet sluttkontroll
- [ ] Lighthouse ≥ 90 på Performance/Accessibility/Best Practices i dev build.
- [ ] i18n nb/en med fallback. Tekstnøkler organisert per feature.
- [ ] Bildeoptimalisering med Next/Image; memoisering av dyre komponenter.
Akseptanse: Mål oppnådd uten funksjonelle regressioner.

## Fase 14 — CI/CD og kvalitetsporter
- [ ] GitHub Actions: `lint`, `typecheck`, `test`, `e2e` (mock), Vercel preview på PR.
- [ ] Code owners og obligatorisk review. Conventional Commits.
- [ ] Quality Gates: build blocker ved brudd på standardene (lint/type/test/e2e/a11y).
Akseptanse: Hver PR får preview; alle porter grønne før merge.

## Fase 15 — Dokumentasjon og operasjon
- [ ] `/docs/frontend-first.md`: mock-arkitektur, adapterkontrakter, dataflyt, overgangsplan til live.
- [ ] `/docs/api-adapters.md`: signaturer, input/output (zod), feiltyper, kontrakttester.
- [ ] `/docs/runbook.md`: bytte av data-modus, seeding, feilsøk.
- [ ] `/docs/security.md`: RLS-oversikt, DPIA-stubb, baseline ISO 27001 kontroller (tilgang, backup, logging).
Akseptanse: Ny utvikler kan starte på <15 min og bytte til live uten UI-endringer.

### Qoder prompt-mal
Rolle: Senior Fullstack. Følg standardene. Returner patch-diff.
Kontekst: Next.js 15, Tailwind, shadcn/ui, MSW, React Query, zod, Luxon. Frontend-first, mock.
Oppgave: [konkret sjekkpunkt fra fasen]
Akseptanse: [tilsvarende akseptansekriterier]
Output: Kodeendringer, tester, Storybook, korte commit-meldinger.

Eksempel:
```text
Oppgave: Implementer `venues.adapter` (mock) med list/search/getById + zod validering. Lag MSW handlers og faker-seed.
Akseptanse: `/search` og `/venue/[id]` rendrer data fra mock; zod validerer; Playwright-test klikker inn og verifiserer pris.
```

### Definition of Done (hver oppgave)
- Typed + zod-validert
- Tilgjengelig og responsiv
- Tester skrevet og grønne (unit/integration/E2E)
- Storybook-stories oppdatert
- Dokumentasjon oppdatert
- Feature-flag støtter mock vs live
