# Security And Compliance

## Grundsatz

Die Plattform verarbeitet banknahe Bestell- und Versanddaten. Sie muss von Beginn an sicherheits- und auditfaehig gedacht werden.

## MVP-Sicherheitsregeln

- rollenbasierter Zugriff
- Tenant-Trennung nach Bank
- Audit-Log fuer kritische Aktionen
- keine harte Loeschung kritischer Daten
- Endkundendaten minimieren
- Lieferadressdaten nur zweckgebunden
- keine Endkundenzahlung ueber CashEx
- Report-Exports protokollieren

## Kritische Aktionen

Audit-pflichtig:

- Login
- fehlgeschlagener Login
- Bestellung angelegt
- Bestellung eingereicht
- Kurs gesetzt
- Gebuehr gesetzt
- Freigabe
- Sperrung
- Statuswechsel
- Versandreferenz gesetzt
- Reklamation angelegt
- Report exportiert
- Nutzerrolle geaendert
- Limit geaendert

## Vor echtem Bankpilot erforderlich

- Datenschutzkonzept
- IT-Sicherheitsreview
- Penetrationstest
- Backup- und Wiederherstellungstest
- Hosting- und Betriebskonzept
- regulatorische Pruefung KWG/ZAG/GwG
- Bankvertragliche Freigabe

