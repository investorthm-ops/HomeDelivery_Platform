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
- customer_reference_bank
- compliance_flag
- created_at
- updated_at

## Kernfelder Versand

- order_id
- logistics_provider
- shipment_reference
- insured_value_eur
- package_type
- handed_over_at
- delivered_at
- shipment_status
- proof_of_delivery_reference

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

