# MVP Backlog

## Phase 0 - Spezifikation

- Rollenmatrix finalisieren
- Statuslogik finalisieren
- Datenmodell finalisieren
- MVP-Scope fixieren
- White-Label/Co-Branding-Logik fuer Pilot festlegen
- Bank-spezifische Texte und Referenzen definieren
- Testdaten definieren
- Datenschutzannahmen pruefen

## Phase 1 - Fundament

- Next.js/TypeScript Projekt anlegen
- UI-Grundlayout bauen
- PostgreSQL/Supabase anbinden
- Auth einrichten
- Rollenmodell technisch abbilden
- Seed-Daten erstellen

## Phase 2 - Bankportal

- Bank-Dashboard
- Bestellmaske
- Bestelluebersicht
- Bankfreigabe
- Bank-spezifische Bestellreferenz anzeigen
- Co-Branding-Hinweis optional vorbereiten
- Reklamation melden
- CSV-Report

## Phase 2.5 - Partnerstammdaten

- Bank-KYB-Felder (LEI/BIC, Register, BaFin-Status, wB, Eskalationskontakt)
- Lieferantenverwaltung (suppliers anlegen, pruefen, freigeben)
- Logistikpartnerverwaltung (logistics_partners anlegen, pruefen, freigeben)
- Partner-Screening erfassen (Freigabe blockiert ohne Ergebnis)

## Phase 3 - CashEx-Ops

- Ops-Orderboard
- Orderpruefung
- Kurs/Gebuehr erfassen
- Beschaffung/Wareneingang
- Kommissionierung
- Versand
- Abschluss

## Phase 4 - Compliance und Audit

- Audit-Log schreiben
- Audit-Log anzeigen
- Sperrung
- gestufte Limits (order_limits, Freigabestufe je Schwelle)
- kumulierte Aggregation (order_aggregates, Stueckelungs-Flag)
- Red-Flag-Monitoring (Auffaelligkeitsindikatoren)
- Verdachtsfall-Workflow (suspicion_cases, blockiert Bestellung)
- Exportprotokoll
- Datenschutz-Auskunft
- Monitoring-Reports (Wochen/Monat: Volumen, Expressquote, Limitnutzung)

## Phase 5 - Tests und Pilot-Haertung

- End-to-End-Test 1.000 USD
- Rechte-Tests
- Statuswechsel-Tests
- Audit-Tests
- Backup-Test
- Security-Review

## Nicht-Ziele (MVP)

- Direktkundenportal, Endkundenzahlung, Bankkernsystem-API
- automatische Lieferanten-/Logistikschnittstelle, vollautomatische Kurse
- vollautomatisches AML-/Sanktionsscreening (manuelle Erfassung bleibt im MVP)
- Rueckkauf/Retouren von Banknoten (eigenes Bargeldherkunfts-Risiko; im Pilot ausgeschlossen)
