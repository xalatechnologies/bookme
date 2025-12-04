# Quick Start - Regelsystem for Lokaler

## Steg-for-steg installasjon (5 minutter)

### 1️⃣ Kjør SQL i Supabase (2 min)

1. Åpne [Supabase Dashboard](https://supabase.com/dashboard)
2. Velg ditt prosjekt
3. Klikk **SQL Editor** i venstre meny
4. Åpne filen: `/scripts/apply-facility-rules-migration.sql`
5. Kopier **ALT** innhold fra filen
6. Lim inn i SQL Editor
7. Klikk **RUN** (grønn knapp)
8. Vent på suksessmelding ✅

**Ferdig!** Databasen er klar.

---

### 2️⃣ Test at det fungerer (3 min)

#### Test 1: Sjekk tabellen
I SQL Editor, kjør:
```sql
SELECT COUNT(*) FROM facility_rules;
```
✅ Hvis du får et tall (selv 0), fungerer det!

#### Test 2: Legg til en regel via Admin
1. Gå til din app → **Admin** → **Lokaler**
2. Klikk **Rediger** på et eksisterende lokale
3. Gå til **Regler**-fanen
4. Klikk **Legg til regel**
5. Skriv inn: "Røyking er ikke tillatt"
6. Velg type: **Sikkerhet**
7. Kryss av **Påkrevd**
8. Regelen lagres automatisk! ✅

#### Test 3: Se regelen som bruker
1. Gå til samme lokale på brukersiden
2. Klikk **Regler**-fanen
3. Du skal se regelen du nettopp la til! ✅

---

## Hurtigstart - Bruk

### Som Admin:
```
Admin → Lokaler → Velg lokale → Rediger → Regler-fanen
```

**Legg til regel:**
- Klikk "Legg til regel"
- Skriv regeltekst
- Velg type (Booking/Sikkerhet/Generelt/Kansellering)
- Kryss av "Påkrevd" hvis nødvendig
- Ferdig! (auto-lagres)

**Rediger regel:**
- Bare endre teksten → auto-lagres
- Endre type i dropdown
- Kryss av/av "Påkrevd"

**Slett regel:**
- Klikk søppelkasse-ikonet

---

## Feilsøking

### ❌ "Kunne ikke legge til regel"
**Sjekk:**
- [ ] Er lokalet lagret? (må ha ID)
- [ ] Er du logget inn som admin?
- [ ] Kjørte du SQL-migreringen?

**Løsning:**
Lagre lokalet først, deretter legg til regler.

---

### ❌ "constraint already exists" feil
**Løsning:**
Den nye versjonen av scriptet håndterer dette automatisk.
Kjør scriptet på nytt - det vil ikke gi feil nå.

---

### ❌ Regler vises ikke
**Sjekk:**
- [ ] Er lokalet publisert? (`status = 'published'`)
- [ ] Åpne nettleserens konsoll (F12) - se etter feil
- [ ] Har du faktisk lagt til regler?

---

## Eksempler på regler

### 📋 Booking-regler:
```
✓ Minimum bookingtid er 2 timer
✓ Booking må gjøres minst 24 timer i forveien  
✓ Maksimalt 8 timer booking per dag
```

### 🔒 Sikkerhetsregler:
```
✗ Røyking er ikke tillatt
✗ Brannvern må ikke blokkeres
✗ Nødutganger må holdes fri
```

### 📜 Generelle regler:
```
✓ Rydding er påkrevd etter bruk
✓ Støy etter 22:00 er ikke tillatt
✓ Mat og drikke er tillatt
```

### 💰 Kanselleringsregler:
```
✗ Gratis kansellering inntil 24 timer før
✗ 50% refusjon ved kansellering 24-48 timer før
✗ Ingen refusjon ved kansellering under 24 timer før
```

---

## Hjelp

**Trenger du hjelp?**
1. Sjekk nettleserens konsoll (F12 → Console)
2. Se Supabase logs (Dashboard → Logs)
3. Verifiser at migreringen kjørte uten feil

**Funker det fortsatt ikke?**
Kontakt support med:
- Skjermbilde av feilen
- Hva du prøvde å gjøre
- Nettleserens konsollogger

---

## ✅ Sjekkliste

- [ ] SQL-script kjørt i Supabase
- [ ] Tabellen `facility_rules` eksisterer
- [ ] Kan legge til regel via admin
- [ ] Regel vises på lokalets detaljside
- [ ] Kan redigere regel
- [ ] Kan slette regel

Når alle er krysset av: **DU ER KLAR!** 🎉

---

**Laget:** 2024-12-04  
**Versjon:** 1.0  
**Dokumenter:** Se REGLER_SYSTEM_NORSK.md for fullstendig dokumentasjon
