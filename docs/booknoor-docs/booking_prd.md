# Product Requirements Document (PRD)

## Produktnavn
Skybasert Lokalebooking (arbeidstittel: SpaceShare)

## Versjon
v0.2 (Draft, oppdatert for lokalebooking)

## Formål
Formålet er å bygge en skybasert plattform for å booke lokaler, der organisasjoner og privatpersoner kan leie ut møtelokaler, gymsaler, konferansesaler og andre typer rom, og gjester kan søke, booke og betale direkte i plattformen. Løsningen skal være selvbetjent, sikker, skalerbar og enkel å bruke.

## Målgruppe
- Bedrifter, skoler, idrettslag og organisasjoner som ønsker å leie ut lokaler.
- Privatpersoner og profesjonelle som trenger korttidsleie av lokaler (møter, arrangementer, trening, seminarer).

## Forretningsmål
1. Levere en MVP innen 6 måneder.
2. Gi en sømløs bookingopplevelse med sanntidskalender.
3. Bygge tillit gjennom sikker autentisering, brukeranmeldelser og escrow-betaling.
4. Skalere til minst 10 000 brukere første året.

---

## Scope

### Must Have (MVP)
1. **Autentisering og autorisasjon**  
   - Supabase Auth (Self-hosted) med e-post + OAuth (Google/Apple).
   - Rollebasert tilgang (utleier / leietaker).

2. **Lokalhåndtering (Utleier)**  
   - Opprett, rediger og slett lokaler.
   - Bilder via Supabase Storage.
   - Pris, tilgjengelighet (kalender), beskrivelse, regler.
   - Mulighet for å definere type lokale (møterom, gymsal, konferanserom, osv.).

3. **Søk og filtrering (Leietaker)**  
   - Søk etter sted, datoer, type lokale, kapasitet.
   - Filtrering (pris, fasiliteter, tilgjengelighet, rating).

4. **Bookingprosess**  
   - Valg av datoer/tider med sanntidskalender.
   - Prisberegning (inkl. timebasert/dagsbasert leie).
   - Reservasjon og bekreftelse.

5. **Betaling**  
   - Escrow-modell (betaling holdes til leieperioden er gjennomført).
   - Integrasjon (Stripe).

6. **Meldingssystem**  
   - Chat mellom utleier og leietaker.
   - Varsler (e-post/push).

7. **Anmeldelser**  
   - Leietaker og utleier kan gi rating + skriftlig tilbakemelding.

---

### Should Have (v1.0)
1. Flerspråklig støtte.
2. Utvidet filtrering (kart, tilgjengelighet, kategorier).
3. Dashboard for utleiere (økonomi, bookingstatistikk).
4. Mobiltilpassede progressive web app-funksjoner.

### Could Have (v1.x+)
1. Loyality-program / poengsystem.
2. AI-baserte anbefalinger for lokaler.
3. Dynamisk prissetting (basert på etterspørsel, tid på døgnet/uken).

---

## Teknologi
- **Front-end:** Next.js 15 (App Router) + TypeScript
- **UI-komponenter:** shadcn/ui (Radix UI + Tailwind CSS)
- **Backend:** Supabase (self-hosted) for auth, database og storage
- **ORM:** Prisma
- **API:** tRPC for type-sikre kall
- **Betaling:** Stripe integrasjon
- **Infrastruktur:** Selvhostet Supabase + Vercel/alternativ for frontend-deploy

---

## Arkitektur (høynivå)
- **Klient (Next.js)**: Server-side rendering for SEO, klient-side interaktivitet med React.
- **tRPC Layer**: Type-sikre API-kall mellom front og back.
- **Database**: PostgreSQL via Supabase.
- **ORM**: Prisma for skjema og queries.
- **Autentisering**: Supabase Auth.
- **Lagring**: Supabase Storage for bilder.
- **Betaling**: Stripe integrasjon via backend-proxy.

---

## KPIer
1. Gjennomsnittlig booking fullført på < 3 minutter.
2. 80%+ av brukere fullfører onboarding.
3. 90% oppetid i MVP-perioden.
4. >50% leietakere returnerer innen 6 måneder.

---

## Risikoer
- Reguleringer rundt utleie av skoler/idrettsanlegg kan variere per kommune.
- Stripe/andre betalingsløsninger kan være begrenset i visse regioner.
- Skaleringsutfordringer med selvhostet Supabase.

---

## Neste steg
1. Godkjennelse av PRD.
2. Opprette roadmap med milepæler (MVP → v1.0 → v2.0).
3. Arkitekturspesifikasjon i detalj (via *agent architect).
4. UX-design med *agent ux-expert.
5. Opprette backlog med *agent po.
