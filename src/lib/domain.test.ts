import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  canAct,
  canTransition,
  isOrderBlockedBySuspicion,
  isOrderVisibleForUser,
  isPartnerReleasable,
  roleLabels,
  toCsv,
  type PartnerScreening,
  type SuspicionCase,
} from "./domain";
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

  it("enthaelt die Compliance-Tabellen im Schema", () => {
    const schema = readFileSync(join(process.cwd(), "supabase", "schema.sql"), "utf8");

    for (const table of [
      "public.suppliers",
      "public.logistics_partners",
      "public.partner_screenings",
      "public.order_limits",
      "public.order_aggregates",
      "public.suspicion_cases",
    ]) {
      expect(schema).toContain(`create table ${table}`);
    }
  });

  it("gibt Partner nur bei juengstem no_hit frei", () => {
    const screenings: PartnerScreening[] = [
      {
        id: "s1",
        partnerType: "supplier",
        partnerId: "sup-1",
        screeningType: "sanction",
        result: "hit",
        checkedByUserId: "user-compliance",
        checkedAt: "2026-06-01T10:00:00.000Z",
      },
      {
        id: "s2",
        partnerType: "supplier",
        partnerId: "sup-1",
        screeningType: "sanction",
        result: "no_hit",
        checkedByUserId: "user-compliance",
        checkedAt: "2026-06-10T10:00:00.000Z",
      },
    ];

    expect(isPartnerReleasable("supplier", "sup-1", screenings)).toBe(true);
    expect(isPartnerReleasable("supplier", "sup-unknown", screenings)).toBe(false);
  });

  it("blockiert Bestellung bei offenem oder eskaliertem Verdachtsfall", () => {
    const cases: SuspicionCase[] = [
      {
        id: "c1",
        orderId: "order-1",
        bankId: "bank-sparda",
        trigger: "Stueckelung",
        detectedBy: "system",
        detectedAt: "2026-06-10T10:00:00.000Z",
        noCustomerWarningConfirmed: false,
      },
      {
        id: "c2",
        orderId: "order-2",
        bankId: "bank-sparda",
        trigger: "Plausibilitaet",
        detectedBy: "user",
        detectedAt: "2026-06-10T10:00:00.000Z",
        decision: "approved",
        noCustomerWarningConfirmed: true,
      },
    ];

    expect(isOrderBlockedBySuspicion("order-1", cases)).toBe(true);
    expect(isOrderBlockedBySuspicion("order-2", cases)).toBe(false);
    expect(isOrderBlockedBySuspicion("order-3", cases)).toBe(false);
  });

  it("erstellt einen CSV-Report mit Status und Versandspalte", () => {
    const csv = toCsv([initialOrders[0]]);

    expect(csv).toContain("order_reference");
    expect(csv).toContain("CX-2026-0001");
    expect(csv).toContain("Eingereicht");
  });
});
