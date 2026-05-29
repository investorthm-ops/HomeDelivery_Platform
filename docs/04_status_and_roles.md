# Status And Roles

## Rollen

| Rolle | Rechte |
|---|---|
| Bank-Admin | Bankprofil, Nutzer, Filialen, Reports |
| Bank-User | Bestellung anlegen, Status sehen |
| Bank-Freigeber | Bestellungen freigeben |
| CashEx-Ops | Bestellung pruefen, bearbeiten, Versand erfassen |
| CashEx-Compliance | sperren, entsperren, Audit ansehen, Limits pflegen |
| CashEx-Management | Gesamtuebersicht, Volumen, Risiken |
| Revision | nur lesen |

## Statuskette

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

## Statusregeln

- Statuswechsel laufen ueber definierte Aktionen.
- Unerlaubte Spruenge werden blockiert.
- Jede Statusaenderung erzeugt `order_status_events`.
- Jede kritische Statusaenderung erzeugt `audit_logs`.
- Gesperrte Bestellungen duerfen nicht kommissioniert oder versendet werden.

