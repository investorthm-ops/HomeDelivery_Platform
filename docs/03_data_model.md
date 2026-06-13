# MVP Data Model

## Grundsatz

Das MVP-Datenmodell bildet Bankbestellungen, CashEx-Operations, Versand, Audit und Reklamationen ab.

## Tabellen

| Tabelle | Zweck |
|---|---|
| banks | Bankpartner |
| branches | Bankfilialen oder Bank-Serviceeinheiten |
| users | Plattformnutzer |
| roles | Rollen |
| user_roles | Rollenzuordnung |
| currencies | Waehrungen |
| orders | Bestellungen |
| order_amounts | Waehrungsbetrag, EUR-Gegenwert, Kurs |
| order_fees | Gebuehren |
| delivery_addresses | Lieferadressen |
| shipments | Versanddaten |
| order_status_events | Statushistorie |
| audit_logs | Audit-Log |
| complaints | Reklamationen |
| files | Belege und Dokumente |
| suppliers | Sortengrosshaendler / Landesbank |
| logistics_partners | Wertlogistiker / Kurierdienste |
| partner_screenings | Sanktions-/PEP-/Negativlisten-Pruefung je Partner |
| order_limits | gestufte Limits je Bank / Filiale / Waehrung |
| order_aggregates | kumulierte Volumina je Filiale/Waehrung/Zeitraum (Stueckelung) |
| suspicion_cases | Verdachtsfaelle / Red-Flag-Faelle / SAR-Vorbereitung |

Hinweis Umsetzung: In `supabase/schema.sql` sind `users`, `roles` und `user_roles` als eine Tabelle `profiles` (Supabase-Auth-Pattern) umgesetzt. Die Rolle liegt in `profiles.role`, nicht in `user_metadata`.

Die Tabellen ab `suppliers` schliessen die Compliance-/GwG-Luecken aus dem Konzept-Repo (`../../01_Aktiver_Fokus_B2B_HomeDelivery/01_Konzept/CashEx_MVP_Lueckenanalyse.md`, Luecken #1-#5). Sie sind MVP-Scope. Detailfelder siehe dort und im Konzept-Datenmodell Kap. 9. Noch nicht in `schema.sql` umgesetzt.

## Wichtige Regeln

- `orders.current_status` enthaelt den aktuellen Status.
- `order_status_events` enthaelt die komplette Historie.
- `audit_logs` ist append-only zu denken.
- Endkundendaten werden nur gespeichert, wenn fuer Versand noetig.
- Keine Zahlungsdaten des Endkunden im MVP.

## Kernfelder Bestellung

- order_reference
- bank_id
- branch_id
- created_by_user_id
- approved_by_user_id
- current_status
- requested_delivery_date
- delivery_option
- is_express
- supplier_id (nach Beschaffungsentscheidung)
- customer_reference_bank
- compliance_flag
- risk_level (niedrig/mittel/hoch/kritisch)
- created_at
- updated_at

## Kernfelder Versand

- order_id
- logistics_partner_id
- shipment_reference
- insured_value_eur
- package_type
- seal_number
- counted_amount_confirmed
- difference_amount_eur
- second_check_user_id (Vier-Augen Kommissionierung)
- handed_over_at
- delivered_at
- shipment_status
- proof_of_delivery_reference

## Kernfelder Bank-KYB

- register_number
- lei_or_bic_optional
- bafin_or_institute_status
- beneficial_owner_note
- escalation_contact

## Compliance- und GwG-Entitaeten (MVP)

Leichtgewichtig, keine externe API. Screening und Aggregation entstehen durch erfasste Eintraege und einfache Auswertungen.

- `suppliers` / `logistics_partners`: Partnerstammdaten mit kyb_status, Eskalationskontakt, Vertrags-/Versicherungsreferenz, status.
- `partner_screenings`: ein Eintrag je Pruefung (Sanktion/PEP/Negativliste), result ohne_Treffer/Treffer/zur_Klaerung. Ohne `ohne_Treffer` keine Partnerfreigabe.
- `order_limits`: gestufte Schwellen (2.500/10.000/25.000 EUR) als Pflegeregeln statt Hardcode.
- `order_aggregates`: kumulierte Volumina je Filiale/Waehrung/Monat, Flag bei Stueckelungsmuster. Kann als View umgesetzt werden.
- `suspicion_cases`: Verdachtsfall mit Ausloeser, gepruefte Unterlagen, Entscheidung, optionaler Meldereferenz. Offener Fall blockiert Kommissionierung/Versand.

## Kernfelder Audit

- actor_user_id
- actor_role
- bank_id
- order_id
- action
- entity_type
- entity_id
- ip_address_optional
- user_agent_optional
- created_at

