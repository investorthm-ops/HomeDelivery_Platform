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
