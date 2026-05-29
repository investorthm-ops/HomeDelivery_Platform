# AGENTS.md

## Arbeitsweise

Dieses Repo enthaelt die CashEx HomeDelivery Platform. Arbeite konservativ, sauber und auditierbar.

## Produktfokus

Aktiver Fokus ist ein Bank-Pilot-MVP:

- Bankportal
- CashEx-Ops
- Compliance/Audit
- Versandstatus
- Reklamationen
- CSV-Reports

Kein Direktkunden-Shop und keine Endkundenzahlung im MVP.

## Sprache und Stil

- App-Oberflaeche: Deutsch.
- Fachliche Dokumente: Deutsch.
- Code und technische Bezeichner: Englisch, wenn es dem Stack entspricht.
- Markdown bevorzugt ASCII (`ae/oe/ue/ss`), ausser der Nutzer fordert explizit Umlaute.

## Sicherheitsregeln

- Jede kritische Aktion muss Audit-Log erzeugen.
- Keine harte Loeschung von Audit-Logs.
- Bankdaten muessen tenant-getrennt gedacht werden.
- Endkundendaten minimieren.
- Rollen und Rechte nicht nachtraeglich "dranbauen", sondern von Anfang an beachten.
- Vor echtem Bankpilot sind externe Security-, Datenschutz- und Rechtsreviews erforderlich.

## Geplanter Stack

- Next.js
- TypeScript
- PostgreSQL / Supabase
- Supabase Auth oder Auth.js
- Playwright
- Vitest

## Relevante Dokumente

- `AGENT.MD`
- `docs/01_product_scope.md`
- `docs/02_architecture.md`
- `docs/03_data_model.md`
- `docs/04_status_and_roles.md`
- `docs/05_security_compliance.md`
- `docs/06_mvp_backlog.md`
- `docs/07_acceptance_tests.md`

## Git

- Keine grossen generierten Artefakte committen.
- Keine Secrets committen.
- `.env` bleibt lokal.
- Beispielwerte nur in `.env.example`.

