# BookMe Portal

En moderne plattform for fasilitetsreservasjon og booking utviklet av Xala Technologies. Bygget med React, TypeScript og Tailwind CSS, og følger strenge kodestandarder for enterprise-utvikling.

## Oversikt

BookMe Portal er en omfattende plattform for fasilitetsadministrasjon og booking som gjør det mulig for organisasjoner å effektivt administrere sine lokaler og la brukere gjøre reservasjoner. Applikasjonen har et moderne, responsivt design med flerspråkstøtte (norsk primær, engelsk sekundær) og tilbyr både administrative og brukerrettede funksjoner.

## Hovedfunksjoner

### Kjernefunksjonalitet
- **Fasilitetsadministrasjon**: Bla gjennom og søk i tilgjengelige fasiliteter med detaljert informasjon
- **Avansert søk og filtrering**: Flerkriteriesøk med sanntidsfiltrering
- **Interaktive kart**: Integrerte Mapbox-kart som viser fasilitetslokasjoner
- **Flere visningsmodi**: Rutenett, liste, kart og kalendervisninger for optimal brukeropplevelse
- **Flerspråkstøtte**: Norsk (primær) og engelsk med sømløs språkbytte
- **Responsivt design**: Mobil-først tilnærming som sikrer optimal opplevelse på alle enheter

### Brukeropplevelse
- **Mørk modus-støtte**: Komplett implementering av lys/mørk tema
- **Tilgjengelighet**: WCAG-kompatibel med tastaturnavigasjon og skjermleserstøtte
- **Ytelsesoptimalisert**: Lazy loading, bildeoptimalisering og effektiv rendering
- **Moderne brukergrensesnitt**: Rent, profesjonelt grensesnitt med Radix UI-primitiver

### Teknisk arkitektur
- **Type-sikker utvikling**: Streng TypeScript-implementering med omfattende typedekning
- **Komponentbasert arkitektur**: Modulære, gjenbrukbare komponenter som følger enterprise-mønstre
- **Tilstandshåndtering**: Kontekstbasert tilstandshåndtering med planlagt Zustand-integrasjon
- **Internasjonalisering**: Tilpasset i18n-system med fallback-støtte

## Teknologistakk

### Frontend
- **Rammeverk**: React 19.1.1 med funksjonelle komponenter og hooks
- **Språk**: TypeScript med streng typekontroll
- **Styling**: Tailwind CSS 3.4.0 med tilpasset designsystem
- **UI-komponenter**: Radix UI-primitiver med tilpasset styling
- **Routing**: React Router DOM for klient-side navigasjon
- **Kart**: Mapbox GL JS for interaktive kart
- **Byggeverktøy**: Webpack med optimaliserte produksjonsbygg

### Utviklingsverktøy
- **Linting**: ESLint med TypeScript-spesifikke regler
- **Kodeformatering**: Prettier med konsistente formateringsregler
- **Typekontroll**: TypeScript strict mode med omfattende dekning
- **Pakkehåndtering**: npm med lock-fil for avhengighetskonsistens

## Prosjektstruktur

```
src/
├── components/                 # React-komponenter organisert etter domene
│   ├── ui/                    # Grunnleggende UI-komponenter (Button, Card, Input, etc.)
│   ├── facility/              # Fasilitetsspesifikke komponenter
│   ├── search/                # Søk- og filtreringskomponenter
│   ├── booking/               # Booking-flytkkomponenter
│   ├── calendar/              # Kalender- og tilgjengelighetskomponenter
│   ├── map/                   # Kartintegrasjonskomponenter
│   ├── auth/                  # Autentiseringskomponenter
│   ├── admin/                 # Administrative grensesnittkomponenter
│   └── shared/                # Delte verktøykomponenter
├── contexts/                  # React Context-leverandører
│   ├── LanguageContext.tsx    # Internasjonaliseringskontekst
│   ├── AuthContext.tsx        # Autentiseringstilstand
│   └── BookingContext.tsx     # Booking-flytstilstand
├── data/                      # Mock-data og typedefinisjoner
│   ├── coreFacilities.ts      # Fasilitetsdata
│   ├── bookings/              # Booking-relaterte data
│   └── additionalServices/    # Tilleggstjenestedata
├── i18n/                      # Internasjonaliseringssystem
│   ├── translations/          # Oversettingsfiler (NO/EN)
│   ├── hooks/                 # Oversettingshooks
│   └── types.ts              # i18n-typedefinisjoner
├── hooks/                     # Tilpassede React-hooks
├── lib/                       # Verktøyfunksjoner og konfigurasjoner
├── pages/                     # Hovedapplikasjonssider
├── services/                  # API-tjenester og datahenting
├── stores/                    # Tilstandshåndtering (Zustand-stores)
├── types/                     # TypeScript-typedefinisjoner
└── utils/                     # Generelle verktøyfunksjoner
```

## Installasjon og oppsett

### Forutsetninger
- Node.js 18.0 eller høyere
- npm 8.0 eller høyere
- Git for versjonskontroll

### Utviklingsoppsett

```bash
# Klon repository
git clone <repository-url>
cd bookme-1

# Installer avhengigheter
npm install

# Start utviklingsserver
npm run dev

# Bygg for produksjon
npm run build

# Kjør linting
npm run lint

# Rens byggeartefakter
npm run clean
```

### Tilgjengelige skript

| Skript | Beskrivelse |
|--------|-------------|
| `npm run dev` | Start utviklingsserver på port 4001 |
| `npm run build` | Opprett optimalisert produksjonsbygg |
| `npm run lint` | Kjør ESLint-typekontroll og kodekvalitetssjekker |
| `npm run clean` | Fjern byggeartefakter og midlertidige filer |

## Kodestandarder

Dette prosjektet følger strenge kodestandarder for enterprise-utvikling:

### TypeScript-standarder
- **Streng typekontroll**: Alle funksjoner må ha eksplisitte returtyper
- **Readonly-egenskaper**: Alle interface-egenskaper må være readonly
- **Ingen Any-typer**: Bruk av `any`-type er forbudt
- **Null-sikkerhet**: Strenge null-sjekker aktivert gjennomgående
- **Immutable-mønstre**: Preferanse for immutable datastrukturer

### Komponentstandarder
- **Funksjonelle komponenter**: Kun funksjonelle komponenter med React hooks
- **Eksplisitt JSX.Element**: Alle komponenter må returnere `JSX.Element`
- **Props-grensesnitt**: Alle props må ha readonly interface-definisjoner
- **Klient-direktiver**: Alle klient-komponenter må inkludere `"use client";`
- **Navngitte eksporter**: Foretrekk navngitte eksporter fremfor standard eksporter

### Kodeorganisering
- **Import-rekkefølge**: Eksterne → Interne → Søsken-importer med kommentarer
- **Filnaming**: PascalCase for komponenter, camelCase for verktøy
- **Mappestruktur**: Domenedrevet organisering med klar separasjon
- **Komponentarkitektur**: Enkelt ansvarsprinsipp med komponerbare komponenter

### Styling-standarder
- **Kun Tailwind CSS**: Bruk kun Tailwind-verktøyklasser
- **Mobil-først**: Responsivt design med mobil-først tilnærming
- **Mørk modus**: Alle komponenter må støtte lys/mørke temaer
- **Konsistent spacing**: Bruk Tailwind spacing-system eksklusivt
- **Tilgjengelighet**: WCAG 2.1 AA-compliance påkrevd

## Internasjonalisering

Applikasjonen støtter flerspråkfunksjonalitet med et robust i18n-system:

### Støttede språk
- **Norsk (NO)**: Primærspråk med komplett dekning
- **Engelsk (EN)**: Sekundærspråk med fallback-støtte

### Brukseksempel

```typescript
import { useTranslation } from '@/i18n';

const MinKomponent = (): JSX.Element => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>{t('facility.description', { name: fasilitetsNavn })}</p>
    </div>
  );
};
```

### Legge til oversettelser

1. Legg til oversettelser i passende filer i `src/i18n/translations/`
2. Oppdater typedefinisjoner hvis du legger til nye oversettingsnøkler
3. Test både norsk og engelsk versjon
4. Sørg for at fallback-oppførsel fungerer korrekt

## Kartintegrasjon

BookMe Portal har omfattende kartintegrasjon med Mapbox:

### Funksjoner
- **Interaktive kart**: Fullverdige kart med zoom, panorering og navigasjonskontroller
- **Fasilitetsmarkører**: Tilpassede markører som viser fasilitetslokasjoner med popups
- **Statiske mini-kart**: Ytelsesoptimaliserte statiske kart i listevisninger
- **Lokasjonssøk**: Adressebasert fasilitetsoppdagelse
- **Responsivt design**: Kart tilpasser seg forskjellige skjermstørrelser

### Konfigurasjon
Kart er konfigurert med norske koordinater (Drammen-regionen) og bruker tilpasset styling for å matche applikasjonens designsystem.

## Datahåndtering

### Mock-datasystem
Applikasjonen inkluderer omfattende mock-data for utvikling og testing:

#### Fasiliteter
- 6 forskjellige fasilitettyper med realistisk informasjon
- Komplette detaljer inkludert prising, amenities og tilgjengelighet
- Geografiske koordinater for kartintegrasjon
- Høykvalitetsbilder for hver fasilitetstype

#### Bookingsystem
- Eksempelbookinger med forskjellige statuser og tidsperioder
- Brukerinformasjon og kontaktdetaljer
- Betalings- og prisingsinformasjon
- Tilbakevendende bookingmønstre

#### Tilleggstjenester
- 10 forskjellige tjenestekategorier
- Utstyr, catering og tekniske tjenester
- Prisstrukturer og tilgjengelighetsplaner

### Fremtidig backend-integrasjon
Applikasjonen er arkitektert for sømløs backend-integrasjon med:
- RESTful API-endepunkter
- Sanntids datasynkronisering
- Brukerautentisering og autorisasjon
- Betalingsbehandlingsintegrasjon

## Utviklingsretningslinjer

### Legge til nye komponenter

1. Opprett komponent i passende domenemappe under `src/components/`
2. Følg TypeScript-standarder med readonly-grensesnitt
3. Implementer responsivt design med Tailwind CSS
4. Legg til internasjonaliseringsstøtte for tekstinnhold
5. Test både lys og mørk modus-utseende
6. Sørg for tilgjengelighetscompliance

### Legge til nye sider

1. Opprett sidekomponent i `src/pages/`
2. Legg til routing-konfigurasjon i `App.tsx`
3. Oppdater navigasjon i `GlobalHeader.tsx`
4. Legg til passende oversettelser for navigasjon
5. Implementer riktige meta-tagger og SEO-hensyn

### Kode-review sjekkliste

- [ ] TypeScript strict mode passerer uten feil
- [ ] Alle komponenter har readonly props-grensesnitt
- [ ] Responsivt design implementert og testet
- [ ] Mørk modus-støtte verifisert
- [ ] Internasjonalisering lagt til for ny tekst
- [ ] ESLint-regler fulgt uten brudd
- [ ] Bygg fullføres vellykket
- [ ] Kode følger prosjektarkitekturmønstre
- [ ] Tilgjengelighetskrav oppfylt
- [ ] Ytelseshensyn adressert

## Teststrategi

### Planlagt testimplementering
- **Enhetstesting**: Jest og React Testing Library for komponenttesting
- **Integrasjonstesting**: Testing av komponentinteraksjoner og dataflyt
- **End-to-end testing**: Playwright for komplett brukerreise-testing
- **Ytelsestesting**: Lighthouse-revisjoner og Core Web Vitals-overvåking
- **Tilgjengelighetstesting**: Automatisert og manuell tilgjengelighetsverifisering

### Kvalitetssikring
- **Typesikkerhet**: Omfattende TypeScript-dekning
- **Kodekvalitet**: ESLint og Prettier-håndhevelse
- **Byggeverifisering**: Automatisert byggtesting i CI/CD-pipeline
- **Kryssnettlesertesting**: Støtte for moderne nettlesere

## Deployment

### Produksjonsbygg

```bash
npm run build
```

Byggartefaktene genereres i `dist/`-mappen og kan deployes til hvilken som helst statisk hosting-tjeneste.

### Anbefalte hosting-plattformer

| Plattform | Bruksområde | Fordeler |
|-----------|-------------|----------|
| **Vercel** | React-applikasjoner | Optimalisert for React, automatiske deployments |
| **Netlify** | Statiske nettsteder | Enkel deployment, innebygd CI/CD |
| **AWS S3 + CloudFront** | Enterprise | Skalerbar, global CDN, enterprise-funksjoner |
| **Azure Static Web Apps** | Microsoft-økosystem | Integrasjon med Azure-tjenester |

### Miljøkonfigurasjon

Applikasjonen støtter miljøspesifikk konfigurasjon gjennom miljøvariabler:

```bash
# Eksempel miljøvariabler
VITE_MAPBOX_TOKEN=din_mapbox_token_her
VITE_API_BASE_URL=https://api.bookme.com
VITE_ENVIRONMENT=production
```

## Ytelsesoptimalisering

### Implementerte optimaliseringer
- **Kodeoppdeling**: Dynamiske importer for rutebasert kodeoppdeling
- **Bildeoptimalisering**: Lazy loading og responsive bilder
- **Bundle-optimalisering**: Tree shaking og eliminering av død kode
- **Cachingstrategi**: Effektiv caching av statiske ressurser
- **Kartytelse**: Statiske kart i listevisninger for bedre ytelse

### Overvåking og analyse
- **Core Web Vitals**: Overvåking av LCP, FID og CLS-metrikker
- **Feilsporing**: Omfattende feillogging og overvåking
- **Ytelsesmetrikker**: Sanntids ytelsesovervåking
- **Brukeranalyse**: Bruksmønstre og brukeratferdsanalyse

## Sikkerhetshensyn

### Frontend-sikkerhet
- **XSS-forebygging**: Riktig input-sanitisering og output-encoding
- **CSRF-beskyttelse**: Token-basert forespørselsvalidering
- **Content Security Policy**: Restriktive CSP-headers
- **Avhengighetssikkerhet**: Regelmessige sikkerhetsrevisjoner av avhengigheter

### Databeskyttelse
- **Personverncompliance**: GDPR-kompatibel datahåndtering
- **Sikker kommunikasjon**: HTTPS-håndhevelse
- **Autentiseringssikkerhet**: Sikker token-håndtering
- **Input-validering**: Omfattende klient-side validering

## Bidrag

### Utviklingsarbeidsflyt

1. Opprett feature-branch fra main-branch
2. Implementer endringer som følger kodestandarder
3. Kjør omfattende testsuite
4. Sørg for at bygg passerer uten feil
5. Opprett detaljert pull request
6. Fullfør kode-review prosess
7. Merge etter godkjenning og testing

### Git-konvensjoner

- **Commit-meldinger**: Konvensjonelt commit-format
- **Branch-naming**: Feature/bugfix-prefikser med beskrivende navn
- **Pull requests**: Detaljerte beskrivelser med testinformasjon
- **Kode-reviews**: Obligatorisk review-prosess for alle endringer

## Support og vedlikehold

### Dokumentasjon
- **API-dokumentasjon**: Omfattende API-referanse
- **Komponentbibliotek**: Storybook-dokumentasjon for UI-komponenter
- **Brukerveiledninger**: Sluttbrukerdokumentasjon og tutorials
- **Utviklerveiledninger**: Teknisk dokumentasjon for utviklere

### Vedlikeholdsplan
- **Avhengighetsoppdateringer**: Regelmessige sikkerhets- og funksjonsoppdateringer
- **Ytelsesrevisjoner**: Kvartalsvise ytelsesgjennomganger
- **Sikkerhetsgjennomganger**: Regelmessige sikkerhetsvurderinger
- **Kodekvalitet**: Kontinuerlig kodekvalitetsovervåking

## Lisens og eierskap

Dette prosjektet er utviklet og eid av **Xala Technologies**. Alle rettigheter forbeholdt.

Kodebasen følger proprietære lisensvilkår og er underlagt Xala Technologies' retningslinjer for intellektuell eiendom og utviklingsretningslinjer.

## Kontaktinformasjon

For teknisk support, funksjonsforespørsler eller utviklingshenvendelser:

- **Utviklingsteam**: Kontakt gjennom interne kanaler
- **Prosjektledelse**: Bruk utpekte prosjektledelsesverktøy
- **Problemrapportering**: Opprett issues i prosjekt-repository
- **Dokumentasjon**: Se intern kunnskapsbase

---

**BookMe Portal** - Profesjonell fasilitetsreservasjonsplattform av Xala Technologies
*Bygget med moderne webteknologier og enterprise-standarder*