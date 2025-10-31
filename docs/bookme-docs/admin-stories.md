# bookme-admin-stories.md

# BookMe – Brukerhistorier for administratorer (kommune/utleier)

## Roller
- Superadmin (plattformeier)
- Tenant/kommuneadmin (paraplyadmin)
- Steds-/lokalforvalter (venue manager)
- Saksbehandler (godkjenning/avslag)
- Økonomi (fakturering/oppgjør)
- Support (brukerstøtte)

## Definisjoner og rammer
- Tidssone: Europe/Oslo, valuta: NOK, MVA vises iht. oppsett.
- Regelmotor: åpningstider, rammetider, blokkeringsperioder, prisregler, depositum, avbestillingspolicy.
- Sikkerhet/vern: RBAC, aktivitetslogg, revisjonsspor, GDPR, ISO 27001-praksis.

## EPIC A: Etablering av tenant
**A1. Opprette tenant**
Som superadmin vil jeg opprette ny kommune/utleier med subdomene, logo, farger og e-postmaler.
Akseptansekriterier:
- Subdomene og egendefinert domene.
- Branding (logo, farger, favicons), avsenderadresser og DKIM/DMARC-verifisering.
- Standardvilkår og personverntekst pr. tenant.
Kanttilfeller:
- Domeneoppsett ikke verifisert → sandbox-tilstand med varsler.

**A2. Konfigurasjonsmaler**
Som superadmin vil jeg tildele startoppsettmaler (priser, regler, e-postmaler).
Akseptansekriterier:
- Velg mal ved opprettelse, kan kopieres fra annen tenant.

## EPIC B: Roller og tilgang
**B1. RBAC**
Som kommuneadmin vil jeg definere roller og tilganger pr. lokal og modul.
Akseptansekriterier:
- Forhåndsroller + egendefinerte.
- Tildeling på nivå: tenant, lokasjon, ressurs.
- Revisjonslogg for endringer.

**B2. Invitasjoner**
Som kommuneadmin vil jeg invitere ansatte via e-post/SSO.
Akseptansekriterier:
- Engangsinvitasjon, utløp 7 dager.
- SSO (ID-porten/Azure AD der aktuelt) kan knyttes.

## EPIC C: Ressurs- og lokalskatalog
**C1. Opprette lokaler**
Som lokalforvalter vil jeg definere lokaler, kapasitet, bilder, fasiliteter, UU-detaljer.
Akseptansekriterier:
- Kategorier, metadata, geografisk posisjon.
- UU-felt med egne bilder for adkomst/toalett.

**C2. Åpningstider og rammetider**
Som lokalforvalter vil jeg sette åpningstider, rammetider og blokkeringsperioder.
Akseptansekriterier:
- Gjentakende regler (RRULE), helligdager og unntak.
- Ved konflikt: prioritet etter regelhierarki.

**C3. Tillegg og utstyr**
Som lokalforvalter vil jeg definere tillegg (pris, beholdning, krav om vaktmester).
Akseptansekriterier:
- Lager/kvote pr. tidsluke, automatisk konflikt på overbooking.

## EPIC D: Priser, gebyr og policy
**D1. Prisregler**
Som kommuneadmin vil jeg sette grunnpris, timepris, dagspris, pakker, og differensiere for brukergrupper (privat/lag/bedrift).
Akseptansekriterier:
- Prisversjoner med gyldighetsperiode.
- MVA-flagg pr. varelinje.
- Rabattkoder og volumrabatt.

**D2. Depositum og avbestilling**
Som kommuneadmin vil jeg definere depositum og avbestillingsgebyr pr. kategori.
Akseptansekriterier:
- Skalerte gebyrer etter tidsfrist.
- Automatisk tilbakeføring ved kansellering iht. policy.

## EPIC E: Bookingregler og konfliktstyring
**E1. Regelmotor**
Som kommuneadmin vil jeg sette auto-godkjenning under bestemte kriterier og krav om manuell godkjenning ellers.
Akseptansekriterier:
- Auto-godkjenning hvis lav risiko, innenfor åpningstid, uten alkohol, og innen kapasitet.
- Manuell kø med SLA-timers og varsling til saksbehandlere.

**E2. Konflikthåndtering**
Som systemet vil jeg blokkere dobbeltbooking og foreslå nærmeste alternative tider.
Akseptansekriterier:
- «Soft hold» ved betaling i arbeid; hold utløper etter X min ved avbrudd.

## EPIC F: Saksbehandling
**F1. Kø og prioritering**
Som saksbehandler vil jeg se en kø med filtre (dato, sted, type bruker, risiko).
Akseptansekriterier:
- Massetildeling, notater, interne kommentarer, vedleggsvisning.
- Beslutninger: godkjenn, avslå, be om info.

**F2. Malbrev og dokumenter**
Som saksbehandler vil jeg sende vedtaksbrev/avtalebrev som PDF med e-signatur ved behov.
Akseptansekriterier:
- Redigerbare maler pr. tenant.
- Revisjon av maler med publiseringslogg.

## EPIC G: Betaling og fakturering
**G1. Betalingsoppsett**
Som økonomi vil jeg aktivere kort/Vipps og faktura/EHF hvis kommunen krever det.
Akseptansekriterier:
- Test- og produksjonsnøkler, avstemmingstabeller.
- Konfigurerbare KID/regnskapskontoer.

**G2. Fakturering og oppgjør**
Som økonomi vil jeg generere faktura etter forbruk eller forskudd, sende purringer og bokføre innbetalinger.
Akseptansekriterier:
- Fakturaplan per lokal/kategori (forfall X dager før/etter).
- Automatisk purringstrinn med gebyr.
- Kreditnota og delrefusjon støttes.
Kanttilfeller:
- Delvis bruk vs. booket tid → avregning etter policy.

**G3. Depositum**
Som økonomi vil jeg håndtere depositum-reservasjoner og frigivelse/trekk ved skade.
Akseptansekriterier:
- Hendelseslogg, dokumentasjon og godkjenningsflyt.

## EPIC H: Kommunikasjon
**H1. Meldingssenter**
Som support/saksbehandler vil jeg svare på henvendelser i tråder per booking.
Akseptansekriterier:
- Tildeling, interne notater, vedlegg, mal-svar.
- Eskalering til nivå 2.

**H2. Varslingsmaler**
Som kommuneadmin vil jeg styre innhold og timing for e-post/SMS/Push.
Akseptansekriterier:
- Mal-redigering med variabler, testutsendelse, versjonering.

## EPIC I: Rapporter og innsikt
**I1. Utnyttelse**
Som kommuneadmin vil jeg se bruk per lokal, topptider, og avbestillingsrate.
Akseptansekriterier:
- Diagrammer og CSV-eksport.
- Segmentering på brukergruppe, bydel, tid.

**I2. Økonomi**
Som økonomi vil jeg se inntekt, utestående, refusjoner, gebyrer.
Akseptansekriterier:
- Periodevalg, MVA-rapport, EHF status.

**I3. Kvalitet**
Som kommuneadmin vil jeg se responstid i saksbehandling, tid til bekreftelse, antall tvister.
Akseptansekriterier:
- SLA-overskridelser markeres, og årsak må angis.

## EPIC J: Integrasjoner
**J1. Kalender og adgang**
Som lokalforvalter vil jeg synkronisere reservasjoner til intern kalender og adgangssystem (der det finnes).
Akseptansekriterier:
- ICS/CalDAV-feed per ressurs.
- Webhook ved statusendringer.

**J2. Regnskap/ERP**
Som økonomi vil jeg eksportere bilag og innbetalinger til økonomisystem.
Akseptansekriterier:
- Standard eksportformat, automatisk nattlig eksport, feillogg.

**J3. SSO/ID**
Som kommuneadmin vil jeg tilby SSO for ansatte og evt. ID-porten for brukere.
Akseptansekriterier:
- Mapping av grupper til roller.
- Tofaktor påkrevd for høyprivilegerte roller.

## EPIC K: Moderasjon, skade og tvist
**K1. Hendelser**
Som lokalforvalter vil jeg registrere skade/avvik med bilder, tidsstempel og kostnadsestimat.
Akseptansekriterier:
- Varsling til økonomi for depositumstrekk.
- Lenket dokumentasjon til booking.

**K2. Tvist**
Som support vil jeg behandle tvister med sjekklister og frister.
Akseptansekriterier:
- Partsvitne, dokumentopplasting, konklusjon, logg.

## EPIC L: Personvern, sikkerhet og revisjon
**L1. Dataminimering og retention**
Som kommuneadmin vil jeg definere oppbevaringstider for data.
Akseptansekriterier:
- Automatisk anonymisering etter N dager hvis lovlig.

**L2. Innsyn og sletting**
Som kommuneadmin vil jeg behandle GDPR-forespørsler.
Akseptansekriterier:
- Eksport som maskinlesbar pakke.
- Sletteprosedyre med unntak for regnskapskrav.

**L3. Aktivitetslogg**
Som revisor vil jeg se hvem som gjorde hva, når og hvorfra.
Akseptansekriterier:
- Uforanderlig logg, filtrerbar og eksporterbar.

## EPIC M: Import/eksport og migrering
**M1. Import av lokaler**
Som lokalforvalter vil jeg importere CSV/Excel med lokaler, priser og bilder.
Akseptansekriterier:
- Valideringsrapport før endelig import.
- Partial-import med feilliste.

**M2. Eksport**
Som kommuneadmin vil jeg eksportere hele katalogen og innstillinger som backup.
Akseptansekriterier:
- Versjonert ZIP med JSON+media.

## EPIC N: Kvalitet og drift
**N1. Sandbox**
Som kommuneadmin vil jeg teste endringer i sandbox før produksjon.
Akseptansekriterier:
- Trygg kopi av konfig med anonymiserte data.

**N2. Helse og overvåkning**
Som systemeier vil jeg se driftstatus, feilhendelser, og SLA-panel.
Akseptansekriterier:
- Varsling på feilrate, betalingsfeil, e-post bounce.

## Akseptkriterier på tvers
- Ytelse: listevisning < 2 sek, handlinger < 1 sek ved cache.
- Skalerbarhet: samtidige bookinger på topp belastning uten dobbeltbooking.
- Tilgjengelighet: WCAG 2.2 AA.
- Sikkerhet: RBAC, minst mulig privilegier, rate-limiting, audit-logg.
- Hendelseslogg for betaling, statusendringer, dokumentgenerering.

## Standard feilmeldinger (eksempler)
- «Handlingen kan ikke utføres på grunn av konflikter i kalenderen.»
- «Du mangler tilgang til denne ressursen.»
- «Integrasjon feilet. Sjekk nøkler og prøv igjen.»
- «Betaling mislyktes. Ingen belastning er gjort.»

## Metrikker og mål (utdrag)
- Tid til første publiserte lokale etter tenant-oppstart.
- Andel auto-godkjente vs. manuelle saker.
- Dobbeltbooking-rate (mål: 0).
- Faktura betalt innen forfall.
- Antall tvister pr. 1000 bookinger.
- Tilgjengelighet på 99.9 % månedsvis.

## Revisjon og endringskontroll
- Alle konfigendringer versjoneres med «hvem/hva/når» og begrunnelse.
- Publiseringsvinduer med automatisk tilbakeføring ved feil.
