# CashEx HomeDelivery Platform

Bank-Pilot-MVP fuer das CashEx Home-Delivery-Konzept.

## Ziel

Diese Plattform soll Banken ermoeglichen, Fremdwaehrungsbestellungen digital an CashEx zu uebergeben. CashEx verarbeitet die Bestellung im Sorten-Hub, dokumentiert jeden Schritt und erfasst Versand- und Zustellinformationen.

Startmodell:

> Kunde bestellt und zahlt bei der Bank. CashEx nimmt keine Endkundenzahlung an. CashEx rechnet B2B mit der Bank ab.

## MVP-Fokus

Enthalten:

- Bankportal fuer Bestellungen
- CashEx-Ops-Board
- Rollen und Rechte
- Statuslogik
- Audit-Log
- manuelle Kurs- und Gebuehrenerfassung
- Versandreferenz und Zustellstatus
- Reklamationen
- CSV-Reports

Nicht enthalten:

- Direktkundenportal
- Endkundenzahlung
- Bankkernsystem-API
- automatische Lieferantenbestellung
- automatische Logistikschnittstelle
- vollautomatisches AML-/Sanktionsscreening

## Geplanter Stack

- Next.js
- TypeScript
- PostgreSQL / Supabase
- Vercel oder vergleichbares Hosting
- Playwright fuer End-to-End-Tests
- Vitest fuer Fachlogik-Tests

## Dokumentation

| Datei | Zweck |
|---|---|
| `AGENT.MD` | Projekt-Memory fuer Codex/Claude |
| `AGENTS.md` | Agenten-Regeln und Arbeitsweise im Repo |
| `docs/01_product_scope.md` | Zielbild, MVP-Scope und Nicht-Ziele |
| `docs/02_architecture.md` | technische Zielarchitektur |
| `docs/03_data_model.md` | fachliches Datenmodell |
| `docs/04_status_and_roles.md` | Rollen, Rechte und Statuslogik |
| `docs/05_security_compliance.md` | Security-, Datenschutz- und Compliance-Annahmen |
| `docs/06_mvp_backlog.md` | priorisiertes MVP-Backlog |
| `docs/07_acceptance_tests.md` | Abnahmetests fuer den Bank-Pilot-MVP |

## Leitprinzipien

1. Kleine, pruefbare Schritte.
2. Keine Kundenzahlung ueber CashEx im MVP.
3. Jede kritische Aktion schreibt Audit-Log.
4. Bankdaten werden sauber getrennt.
5. Manuelle Kontrolle vor Automatisierung.
6. Externe Security-, Datenschutz- und Rechtspruefung vor echtem Pilotbetrieb.

