# Software Requirements Specification & Design (SRSD)

## Systemnavn
Skybasert Lokalebooking (arbeidstittel: SpaceShare)

## Versjon
v0.1 (Draft)

---

## 1. Introduksjon
### 1.1 Formål
Dette dokumentet beskriver de funksjonelle og ikke-funksjonelle kravene, samt systemdesign for en skybasert løsning som muliggjør booking av lokaler (møterom, gymsaler, konferansesaler osv.).

### 1.2 Omfang
Systemet skal tilby:
- Registrering og administrasjon av lokaler for utleiere.
- Søk, filtrering og booking for leietakere.
- Betalingsflyt med escrow.
- Sanntidskalender for tilgjengelighet.
- Meldingssystem mellom utleier og leietaker.
- Brukeranmeldelser og rating.

### 1.3 Målgruppe
- Utleiere: organisasjoner, skoler, idrettslag, bedrifter.
- Leietakere: privatpersoner, profesjonelle, bedrifter.

---

## 2. Funksjonelle krav

### 2.1 Autentisering og autorisasjon
- Brukere kan registrere seg via e-post eller OAuth (Google/Apple).
- Rollebasert tilgang: utleier og leietaker.
- Admin-rolle for moderering.

### 2.2 Lokalhåndtering (utleier)
- Opprette, redigere, slette lokaler.
- Definere kapasitet, fasiliteter, regler, pris og tilgjengelighet.
- Laste opp bilder via Supabase Storage.

### 2.3 Søk og filtrering (leietaker)
- Søk basert på sted, type lokale, kapasitet, dato/tid.
- Filtrering på pris, fasiliteter, rating, tilgjengelighet.

### 2.4 Bookingprosess
- Velge dato/tid fra sanntidskalender.
- Prisberegning (time- eller dagsbasert).
- Bekreftelse og reservering.
- Avbestillingslogikk (fleksibel/strengt).

### 2.5 Betaling
- Stripe integrasjon.
- Escrow-modell (betaling frigjøres etter endt leieperiode).
- Refusjoner ved avbestilling i henhold til regler.

### 2.6 Meldingssystem
- Direktemeldinger mellom utleier og leietaker.
- Push-varsler og e-postvarsler.

### 2.7 Anmeldelser og rating
- Leietakere kan vurdere lokalet og utleier.
- Utleiere kan vurdere leietakere.
- Ratingsystem (1–5 stjerner) + kommentarer.

---

## 3. Ikke-funksjonelle krav
- **Ytelse:** 90% av alle forespørsler < 300 ms.
- **Skalerbarhet:** støtte for minst 10 000 brukere første året.
- **Sikkerhet:** kryptert kommunikasjon (HTTPS), lagring av passord med hashing.
- **Oppetid:** > 99% etter MVP-perioden.
- **Tilgjengelighet:** støtte for desktop og mobil (PWA).

---

## 4. Systemdesign

### 4.1 Arkitektur
- **Front-end:** Next.js 15 (App Router) + TypeScript
- **UI:** Flowbite React + Tailwind CSS
- **Backend:** Supabase (self-hosted) + tRPC
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Autentisering:** Supabase Auth
- **Lagring:** Supabase Storage
- **Betaling:** Stripe integrasjon

### 4.2 Høynivå flyt
1. Leietaker søker lokale.
2. Systemet returnerer filtrerte resultater fra databasen.
3. Leietaker velger lokale, tidspunkt og sender forespørsel.
4. Systemet reserverer lokalets kalender (optimistisk låsing).
5. Betaling utføres via Stripe (holdes i escrow).
6. Etter leieperioden frigjøres betaling.
7. Anmeldelser og rating registreres.

### 4.3 Datamodell (forenklet)
- **User** (id, navn, rolle, e-post, rating)
- **Venue** (id, utleierId, type, navn, kapasitet, fasiliteter, pris, regler, tilgjengelighet)
- **Booking** (id, venueId, leietakerId, startTid, sluttTid, status, pris, betalingId)
- **Message** (id, fraId, tilId, bookingId, tekst, timestamp)
- **Review** (id, bookingId, fraId, tilId, rating, kommentar)

### 4.4 API (via tRPC)
- `auth.login`
- `auth.register`
- `venues.create`
- `venues.update`
- `venues.search`
- `bookings.create`
- `bookings.cancel`
- `bookings.confirm`
- `payments.charge`
- `messages.send`
- `reviews.create`

---

## 5. Risikoer
- Begrenset Stripe-støtte i enkelte regioner.
- Skaleringsproblemer ved høy trafikk på selvhostet Supabase.
- Juridiske krav knyttet til utleie av offentlige lokaler.

---

## 6. Neste steg
1. Detaljert database-skjema med Prisma.
2. API-kontrakter i tRPC.
3. Wireframes og UI-spesifikasjon.
4. Prototype av bookingflyt.
5. Testing av escrow-prosess med Stripe.
