# Architecture

## Empfohlener Stack

| Ebene | Technologie |
|---|---|
| Frontend | Next.js, React, TypeScript |
| UI | Tailwind oder shadcn/ui |
| Backend | Next.js Server Actions oder API Routes |
| Datenbank | PostgreSQL / Supabase |
| Auth | Supabase Auth oder Auth.js |
| Hosting | Vercel oder vergleichbares Hosting |
| Tests | Playwright, Vitest |

## Module

### Bankportal

- Bestellung anlegen
- Status ansehen
- Freigaben durchfuehren
- Reklamation melden
- Reports herunterladen

### CashEx-Ops

- Orderboard
- Orderpruefung
- Kurs und Gebuehren setzen
- Beschaffung und Wareneingang dokumentieren
- Kommissionierung dokumentieren
- Versandreferenz erfassen
- Zustellung abschliessen

### Compliance

- Limits
- Sperrung
- Audit-Log
- Reklamationen
- Export fuer Pruefung

### Management

- Volumen
- Marge
- offene Bestellungen
- Banken
- Risiken

## Architekturprinzipien

- Tenant-Trennung nach Bank.
- Rollenbasierte Rechte.
- Audit-Log fuer kritische Aktionen.
- Keine direkte Endkundenzahlung.
- Manuelle Kontrolle vor Automatisierung.
- Datenminimierung bei Endkundendaten.

## Spaetere Erweiterungen

- Logistik-API
- Lieferanten-API
- automatisierte Kursversorgung
- PDF-Reports
- 2FA fuer alle Bank- und CashEx-Rollen
- Monitoring und Alerting
- Security-Audit und PenTest

