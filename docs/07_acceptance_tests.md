# Acceptance Tests

## Fachlicher Haupttest

Eine Bank legt eine Bestellung ueber 1.000 USD an.

Erwarteter Ablauf:

1. Bank-User erstellt Bestellung.
2. Bestellung wird eingereicht.
3. CashEx-Ops prueft Bestellung.
4. CashEx setzt Kurs und Gebuehren.
5. CashEx gibt Bestellung frei.
6. Beschaffung wird dokumentiert.
7. Wareneingang wird dokumentiert.
8. Bestellung wird geprueft und reserviert.
9. Bestellung wird kommissioniert.
10. Versandreferenz wird erfasst.
11. Zustellung wird dokumentiert.
12. Bestellung wird abgeschlossen.

Akzeptanz:

- jeder Statuswechsel ist sichtbar
- jeder kritische Schritt steht im Audit-Log
- Bank sieht nur eigene Bestellung
- CashEx sieht operative Details
- Revision kann nur lesen

## White-Label / Co-Branding Test

Ein Banknutzer sieht die Bestellung im Kontext seiner Bank.

Akzeptanz:

- Bankname ist der Bestellung zugeordnet.
- Bankreferenz ist sichtbar.
- CashEx bleibt im MVP als operativer Partner nachvollziehbar.
- Es gibt keine direkte CashEx-Endkundenzahlung.
- Kundensupportweg bleibt ueber die Bank definierbar.

## Rechte-Tests

- Bank-User sieht nur eigene Bank.
- Bank-User kann keine CashEx-Ops-Aktion ausfuehren.
- Bank-Freigeber kann freigeben, aber nicht kommissionieren.
- CashEx-Ops kann bearbeiten, aber Audit-Log nicht loeschen.
- Compliance kann sperren.
- Revision kann nichts veraendern.

## Fehlerfaelle

- Storno nach Kursfixierung
- Reklamation wegen Differenz
- Gesperrte Bestellung darf nicht versendet werden
- Banknutzer versucht fremde Bankdaten zu sehen
- Versandreferenz fehlt
- Zustellstatus bleibt offen

## Sicherheits- und Betriebsabnahme

- fehlgeschlagene Logins werden protokolliert
- Reportexport wird protokolliert
- Backup ist vorhanden
- Wiederherstellung wurde getestet
- keine Secrets im Repo
- `.env` ist nicht versioniert
