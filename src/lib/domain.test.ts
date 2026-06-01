import { describe, expect, it } from "vitest";
import { canAct, canTransition, isOrderVisibleForUser, toCsv } from "./domain";
import { initialOrders, users } from "./seed";

describe("CashEx MVP Fachlogik", () => {
  it("erlaubt nur definierte Statuswechsel", () => {
    expect(canTransition("submitted", "under_review")).toBe(true);
    expect(canTransition("submitted", "completed")).toBe(false);
    expect(canTransition("blocked", "under_review")).toBe(true);
  });

  it("trennt Bankdaten nach Tenant", () => {
    const bankUser = users.find((user) => user.id === "user-bank");
    const foreignOrder = initialOrders.find((order) => order.bankId === "bank-test");

    expect(bankUser).toBeDefined();
    expect(foreignOrder).toBeDefined();
    expect(isOrderVisibleForUser(foreignOrder!, bankUser!)).toBe(false);
  });

  it("verhindert CashEx-Ops-Aktionen fuer Bank-User", () => {
    expect(canAct("bank_user", "create_order")).toBe(true);
    expect(canAct("bank_user", "ops_update")).toBe(false);
    expect(canAct("cashex_ops", "ops_update")).toBe(true);
  });

  it("erstellt einen CSV-Report mit Status und Versandspalte", () => {
    const csv = toCsv([initialOrders[0]]);

    expect(csv).toContain("order_reference");
    expect(csv).toContain("CX-2026-0001");
    expect(csv).toContain("Eingereicht");
  });
});
