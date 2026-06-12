import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { canAct, canTransition, isOrderVisibleForUser, roleLabels, toCsv } from "./domain";
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

  it("kennt Bank-Admin als eigene Bankrolle mit bankweiter Sicht und Reportrecht", () => {
    const bankAdmin = users.find((user) => user.id === "user-bank-admin");
    const spardaOrder = initialOrders.find((order) => order.bankId === "bank-sparda" && order.branchId === "branch-wi");
    const foreignOrder = initialOrders.find((order) => order.bankId === "bank-test");

    expect(roleLabels.bank_admin).toBe("Bank-Admin");
    expect(bankAdmin?.role).toBe("bank_admin");
    expect(canAct("bank_admin", "export_report")).toBe(true);
    expect(canAct("bank_admin", "ops_update")).toBe(false);
    expect(spardaOrder).toBeDefined();
    expect(foreignOrder).toBeDefined();
    expect(isOrderVisibleForUser(spardaOrder!, bankAdmin!)).toBe(true);
    expect(isOrderVisibleForUser(foreignOrder!, bankAdmin!)).toBe(false);
  });

  it("laesst Bank-Admin im Supabase-Profilrollen-Constraint zu", () => {
    const schema = readFileSync(join(process.cwd(), "supabase", "schema.sql"), "utf8");

    expect(schema).toContain("'bank_admin'");
  });

  it("erstellt einen CSV-Report mit Status und Versandspalte", () => {
    const csv = toCsv([initialOrders[0]]);

    expect(csv).toContain("order_reference");
    expect(csv).toContain("CX-2026-0001");
    expect(csv).toContain("Eingereicht");
  });
});
