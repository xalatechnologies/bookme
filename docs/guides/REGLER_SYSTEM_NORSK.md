# Regelsystem for Lokaler - Oppsett

Dette dokumentet forklarer hvordan du setter opp og bruker det nye regelsystemet for lokaler.

## Oversikt

Regelsystemet lar administratorer legge til, redigere og administrere regler for hvert lokale. Disse reglene lagres i Supabase og vises både på admin-redigeringssiden og på den offentlige lokaldetalj-siden.

## Installasjon

### Steg 1: Kjør SQL-migreringen i Supabase

Du må kjøre SQL-migreringen for å opprette `facility_rules`-tabellen i Supabase.

**Enkleste måte:**

1. Logg inn på Supabase Dashboard (https://supabase.com/dashboard)
2. Velg ditt prosjekt
3. Gå til **SQL Editor** i venstre meny
4. Åpne filen `/scripts/apply-facility-rules-migration.sql` i dette prosjektet
5. Kopier hele innholdet
6. Lim det inn i SQL Editor i Supabase
7. Klikk **Run** for å kjøre migreringen

**Alternativt: Via Supabase CLI**

```bash
# Fra prosjektets rot-mappe
supabase db push
```

### Steg 2: Verifiser at migreringen fungerte

Kjør denne SQL-spørringen i Supabase SQL Editor:

```sql
SELECT * FROM facility_rules LIMIT 1;
```

Hvis du ikke får noen feilmelding, er migreringen vellykket!

## Hvordan bruke systemet

### Som Administrator

#### Legge til regler:

1. Gå til **Admin** → **Lokaler**
2. Klikk **Rediger** på et lokale
3. Gå til **Regler**-fanen
4. Klikk **Legg til regel**
5. Skriv inn regelteksten
6. Velg regeltype:
   - **Booking**: Regler om booking-prosedyrer
   - **Sikkerhet**: Sikkerhetsrelaterte regler
   - **Generelt**: Generelle lokalregler
   - **Kansellering**: Kanselleringsregler
7. Kryss av **Påkrevd** hvis regelen er obligatorisk
8. Regelen lagres automatisk!

#### Redigere regler:

- Bare endre teksten i tekstfeltet - endringer lagres automatisk
- Endre regeltype i nedtrekkslisten
- Kryss av/av **Påkrevd**-boksen

#### Slette regler:

- Klikk på søppelkasse-ikonet ved siden av regelen

### Som bruker (offentlig visning)

1. Gå til et lokale
2. Klikk på **Regler**-fanen
3. Se alle regler for lokalet

Regler vises med:
- ✓ Grønn hake for booking/generelle regler
- ✗ Rød X for sikkerhets-/kanselleringsregler
- "Påkrevd"-merke for obligatoriske regler

## Regeltyper

| Type | Beskrivelse | Ikon |
|------|-------------|------|
| **Booking** | Regler om hvordan man booker lokalet | ✓ Grønn |
| **Sikkerhet** | Sikkerhetsregler som må følges | ✗ Rød |
| **Generelt** | Generelle regler for bruk | ✓ Grønn |
| **Kansellering** | Regler om kansellering | ✗ Rød |

## Eksempler på regler

### Booking-regler:
- "Minimum bookingtid er 2 timer"
- "Booking må gjøres minst 24 timer i forveien"
- "Maks 8 timer booking per dag"

### Sikkerhetsregler:
- "Røyking er ikke tillatt"
- "Brannvern må ikke blokkeres"
- "Nødutganger må holdes fri"

### Generelle regler:
- "Rydding er påkrevd etter bruk"
- "Støy etter 22:00 er ikke tillatt"
- "Mat og drikke er tillatt"

### Kanselleringsregler:
- "Gratis kansellering inntil 24 timer før oppstart"
- "50% refusjon ved kansellering mellom 24-48 timer før"
- "Ingen refusjon ved kansellering mindre enn 24 timer før"

## Tekniske detaljer

### Database-struktur

```sql
facility_rules
  - id (uuid)
  - facility_id (uuid) → referanse til facilities
  - rule_text (text) → regelteksten
  - rule_type (text) → 'booking', 'safety', 'general', 'cancellation'
  - is_required (boolean) → om regelen er obligatorisk
  - sort_order (int) → sorteringsrekkefølge
  - created_at (timestamp)
  - updated_at (timestamp)
```

### Sikkerhet (RLS)

- ✓ Alle kan se regler for publiserte lokaler
- ✓ Kun org-ansatte og admins kan legge til/redigere/slette regler
- ✓ Regler slettes automatisk når lokalet slettes

## Feilsøking

### "Kunne ikke legge til regel"

**Problem**: Du får feilmelding når du prøver å legge til en regel.

**Løsninger**:
1. Sjekk at lokalet er lagret først (har en ID)
2. Sjekk at du er logget inn som admin eller org-ansatt
3. Verifiser at migreringen er kjørt i Supabase

### Regler vises ikke

**Problem**: Regler du har lagt til vises ikke.

**Løsninger**:
1. Sjekk at lokalet er publisert (`status = 'published'`)
2. Se i nettleserens konsoll for feilmeldinger
3. Verifiser at du har riktige tilganger i Supabase

### Kan ikke redigere regler

**Problem**: Du kan ikke endre eksisterende regler.

**Løsninger**:
1. Sjekk at du er logget inn som admin eller org-ansatt
2. Verifiser din rolle i organisasjonen
3. Se i nettleserens konsoll for feilmeldinger

## Support

Hvis du trenger hjelp, sjekk:
1. Nettleserens konsoll for feilmeldinger
2. Supabase logs i Dashboard → Logs
3. At migreringen er kjørt korrekt

## Oppdateringer

### Versjon 1.0 (2024-12-04)
- ✓ Opprettet facility_rules tabell
- ✓ Implementert admin-grensesnitt for å administrere regler
- ✓ Implementert offentlig visning av regler
- ✓ Automatisk lagring av endringer
- ✓ RLS-policyer for sikkerhet
