# AGENT.MD - CashEx HomeDelivery Platform Memory

Stand: 12.06.2026

Diese Datei ist die Projekt-Memory fuer Codex/Claude Code in diesem Repo.

## Projekt

Name: CashEx HomeDelivery Platform

Repo: `investorthm-ops/HomeDelivery_Platform`

Zweck: Aufbau einer eigenen IT-Plattform fuer das CashEx Home-Delivery-Konzept in Deutschland.

## Strategisches Ziel

CashEx soll als digitaler Home-Delivery-Sortenpartner fuer Banken aufgebaut werden.

Zielmodell fuer den Start:

> Kunde bestellt Fremdwaehrung bei seiner Bank. Die Bank prueft Kunde, Konto, Zahlung und Compliance. Die Bank bestellt ueber die CashEx-Plattform. CashEx beschafft, prueft, verpackt und versendet versichert an die Endkundenadresse. CashEx rechnet B2B mit der Bank ab.

## White-Label / Co-Branding Logik

CashEx kann als White-Label-Anbieter fuer Banken auftreten.

Definition:

> CashEx macht die operative Arbeit im Hintergrund, aber die Bank bietet den Service gegenueber dem Kunden unter eigener Marke an.

Varianten:

- verdecktes White Label: nur Bankmarke sichtbar
- Co-Branded: "Ein Service der Bank in Zusammenarbeit mit CashEx"

Empfehlung fuer Start:

> Co-Branded ist fuer den ersten Bank-Pilot realistischer, weil Vertrauen, Haftung, Transparenz und Supportwege sauberer erklaert werden koennen.

Wichtig fuer Produkt und UI:

- Bank bleibt Kundenschnittstelle.
- CashEx darf im Hintergrund als Fulfillment-/Sortenpartner sichtbar sein, wenn Vertrag und Bank das erlauben.
- Kundentexte muessen je Bank konfigurierbar sein.
- Branding sollte spaeter pro Bank konfigurierbar sein, aber nicht im ersten MVP ueberladen werden.

## Harte Startannahmen

- Bank bleibt Kundenschnittstelle.
- Kunde zahlt an Bank.
- CashEx nimmt im MVP keine Endkundenzahlung an.
- CashEx bietet im MVP keinen Direktkunden-Shop.
- CashEx startet mit manueller CashEx-Freigabe jeder Bestellung.
- Regulatorische Freigabe wird nicht durch IT ersetzt.
- Externe Pruefung fuer Security, Datenschutz, BaFin/KWG/ZAG/GwG bleibt notwendig.

## MVP-Ziel

Bank-Pilot-MVP mit:

- Login und Rollen
- Bank-/Filialverwaltung
- Nutzerverwaltung
- Bestellmaske fuer Banknutzer
- manuelle Kurs- und Gebuehrenerfassung
- CashEx-Ops-Board
- Statuslogik
- Audit-Log
- Versandreferenz und Zustellstatus
- Reklamationsstatus
- einfache CSV-Reports

## Aktueller Projektstand

Der erste technische MVP ist als getestete Pilot-Simulation umgesetzt und auf GitHub im Branch `main` gespeichert.

Aktueller Commit:

`c09c2c1 Add bank admin role and lock dependencies`

Umgesetzt:

- Next.js App Router mit TypeScript und Tailwind
- lokale Seed-Daten fuer Banken, Filialen, Nutzer, Waehrungen und Bestellungen
- Bankportal mit Bestellformular
- CashEx-Ops-Orderboard
- definierte Statuswechsel
- rollenbasierte Berechtigungslogik
- bank- und filialbezogene Datensicht
- Audit-Log fuer kritische Aktionen
- Reklamation, Versandreferenz und Zustellstatus
- CSV-Export und einfache Management-Kennzahlen
- Supabase/PostgreSQL-Zielschema mit RLS-Grundansatz
- versionierte npm-Abhaengigkeiten durch `package-lock.json`

Verifizierter Stand am 12.06.2026:

- 6 Vitest-Unit-Tests bestanden
- 2 Playwright-End-to-End-Tests bestanden
- TypeScript-Typecheck bestanden
- ESLint bestanden
- Next.js-Produktions-Build bestanden

Wichtige Grenze:

> Die Anwendung ist aktuell eine funktionierende Pilot-Simulation mit lokalen Seed-Daten. Sie ist noch keine produktive Mehrbenutzeranwendung und noch nicht fuer einen echten Bankbetrieb freigegeben.

## Nicht im MVP

- Direktkundenportal
- Online-Zahlung durch Endkunden
- Bankkernsystem-API
- automatische Lieferantenbestellung
- automatische Logistikschnittstelle
- Live-FX-Kurse ohne manuelle Freigabe
- vollautomatisches Sanktionsscreening
- Mobile App

## Rollen

- Bank-Admin (`bank_admin`): bankweite Sicht auf die eigene Bank und Reportexport; keine CashEx-Ops-Rechte
- Bank-User
- Bank-Freigeber
- CashEx-Ops
- CashEx-Compliance
- CashEx-Management
- Revision / Read-only

## Kernobjekte

- Bank
- Branch / Filiale / Bank-Serviceeinheit
- User
- Role
- Order
- Currency
- Rate
- Fee
- DeliveryAddress
- Shipment
- OrderStatusEvent
- AuditLog
- Complaint
- File / Document

## Statuslogik

MVP-Statuskette:

1. Entwurf
2. Eingereicht
3. In Pruefung
4. Bankfreigabe erforderlich
5. Bankfreigegeben
6. CashEx-freigegeben
7. Beschaffung
8. Wareneingang
9. Geprueft
10. Reserviert
11. Kommissioniert
12. Versandbereit
13. Uebergeben
14. Zugestellt
15. Abgeschlossen
16. Storniert
17. Reklamiert
18. Gesperrt

Hinweis: `Rueckfrage` ist fachlich vorgesehen, aber im aktuellen Domainmodell noch nicht als eigener technischer Status umgesetzt.

## Technischer Stack

- Next.js
- TypeScript
- PostgreSQL / Supabase
- Supabase Auth oder Auth.js
- Vercel oder vergleichbares Hosting
- Playwright
- Vitest

## Naechster Meilenstein

Der naechste Zielzustand ist die echte Supabase-Mehrbenutzer-Pilotbasis:

> Ein Banknutzer meldet sich mit einer echten Rolle an, legt eine Bestellung an und findet sie nach einem Neustart weiterhin in der Datenbank. CashEx bearbeitet denselben Auftrag ueber einen getrennten Zugang. Nutzer einer anderen Bank koennen weder die Bestellung noch zugehoerige Daten sehen.

Dafuer sind als Naechstes erforderlich:

1. Supabase-Projekt anbinden und Schema als echte Migration verwalten.
2. Supabase Auth mit serverseitig geprueften Sessions einbauen.
3. Rollen und Bankzuordnung in `profiles` dauerhaft speichern.
4. Bestellungen, Statusereignisse, Versand und Reklamationen persistent speichern.
5. RLS fuer alle exponierten Tabellen vollstaendig definieren und mit zwei Banken testen.
6. Audit-Log serverseitig und append-only schreiben.
7. Backup-/Restore-Prozess und Hosting vorbereiten.

Noch nicht Teil dieses Meilensteins:

- produktiver Bankbetrieb
- automatische Bank-, Lieferanten- oder Logistik-APIs
- Endkundenzahlung an CashEx
- finale Security-, Datenschutz- oder regulatorische Freigabe

## Engineering-Regeln

- Keine personenbezogenen Endkundendaten speichern, wenn sie fuer den MVP nicht zwingend noetig sind.
- Lieferadressdaten nur zweckgebunden speichern.
- Audit-Log append-only denken.
- Kritische Daten nicht hart loeschen; sperren/archivieren.
- Bankdaten strikt trennen.
- Jede Statusaenderung erzeugt einen Audit-Log-Eintrag.
- Jede Reportausgabe wird protokolliert.
- Rollen und Berechtigungen immer zuerst mitdenken.
- Keine "Demo-Abkuerzung" in sicherheitskritischen Pfaden ohne Markierung.

## Produktprinzip

Erst pilotfaehig, dann automatisieren.

Der erste MVP muss nicht perfekt sein, aber er muss kontrollierbar, nachvollziehbar und auditierbar sein.

## Bank-Pilot-MVP Verstaendnis

Der Bank-Pilot-MVP ist nicht als sofort skalierendes Vollprodukt gedacht.

Er soll beweisen:

- Bank versteht und akzeptiert den Prozess.
- CashEx kann Bestellungen sauber annehmen.
- Kurse, Gebuehren und Freigaben funktionieren.
- Sorten koennen beschafft, geprueft, verpackt und versendet werden.
- Versand zum Endkunden ist versicherbar und nachvollziehbar.
- Reklamationen, Storno und Differenzen sind beherrschbar.
- echte Kosten pro Bestellung werden messbar.

Empfohlener Pilot:

- 1 Bankpartner
- 1 zentrale Bankeinheit oder 3-5 Pilotfilialen
- 5-8 Kernwaehrungen
- Laufzeit 3 Monate
- niedriges Bestelllimit pro Auftrag
- manuelle CashEx-Freigabe jeder Bestellung
- keine Endkundenzahlung an CashEx
- keine Direktkunden-App

Harte Klaerpunkte vor Pilot:

- Darf CashEx direkt an Endkunden liefern?
- Welche Versicherung deckt den Versand?
- Wann gehen Eigentum und Gefahr ueber?
- Was passiert bei Verlust?
- Wer haftet bei falscher Adresse?
- Welche Endkundendaten darf CashEx speichern?
- Wie schnell zahlt die Bank CashEx?
- Was passiert bei Storno nach Beschaffung?
