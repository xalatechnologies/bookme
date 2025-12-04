# Feilsøking - Regelsystem

## Problem: Applikasjonen loader ikke / blank skjerm

### Løsninger:

#### 1. Restart utviklingsserveren
```bash
# Stopp serveren (Ctrl+C)
# Start på nytt:
npm run dev
```

#### 2. Clear browser cache
1. Åpne Chrome DevTools (F12)
2. Høyreklikk på refresh-knappen
3. Velg "Empty Cache and Hard Reload"

#### 3. Sjekk browser console for feil
1. Åpne DevTools (F12)
2. Gå til Console-fanen
3. Se etter røde feil

### Vanlige feilmeldinger:

#### "table facility_rules does not exist"
**Årsak:** SQL-migreringen er ikke kjørt ennå.

**Løsning:**
1. Gå til Supabase Dashboard → SQL Editor
2. Kjør `/scripts/apply-facility-rules-migration.sql`

#### "Cannot read property 'id' of undefined"
**Årsak:** Prøver å laste regler for et lokale som ikke eksisterer ennå.

**Løsning:**
Dette er normalt for nye lokaler. Lagre lokalet først, deretter legg til regler.

#### "useFacilityRules is not defined"
**Årsak:** Import-feil i koden.

**Løsning:**
```bash
# Restart dev server
npm run dev
```

## Problem: Kan ikke legge til regler

### Sjekkliste:
- [ ] Er lokalet lagret? (må ha en ID)
- [ ] Er du logget inn som admin?
- [ ] Kjørte du SQL-migreringen?
- [ ] Er det noen feil i konsollen?

### Løsning:
```sql
-- Sjekk om tabellen eksisterer:
SELECT * FROM facility_rules LIMIT 1;

-- Sjekk dine tilganger:
SELECT * FROM memberships WHERE user_id = auth.uid();
```

## Problem: Regler vises ikke

### Sjekkliste:
- [ ] Er lokalet publisert? (`status = 'published'`)
- [ ] Har du faktisk lagt til regler?
- [ ] Refresh siden (F5)
- [ ] Sjekk nettleserens konsoll

### Løsning:
```sql
-- Se alle regler for et lokale:
SELECT * FROM facility_rules WHERE facility_id = 'DITT-FACILITY-ID';

-- Sjekk lokalets status:
SELECT id, name, status FROM facilities WHERE id = 'DITT-FACILITY-ID';
```

## Problem: TypeScript-feil

### Feilmelding: "Property 'facility_rules' does not exist"
**Årsak:** Database-typene er ikke oppdatert.

**Løsning:**
Dette er forventet. Typene oppdateres automatisk når migreringen er kjørt i produksjon. Inntil videre bruker vi `as any` for å omgå typesjekken.

## Problem: RLS Policy-feil

### Feilmelding: "new row violates row-level security policy"
**Årsak:** Du har ikke tilgang til å legge til regler.

**Løsning:**
1. Sjekk at du er admin eller org staff:
```sql
SELECT role FROM memberships WHERE user_id = auth.uid();
```

2. Hvis du er admin, sjekk at RLS-policiene er riktig satt opp:
```sql
SELECT * FROM pg_policies WHERE tablename = 'facility_rules';
```

## Debugging Tips

### Se alle regler i databasen:
```sql
SELECT 
  fr.id,
  fr.rule_text,
  fr.rule_type,
  fr.is_required,
  f.name as facility_name
FROM facility_rules fr
JOIN facilities f ON f.id = fr.facility_id
ORDER BY f.name, fr.sort_order;
```

### Slett alle regler (hvis du vil starte på nytt):
```sql
DELETE FROM facility_rules;
```

### Sjekk om migreringen kjørte riktig:
```sql
-- Sjekk tabell-struktur:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'facility_rules';

-- Sjekk constraints:
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'facility_rules'::regclass;

-- Sjekk RLS policies:
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'facility_rules';
```

## Kontakt Support

Hvis ingen av disse løsningene fungerer:

1. **Samle informasjon:**
   - Skjermbilde av feilen
   - Browser console output (F12 → Console → høyreklikk → Save as)
   - Hva du prøvde å gjøre
   
2. **Sjekk:**
   - Er du på riktig URL? (http://localhost:8003)
   - Er dev-serveren kjørende?
   - Er Supabase tilkoblet?

3. **Prøv:**
   ```bash
   # Full restart:
   npm run dev
   # I ny terminal:
   npm run build
   ```

## Preventive Maintenance

### Regelmessige sjekker:
```bash
# Sjekk for outdated packages:
npm outdated

# Oppdater dependencies:
npm update

# Rebuild project:
npm run build
```

### Database health check:
```sql
-- Antall regler per lokale:
SELECT 
  f.name,
  COUNT(fr.id) as rule_count
FROM facilities f
LEFT JOIN facility_rules fr ON fr.facility_id = f.id
GROUP BY f.id, f.name
ORDER BY rule_count DESC;
```

---

**Sist oppdatert:** 2024-12-04  
**Versjon:** 1.0
