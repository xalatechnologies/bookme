# bookme-user-stories.md

# BookMe – Brukerhistorier for sluttbruker (leietaker)

## Omfang og mål
BookMe lar privatpersoner, lag/foreninger og bedrifter finne, reservere og betale for lokaler som gymsaler, møterom, kulturhus og idrettsanlegg. Dette dokumentet beskriver brukerhistorier, akseptansekriterier, kanttilfeller, feilhåndtering og sporbarhet.

## Definisjoner og antakelser
- Rolle: Sluttbruker/leietaker (privat, lag/forening, bedrift).
- Tidssone: Europe/Oslo. Datoformat: dd.mm.yyyy. Valuta: NOK.
- Tilgjengelighet: WCAG 2.2 AA som minstekrav.
- Sikkerhet/vern: GDPR, ISO 27001-praksis, aktivitetslogg.
- Tilgang: Web og mobil, støtte for BankID/ID-porten der aktuelt.

## EPIC A: Konto og pålogging
**A1. Registrering via e-post/BankID**
Som leietaker vil jeg opprette konto med e-post eller BankID, så jeg kan administrere bestillingene mine.
Akseptansekriterier:
- E-postregistrering med verifisering-lenke.
- BankID/ID-porten innlogging knytter fødselsdato og navn låst mot profil.
- Samtykke til vilkår og personvern kreves før fullføring.
Kanttilfeller:
- Bruker eksisterer fra før → tydelig feilmelding og «Gjenopprett tilgang».
- Avbrutt BankID-flow → uendret konto, trygg tilbakeføring.
Feilmeldinger:
- «Denne e-posten er allerede i bruk.»
- «Innlogging avbrutt. Prøv igjen.»

**A2. Pålogging og 2FA**
Som leietaker vil jeg logge inn sikkert, gjerne med 2FA for e-post-brukere.
Akseptansekriterier:
- Støtte for e-post+passord, magisk lenke, BankID.
- 2FA via engangskode for e-post-brukere kan aktiveres.
- Session-timeout 30 min inaktivitet; «Hold meg innlogget»-valg.
Kanttilfeller:
- Feil passord 5 ganger → midlertidig sperre og e-postvarsel.

**A3. Gjenoppretting av tilgang**
Som leietaker vil jeg kunne tilbakestille passord.
Akseptansekriterier:
- Sikker lenke med 15 min gyldighet.
- Historikkhindring: kan ikke gjenbruke siste 3 passord.

## EPIC B: Førstegangsoppsett
**B1. Velg kommune/leverandør**
Som leietaker vil jeg velge hvilken kommune/utleier jeg ser tilbud fra.
Akseptansekriterier:
- Liste eller søk på kommune/utleier.
- Mulighet for «Alle» der offentlige ønsker å være åpne.
Kanttilfeller:
- Ingen leverandør tilgjengelig i område → vis info og forslag.

**B2. Preferanser**
Som leietaker vil jeg sette språk, varsler (e-post/SMS), og personvernsvalg.
Akseptansekriterier:
- Språkvalg lagres og brukes i e-post/SMS.
- Granulære varslingsvalg (bekreftelser, påminnelser, faktura).

## EPIC C: Oppdagelse og søk
**C1. Katalog og filtrering**
Som leietaker vil jeg filtrere lokaler på type, kapasitet, tilgjengelighet, pris, fasiliteter og universell utforming.
Akseptansekriterier:
- Filtre: dato/tid, kapasitet, prisramme, kategori, tilgjengelighet (rullestol), nabolag.
- Sortering: pris, nærhet, rating, ledig først.
Kanttilfeller:
- Null treff → forslag til nærliggende datoer/områder.

**C2. Visningstyper**
Som leietaker vil jeg se resultater som liste, kart og kalender.
Akseptansekriterier:
- Listekort med nøkkelinformasjon og startpris.
- Kart med klynger og rask tilgjengelighetstittel.
- Kalender med ledige blokker pr. ressurs.

## EPIC D: Lokalside (detaljer)
**D1. Detaljvisning**
Som leietaker vil jeg se bilder, regler, priser, tilgjengelige tillegg, universell utforming, og avbestillingsregler.
Akseptansekriterier:
- Prisoppsett: grunnpris, timepris, tillegg, depositum, MVA-visning der relevant.
- Husregler, krav til alder/ansvarlig, forsikring.
- Tilgjengelighetspiktogrammer og tekstbeskrivelse.
Kanttilfeller:
- Midlertidig stengt → tydelig banner og alternative forslag.

**D2. Priskalkyle i sanntid**
Som leietaker vil jeg se totalpris før jeg holder/forespør.
Akseptansekriterier:
- Totalpris oppdateres ved endret tid, antall, tillegg.
- Tydelig hva som er refunderbart/ikke.

## EPIC E: Bestillingsflyt
**E1. Velg tid og varighet**
Som leietaker vil jeg velge start/slutt og få konfliktsjekk.
Akseptansekriterier:
- Konfliktsjekk mot eksisterende reservasjoner og rammetider.
- Minimum og maksimum varighet respekteres.
Feilmeldinger:
- «Valgt tid overlapper med annen reservasjon.»

**E2. Tillegg og oppsett**
Som leietaker vil jeg velge utstyr (f.eks. prosjektor, håndballmål), oppsett (klasserom/banedeling).
Akseptansekriterier:
- Tilgjengelighetskontroll pr. tillegg.
- Pris og logistikk vises tydelig.

**E3. Vilkår og dokumentasjon**
Som leietaker vil jeg bekrefte vilkår og evt. laste opp dokumentasjon (forening, ansvarserklæring).
Akseptansekriterier:
- Obligatoriske vedlegg må lastes før innsending.
- Samtykke avkrysses eksplisitt.

**E4. Betaling**
Som leietaker vil jeg betale med kort, Vipps eller få faktura der utleier tillater.
Akseptansekriterier:
- Umiddelbar autorisasjon for kort/Vipps.
- Faktura kun når regel tillater (org.nr., kredittsjekk).
- Depositum kan reserveres separat.
Feilmeldinger:
- «Betaling feilet. Beløp ikke trukket. Prøv annen metode.»

**E5. Bekreftelse**
Som leietaker vil jeg få kvittering og status: umiddelbart bekreftet eller «venter godkjenning».
Akseptansekriterier:
- E-post/SMS, kalenderfil (.ics), oversiktsside med status.
- Tydelige neste steg ved manuell godkjenning.

## EPIC F: Endringer og avbestilling
**F1. Endre booking**
Som leietaker vil jeg kunne endre tid/tillegg før frist.
Akseptansekriterier:
- Automatisk prisjustering og ny bekreftelse.
- Endringer kan kreve ny godkjenning etter regel.
Kanttilfeller:
- Endring skaper konflikt → forslag til alternativer.

**F2. Avbestille**
Som leietaker vil jeg kunne avbestille innenfor policy.
Akseptansekriterier:
- Viser gebyr/refusjon i kroner før bekreftelse.
- Refusjon utbetales til samme metode.

## EPIC G: Kommunikasjon
**G1. Meldinger**
Som leietaker vil jeg chatte med utleier/casehandler i samme sak.
Akseptansekriterier:
- Tråd per booking, vedlegg, lese-/leveringsstatus.
- Varsler på nye meldinger.

**G2. Varsler**
Som leietaker vil jeg velge kanal og frekvens for påminnelser, endringer og faktura.
Akseptansekriterier:
- Granulære innstillinger og enkel av/på.

## EPIC H: Mine bestillinger
**H1. Oversikt**
Som leietaker vil jeg se kommende, på vent, avviste og historikk.
Akseptansekriterier:
- Filtre på status, dato, sted.
- Hurtigtilgang til kvittering, faktura, kart og kontakt.

**H2. Dokumenter**
Som leietaker vil jeg laste ned kvitteringer, fakturaer og leieavtaler i PDF.
Akseptansekriterier:
- Alle dokumenter tilgjengelig med revisjonstidspunkt.

## EPIC I: Favoritter og lagrede søk
**I1. Favoritter**
Som leietaker vil jeg lagre lokaler til senere.
Akseptansekriterier:
- Liste med hurtigbooking og prisoverslag.

**I2. Lagrede søk**
Som leietaker vil jeg lagre søk med varsler.
Akseptansekriterier:
- Varsel når nye tider eller lavere pris matcher.

## EPIC J: Organisasjonsbooking
**J1. Booke for lag/forening**
Som leietaker vil jeg booke på vegne av organisasjon med org.nr.
Akseptansekriterier:
- Verifisering av org.nr., rolle i laget.
- Fakturaadresse og referansefelt.

## EPIC K: Tilgjengelighet og språk
**K1. Universell utforming**
Som leietaker med ulike behov vil jeg kunne finne egnede lokaler.
Akseptansekriterier:
- Filtre og detaljer for tilgjengelighet, bilder av adkomst/toalett.

**K2. Flerspråklig**
Som leietaker vil jeg bruke systemet på valgt språk.
Akseptansekriterier:
- Full tekstdekning inkl. e-post/SMS.

## EPIC L: Personvern og konto
**L1. Eksport**
Som leietaker vil jeg eksportere mine data (GDPR).
**L2. Sletting**
Som leietaker vil jeg be om sletting, med lovpålagte unntak for regnskap.

## EPIC M: Støtte og tvister
**M1. Hjelp**
Som leietaker vil jeg få selvhjelpsartikler og kontakt skjema.
**M2. Tvist**
Som leietaker vil jeg melde skade/uenighet, laste opp bevis, følge sak.

## Sporbarhet og metrikker (utdrag)
- Konverteringsrate per steg.
- Avbruddsrate per betalingsmetode.
- Tid til bekreftelse for manuelle saker.
- Refusjonstid.
- Tilgjengelighetstreff vs bestilling.
- Antall tvister pr. 1000 bestillinger.

## Ikke-funksjonelle krav (brukeropplevelse)
- Laster under 2 sek på katalog og under 1 sek på interaksjoner med cache.
- Offline-toleranse på skjema i 60 sek med automatisk retry.
- WCAG 2.2 AA, tastaturnavigasjon, skjermleser-støtte.
- Tydelige, menneskelige feilmeldinger og null-teknisk sjargong.
