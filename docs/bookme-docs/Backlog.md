# One-Story-Point User Stories (Backlog)

Dette dokumentet beskriver en enkel backlog for MVP-versjonen av SpaceShare. Alle user stories er estimert til **1 Story Point** (meget små og håndterbare oppgaver).

---

## Autentisering og Brukerroller
- Som **ny bruker** vil jeg kunne registrere meg med e-post slik at jeg kan bruke systemet.  
- Som **innlogget bruker** vil jeg kunne logge inn med Google slik at jeg slipper å lage passord.  
- Som **utleier** vil jeg kunne opprette en profil slik at jeg kan administrere lokaler.  
- Som **leietaker** vil jeg kunne opprette en profil slik at jeg kan booke lokaler.  

---

## Lokalhåndtering (Utleier)
- Som **utleier** vil jeg kunne legge til et nytt lokale med navn, adresse og kapasitet slik at det kan bookes.  
- Som **utleier** vil jeg kunne laste opp bilder av lokalet slik at leietakere får bedre inntrykk.  
- Som **utleier** vil jeg kunne sette en pris per time slik at leietakere vet hva det koster.  
- Som **utleier** vil jeg kunne definere tilgjengelige tider i en kalender slik at booking blir korrekt.  

---

## Søk og Filtrering (Leietaker)
- Som **leietaker** vil jeg kunne søke etter lokaler basert på sted slik at jeg finner relevante lokaler.  
- Som **leietaker** vil jeg kunne filtrere på type lokale (møterom, gymsal, forsamlingssal) slik at jeg får presise resultater.  
- Som **leietaker** vil jeg kunne filtrere på kapasitet slik at jeg kan finne et lokale som passer antall personer.  
- Som **leietaker** vil jeg kunne se alle tilgjengelige lokaler i en liste slik at jeg kan sammenligne.  

---

## Bookingprosess
- Som **leietaker** vil jeg kunne velge dato og tid for et lokale slik at jeg kan reservere.  
- Som **leietaker** vil jeg kunne se totalprisen før jeg bekrefter slik at jeg vet kostnaden.  
- Som **leietaker** vil jeg kunne bekrefte booking med ett klikk slik at prosessen er rask.  
- Som **utleier** vil jeg kunne motta en bekreftelse på en booking slik at jeg vet at lokalet er opptatt.  

---

## Betaling
- Som **leietaker** vil jeg kunne betale med kort via Stripe slik at jeg kan fullføre booking.  
- Som **system** vil jeg holde betalingen i escrow slik at utleier først får penger etter leieperioden.  
- Som **leietaker** vil jeg kunne kansellere og få refusjon hvis reglene tillater det.  
- Som **utleier** vil jeg kunne motta utbetaling etter booking er fullført slik at jeg får betalt.  

---

## Meldinger
- Som **leietaker** vil jeg kunne sende melding til utleier slik at jeg kan stille spørsmål.  
- Som **utleier** vil jeg kunne svare på meldinger fra leietakere slik at jeg kan gi informasjon.  
- Som **system** vil jeg sende e-postvarsler om nye meldinger slik at ingen går glipp av kommunikasjon.  

---

## Anmeldelser
- Som **leietaker** vil jeg kunne gi en rating etter fullført booking slik at andre ser min erfaring.  
- Som **leietaker** vil jeg kunne skrive en kort kommentar slik at jeg kan utdype min erfaring.  
- Som **utleier** vil jeg kunne gi en rating av leietaker slik at andre utleiere vet hvem de leier til.  
- Som **system** vil jeg vise gjennomsnittsrating på lokaler slik at brukere kan vurdere kvalitet.  
