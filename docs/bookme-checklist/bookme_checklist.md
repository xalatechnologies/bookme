# bookme — AI-implementeringssjekkliste (Qoder-ready)

> Dette er en komplett, handlingsdrevet sjekkliste som AI (Qoder) kan følge punkt for punkt for å bygge **bookme**. Hvert trinn er presist, med filstier, navngivning og akseptansekriterier. Kopier hele filen inn i Qoder før du starter.

---

## 0. Forutsetninger (må være ferdig før implementering)
- [ ] GitHub repo opprettet: `bookme` (privat). Hovedbranch `main` og beskyttelsesregler aktivert (krever PR, 1 godkjenning).
- [ ] Project-board i GitHub: `bookme-mvp` (To do / In progress / Review / Done).
- [ ] Supabase prosjekt opprettet (self-hosted eller Supabase Cloud). Postgres 15+.
- [ ] Supabase service role key og anon key tilgjengelig. URL notert.
- [ ] Stripe-konto aktivert i test-modus. Webhook endpoint vil settes senere.
- [ ] Domene eller midlertidig Vercel-prosjekt for frontend (kan settes senere).
- [ ] Lokal dev-miljø: Node 20+, pnpm 9+, OpenSSL.
- [ ] Secrets-manager bestemt: GitHub Actions secrets.
- [ ] Designvalg: Tailwind + Flowbite React. Basis token-konfig satt.

---

## 1. Monorepo og baseline
**Mål:** Opprett et ryddig Next.js 15 prosjekt med delt type- og utils-pakke.
- [ ] Opprett turborepo-struktur:
  - `/apps/web` (Next.js 15, App Router, TypeScript)
  - `/packages/ui` (delte komponenter, Tailwind-konfig, Flowbite-extensions)
  - `/packages/config` (eslint, tsconfig, tailwind-preset)
  - `/packages/types` (zod-skjema, delte typer: User, Venue, Booking, Payment)
- [ ] Init pnpm workspaces. `pnpm -w init`
- [ ] Legg til skript i root `package.json`: `build`, `dev`, `lint`, `typecheck`.
- [ ] ESLint + Prettier rigges med strenge regler. CI feiler ved brudd.
**Akseptanse:** `pnpm dev` starter web uten feil; CI kjører lint og typecheck grønt.

---

## 2. Basal Next.js-app og tema
- [ ] Opprett Next.js 15 App Router-prosjekt i `/apps/web` med `pnpm dlx create-next-app` (TypeScript, Tailwind, ESlint on).
- [ ] Installer `flowbite-react`, `flowbite`, `tailwindcss-animate`.
- [ ] Konfigurer Tailwind: legg til Flowbite-plugin i `tailwind.config.ts`. Del preset fra `/packages/config`.
- [ ] Lag grunnleggende layout: `/apps/web/app/layout.tsx` med navbar, footer, `<ThemeProvider>`.
- [ ] Sider: `/`, `/search`, `/venue/[id]`, `/dashboard`, `/auth/callback`.
**Akseptanse:** Landing-page bygger og viser “bookme” med nav, søkefelt, CTA.

---

## 3. Miljøvariabler og konfig
Opprett `.env` i root og `apps/web/.env.local`.
- [ ] `NEXT_PUBLIC_SUPABASE_URL=`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- [ ] `SUPABASE_SERVICE_ROLE=` (kun i CI/Server)
- [ ] `DATABASE_URL=` (direct Postgres for Prisma, bruk `pgbouncer` senere)
- [ ] `STRIPE_SECRET_KEY=`
- [ ] `STRIPE_WEBHOOK_SECRET=` (legges etter webhook-oppsett)
- [ ] `NEXT_PUBLIC_APP_URL=` (for callback/redirects)
**Akseptanse:** App starter lokalt uten manglende env-feil.

---

## 4. Supabase: database, RLS og storage
Kjør via SQL editor eller migra med Prisma.
### 4.1 Tabeller (minimum)
- [ ] `profiles` (id uuid pk, email, full_name, role enum: 'landlord'|'tenant'|'admin', rating numeric, created_at)
- [ ] `venues` (id uuid pk, owner_id fk→profiles.id, title, description, address, city, capacity int, type enum, rules jsonb, base_price_cents int, price_unit enum: 'hour'|'day', time_zone text, created_at)
- [ ] `venue_assets` (id, venue_id fk, path text, alt text, is_cover bool)
- [ ] `availability` (id, venue_id fk, weekday int, start_time time, end_time time, exceptions daterange[], blackout daterange[])
- [ ] `bookings` (id, venue_id fk, tenant_id fk, start_ts timestamptz, end_ts timestamptz, status enum: 'pending'|'confirmed'|'canceled'|'completed'|'refunded', total_cents int, currency text, created_at)
- [ ] `payments` (id, booking_id fk, stripe_payment_intent text, escrow_status enum: 'held'|'released'|'refunded', created_at)
- [ ] `messages` (id, booking_id fk, sender_id fk, body text, created_at)
- [ ] `reviews` (id, booking_id fk, from_id fk, to_id fk, rating int, comment text, created_at)
### 4.2 RLS policy (eksempler)
- [ ] `profiles`: bruker kan lese seg selv; admin kan lese alle.
- [ ] `venues`: eier kan CRUD egne; alle kan READ publiserte.
- [ ] `bookings`: leietaker ser egne; eier ser for sine venues.
- [ ] `messages`: kun tilknyttede parter kan lese/ skrive.
### 4.3 Storage
- [ ] Bucket `venue-images` med public read via signed URLs.
**Akseptanse:** RLS testet med SQL; ulovlige queries feiler, lovlige lykkes.

---

## 5. Prisma + migrasjoner
- [ ] Legg `prisma` i root, `schema.prisma` med `provider = "postgresql"` og `previewFeatures = ["fullTextSearch"]` om ønsket.
- [ ] Generer modeller for tabeller i 4.1.
- [ ] Kjør `pnpm prisma migrate dev -n init` mot `DATABASE_URL`.
- [ ] Lag seeds i `prisma/seed.ts` for 2 brukere, 2 venues, enkel availability.
**Akseptanse:** `pnpm prisma migrate dev` kjører grønt og seed opprettes.

---

## 6. Supabase Auth og profil-synk
- [ ] Sett opp `@supabase/ssr` klient for Next.js App Router.
- [ ] On-auth: når bruker registreres, opprett rad i `profiles` med default role 'tenant'.
- [ ] Lag `GET /api/auth/callback` for post-sign in ruting.
**Akseptanse:** Innlogging fungerer; `profiles` oppdateres automatisk.

---

## 7. tRPC API-lag
Opprett `/apps/web/src/server` med tRPC via `@trpc/server` og `@trpc/react-query`.
Routers:
- [ ] `auth` (getSession, getProfile)
- [ ] `venues` (create/update/delete by owner, getById, search)
- [ ] `availability` (getWeekly, addException, addBlackout)
- [ ] `bookings` (quote, create, cancel, confirm, complete)
- [ ] `payments` (createPaymentIntent, handleWebhook) kun server
- [ ] `messages` (listByBooking, send)
- [ ] `reviews` (create, listByVenue)
**Akseptanse:** tRPC type-sikkert end-to-end; Zod validering for input/output.

---

## 8. Søk og filtrering
- [ ] Fulltekst-søk på `venues.title, city, description` med Postgres tsvector.
- [ ] Filtre: type, kapasitet, pris, rating, tilgjengelighet.
- [ ] Paginering og sortering (pris, rating, nyeste).
**Akseptanse:** `/search` returnerer konsistente resultater under 300 ms lokalt.

---

## 9. Bookinglogikk og prising
- [ ] Quote-endepunkt beregner pris: time- eller dagsbasert, min. varighet 1 time, avrunding til nærmeste 30 min.
- [ ] Kolliderende bookinger avvises med transaksjon og `FOR UPDATE`-lås på tidsintervall.
- [ ] Tidsonehåndtering via venue.time_zone og `luxon` på klient.
**Akseptanse:** To samtidige bestillinger på samme slot gir maks én bekreftet.

---

## 10. Stripe og escrow
- [ ] `payments.createPaymentIntent`: total_cents, currency, metadata {bookingId}
- [ ] Webhook `/api/stripe/webhook`: håndter `payment_intent.succeeded`, `payment_intent.canceled`, `charge.refunded`.
- [ ] Escrow: ved `completed` frigjør utbetaling via Stripe Transfers eller balansekonto (avhenger av oppsett). I MVP kan “release” være markering for senere manuell utbetaling.
- [ ] Refusjon: ved kansellering innen regler, kall Stripe refund.
**Akseptanse:** Test-eventer fra Stripe CLI oppdaterer `payments` og `bookings` korrekt.

---

## 11. Varsler
- [ ] E-post via Resend/Sendgrid: bekreftelser, påminnelser, nye meldinger.
- [ ] In-app toast og dashboard-varsler.
- [ ] Cron-jobb (Supabase Edge Function eller GitHub Actions) for påminnelse 24 t før booking.
**Akseptanse:** Test-mock sender e-post lokalt; events trigges riktig.

---

## 12. Meldinger
- [ ] Realtime meldinger per booking via Supabase Realtime kanal `booking:{id}`.
- [ ] Basal chat UI i booking-detaljside.
**Akseptanse:** To nettlesere kan sende/lese meldinger live.

---

## 13. Anmeldelser og rating
- [ ] Etter `completed` kan partene gi rating 1–5 og kommentar.
- [ ] Beregn gjennomsnittsrating per venue i materialisert view eller ved spørring.
**Akseptanse:** Nye ratings vises på venue-siden og i søkefiltre.

---

## 14. Dashboard
- [ ] `/dashboard` med to visninger: Landlord og Tenant.
- [ ] Landlord: mine venues, kommende bookinger, inntektsoversikt (dummy i MVP), meldinger.
- [ ] Tenant: mine bookinger, meldinger, kvitteringer.
**Akseptanse:** Bytte mellom roller fungerer; data filtreres korrekt.

---

## 15. Tilgjengelighet og universell utforming
- [ ] WCAG 2.2 AA: tastaturnavigasjon, fokus-stater, aria-labels, kontrast.
- [ ] Skjemaer med tydelige feilmeldinger og `aria-describedby`.
**Akseptanse:** Axe-sjekk uten kritiske feil; tabbsekvens er logisk.

---

## 16. Sikkerhet og personvern (GDPR)
- [ ] HTTPS overalt. Ingen secrets i klient.
- [ ] RLS på alle tabeller med personopplysninger.
- [ ] Samtykke for e-postvarsler. Personvernerklæring-side.
- [ ] Sletterutiner: anonymiser brukerdata på forespørsel.
**Akseptanse:** Grunnleggende DPIA-notater i `/docs/security.md`.

---

## 17. Loggføring og overvåking
- [ ] Server-logger til stdout + strukturert JSON.
- [ ] Audit-logg tabell for kritiske handlinger (booking-status, refusjon).
- [ ] Error tracking (Sentry) koblet til release SHA.
**Akseptanse:** Tving fram en feil og verifiser at den vises i dashboardet.

---

## 18. Testing
- [ ] Unit: vitest for helpers og tRPC-handlere.
- [ ] e2e: Playwright for hovedflyter (signup, search, booking, payment mock).
- [ ] RLS-tests: supabase-js med ulike JWT-roller.
**Akseptanse:** `pnpm test` grønt; minst 1 e2e for hver kjerneflyt.

---

## 19. Seed og demo-data
- [ ] `pnpm seed` lager 5 venues med variasjon i pris og type, 10 bookinger, 10 reviews.
- [ ] Script for å nullstille lokalt miljø.
**Akseptanse:** Demo-kontoer listet i `/docs/demo.md` fungerer.

---

## 20. CI/CD
- [ ] GitHub Actions: `build`, `lint`, `test`, `prisma migrate diff`, docker build (valgfritt).
- [ ] Preview deploy på PR (Vercel). Prod deploy fra `main`.
- [ ] Sette GitHub Secrets: alle nevnte envs + STRIPE.
**Akseptanse:** PR viser preview-URL; arbeidsflyt kjører automatisk.

---

## 21. Deploy og drift (MVP)
- [ ] Frontend til Vercel.
- [ ] Supabase: drift i valgt miljø. Ta i bruk pgbouncer hvis nødvendig.
- [ ] Stripe: aktiver live-modus når klar.
**Akseptanse:** Demo-booking i prod-testmiljø lykkes fra landing til kvittering.

---

## 22. Administrasjon (enkel)
- [ ] Admin-flag på `profiles.role='admin'` gir tilgang til `/admin`.
- [ ] Admin kan moderate anmeldelser og refundere i test.
**Akseptanse:** Admin-sider vises bare for admin-brukere.

---

## 23. Internasjonalisering (valgfritt i MVP)
- [ ] i18n struktur (nb, en). Tekster i `/apps/web/i18n`.
**Akseptanse:** Språk kan byttes; fallback fungerer.

---

## 24. Dokumentasjon
- [ ] Oppdater `/docs/` med:
  - `architecture.md` (sekvensdiagram for booking+betaling)
  - `api.md` (tRPC prosedyrer med I/O)
  - `security.md` (RLS, DPIA-stubb)
  - `runbook.md` (driftsrutiner, secrets-rotasjon, backup)
**Akseptanse:** Ny utvikler kan spinne opp miljø på under 30 min.

---

## 25. Definition of Done (for hver oppgave)
- [ ] Kode, typer og zod-validering på plass
- [ ] Tester skrevet og grønt
- [ ] UI tilgjengelig og responsivt
- [ ] Dokumentasjon oppdatert
- [ ] Sikkerhetspunkter sjekket (RLS/sekretter)
- [ ] Demo-scenario kjørt manuelt

---

## 26. Qoder prompt-mal (bruk dette hvert steg)
**System/role:** Senior fullstack. Følg sjekklisten. Ingen snarveier.
**Kontekst:** bookme monorepo, Next.js, Supabase, Stripe, tRPC, Prisma, Tailwind, Flowbite.
**Oppgave:** [lim inn konkret sjekkpunkt]
**Akseptanse:** [lim inn akseptanse fra sjekkpunktet]
**Output:** Patchede filer, migrasjon, tester, korte commit-meldinger.

Eksempel:
```
Implementer tRPC router `bookings` med `quote`, `create`, `cancel`, `confirm`, `complete`.
Akseptanse: kollisjonskontroll i transaksjon; enhetstester for happy/edge; zod for I/O.
```

---

## 27. Utvidelser etter MVP (parkerte)
- Flerskala prisregler og sesongtabell
- Kartvisning og geosøk (PostGIS)
- Organisasjonskontoer og fakturering mot EHF
- Kommunal godkjenningsflyt for offentlige lokaler
