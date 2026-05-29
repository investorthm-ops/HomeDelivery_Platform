# AGENT.MD - CashEx HomeDelivery Platform Memory

Stand: 29.05.2026

Diese Datei ist die Projekt-Memory fuer Codex/Claude Code in diesem Repo.

## Projekt

Name: CashEx HomeDelivery Platform

Repo: `investorthm-ops/HomeDelivery_Platform`

Zweck: Aufbau einer eigenen IT-Plattform fuer das CashEx Home-Delivery-Konzept in Deutschland.

## Strategisches Ziel

CashEx soll als digitaler Home-Delivery-Sortenpartner fuer Banken aufgebaut werden.

Zielmodell fuer den Start:

> Kunde bestellt Fremdwaehrung bei seiner Bank. Die Bank prueft Kunde, Konto, Zahlung und Compliance. Die Bank bestellt ueber die CashEx-Plattform. CashEx beschafft, prueft, verpackt und versendet versichert an die Endkundenadresse. CashEx rechnet B2B mit der Bank ab.

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

- Bank-Admin
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
4. Rueckfrage
5. Bankfreigabe erforderlich
6. Bankfreigegeben
7. CashEx-freigegeben
8. Beschaffung
9. Wareneingang
10. Geprueft
11. Reserviert
12. Kommissioniert
13. Versandbereit
14. Uebergeben
15. Zugestellt
16. Abgeschlossen
17. Storniert
18. Reklamiert
19. Gesperrt

## Geplanter Stack

Empfehlung:

- Next.js
- TypeScript
- PostgreSQL / Supabase
- Supabase Auth oder Auth.js
- Vercel oder vergleichbares Hosting
- Playwright
- Vitest

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

