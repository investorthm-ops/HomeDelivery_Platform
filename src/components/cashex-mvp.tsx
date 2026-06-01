"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  ClipboardCheck,
  Download,
  FileWarning,
  Lock,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  canAct,
  canTransition,
  createAuditLog,
  isOrderVisibleForUser,
  nextPilotStatus,
  roleLabels,
  statusLabels,
  toCsv,
  type AuditLog,
  type Complaint,
  type Order,
  type OrderStatus,
  type PlatformUser,
} from "@/lib/domain";
import { banks, branches, currencies, initialAuditLogs, initialComplaints, initialOrders, users } from "@/lib/seed";

type Props = {
  supabaseConfigured: boolean;
};

type OrderFormState = {
  branchId: string;
  currencyCode: string;
  foreignAmount: string;
  requestedDeliveryDate: string;
  customerReferenceBank: string;
  deliveryOption: "standard" | "express";
};

const statusTone: Partial<Record<OrderStatus, string>> = {
  submitted: "bg-blue-50 text-blue-800 border-blue-200",
  under_review: "bg-yellow-50 text-yellow-900 border-yellow-200",
  bank_approval_required: "bg-amber-50 text-amber-900 border-amber-200",
  cashex_approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  procurement: "bg-indigo-50 text-indigo-800 border-indigo-200",
  handed_over: "bg-sky-50 text-sky-800 border-sky-200",
  completed: "bg-green-50 text-green-800 border-green-200",
  complained: "bg-orange-50 text-orange-800 border-orange-200",
  blocked: "bg-red-50 text-red-800 border-red-200",
};

export function CashExMvp({ supabaseConfigured }: Props) {
  const [activeUserId, setActiveUserId] = useState("user-bank");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [selectedOrderId, setSelectedOrderId] = useState("order-1000-usd");
  const [form, setForm] = useState<OrderFormState>({
    branchId: "branch-ffm",
    currencyCode: "USD",
    foreignAmount: "1000",
    requestedDeliveryDate: "2026-06-08",
    customerReferenceBank: "SP-FM-REISE-8841",
    deliveryOption: "standard",
  });

  const activeUser = users.find((user) => user.id === activeUserId) ?? users[0];
  const visibleOrders = useMemo(() => orders.filter((order) => isOrderVisibleForUser(order, activeUser)), [activeUser, orders]);
  const selectedOrder = visibleOrders.find((order) => order.id === selectedOrderId) ?? visibleOrders[0];
  const selectedBank = selectedOrder ? banks.find((bank) => bank.id === selectedOrder.bankId) : banks[0];
  const selectedBranch = selectedOrder ? branches.find((branch) => branch.id === selectedOrder.branchId) : branches[0];
  const bankOrders = orders.filter((order) => order.bankId === "bank-sparda");
  const openOrders = orders.filter((order) => !["completed", "cancelled"].includes(order.status));
  const totalVolume = bankOrders.reduce((sum, order) => sum + order.eurAmount, 0);
  const totalMargin = bankOrders.reduce((sum, order) => sum + order.eurAmount * (order.marginPercent / 100), 0);

  function addAudit(actor: PlatformUser, params: Omit<Parameters<typeof createAuditLog>[0], "actor">) {
    setAuditLogs((current) => [createAuditLog({ actor, ...params }), ...current]);
  }

  function updateOrderStatus(order: Order, to: OrderStatus, actor: PlatformUser, comment: string) {
    if (!canTransition(order.status, to)) {
      addAudit(actor, {
        action: "order.status_rejected",
        entityType: "order",
        entityId: order.id,
        bankId: order.bankId,
        orderId: order.id,
        comment: `Unerlaubter Wechsel von ${statusLabels[order.status]} zu ${statusLabels[to]}.`,
      });
      return;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: to,
              shipmentStatus: to === "handed_over" ? "in_transit" : to === "delivered" ? "delivered" : item.shipmentStatus,
              shipmentReference: to === "ready_to_ship" ? item.shipmentReference ?? "WERT-LOG-2026-0001" : item.shipmentReference,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );

    addAudit(actor, {
      action: "order.status_changed",
      entityType: "order",
      entityId: order.id,
      bankId: order.bankId,
      orderId: order.id,
      comment,
    });
  }

  function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAct(activeUser.role, "create_order") || !activeUser.bankId) {
      return;
    }

    const foreignAmount = Number(form.foreignAmount);
    const fxRate = form.currencyCode === "USD" ? 0.93 : form.currencyCode === "GBP" ? 1.18 : 1.05;
    const eurAmount = Math.round(foreignAmount * fxRate * 100) / 100;
    const nextNumber = orders.length + 1;
    const newOrder: Order = {
      id: `order-${crypto.randomUUID()}`,
      reference: `CX-2026-${String(nextNumber).padStart(4, "0")}`,
      bankId: activeUser.bankId,
      branchId: form.branchId,
      createdByUserId: activeUser.id,
      status: "submitted",
      currencyCode: form.currencyCode,
      foreignAmount,
      eurAmount,
      fxRate,
      marginPercent: 2.4,
      handlingFeeEur: 12,
      shippingFeeEur: form.deliveryOption === "express" ? 28 : 18,
      requestedDeliveryDate: form.requestedDeliveryDate,
      deliveryOption: form.deliveryOption,
      customerReferenceBank: form.customerReferenceBank,
      shipmentStatus: "not_started",
      complianceFlag: eurAmount > 10000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((current) => [newOrder, ...current]);
    setSelectedOrderId(newOrder.id);
    addAudit(activeUser, {
      action: "order.submitted",
      entityType: "order",
      entityId: newOrder.id,
      bankId: newOrder.bankId,
      orderId: newOrder.id,
      comment: "Bankbestellung digital eingereicht.",
    });
  }

  function handlePilotStep() {
    if (!selectedOrder) {
      return;
    }

    const nextStatus = nextPilotStatus[selectedOrder.status];
    if (!nextStatus) {
      return;
    }

    if (selectedOrder.status === "bank_approval_required" && !canAct(activeUser.role, "bank_approve")) {
      return;
    }

    if (selectedOrder.status !== "bank_approval_required" && !canAct(activeUser.role, "ops_update")) {
      return;
    }

    updateOrderStatus(selectedOrder, nextStatus, activeUser, `Pilotprozess: ${statusLabels[nextStatus]} gesetzt.`);
  }

  function handleBlockOrder() {
    if (!selectedOrder || !canAct(activeUser.role, "block")) {
      return;
    }

    updateOrderStatus(selectedOrder, "blocked", activeUser, "Compliance-Sperre gesetzt.");
  }

  function handleComplaint() {
    if (!selectedOrder) {
      return;
    }

    const complaint: Complaint = {
      id: `complaint-${crypto.randomUUID()}`,
      orderId: selectedOrder.id,
      type: "difference",
      description: "Pilot-Reklamation wegen Differenz oder Rueckfrage.",
      status: "open",
      reportedByUserId: activeUser.id,
      reportedAt: new Date().toISOString(),
    };

    setComplaints((current) => [complaint, ...current]);
    updateOrderStatus(selectedOrder, "complained", activeUser, "Reklamation erfasst.");
  }

  function handleCsvExport() {
    if (!canAct(activeUser.role, "export_report")) {
      return;
    }

    const csv = toCsv(visibleOrders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cashex-orders.csv";
    link.click();
    URL.revokeObjectURL(url);

    addAudit(activeUser, {
      action: "report.exported",
      entityType: "report",
      entityId: "orders-csv",
      bankId: activeUser.bankId,
      comment: "CSV-Report exportiert.",
    });
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--cashex-blue)]">CashEx GmbH</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--cashex-charcoal)] sm:text-4xl">
              HomeDelivery Pilotbasis
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              B2B-Sortenhandel fuer Bankbestellungen. Keine Endkundenzahlung ueber CashEx, manuelle Kontrolle vor Automatisierung.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
            <label className="text-sm font-medium text-[var(--cashex-charcoal)]">
              Aktive Rolle
              <select
                value={activeUserId}
                onChange={(event) => setActiveUserId(event.target.value)}
                className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {roleLabels[user.role]} - {user.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-md border border-[var(--line)] bg-[var(--cashex-light-blue)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cashex-blue)]">Datenbank</p>
              <p className="mt-1 text-sm font-medium text-[var(--cashex-charcoal)]">
                {supabaseConfigured ? "Supabase konfiguriert" : "Lokale Seed-Daten aktiv"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-5 md:grid-cols-4">
        <Metric icon={<Banknote size={18} />} label="Pilotvolumen" value={`${totalVolume.toLocaleString("de-DE")} EUR`} />
        <Metric icon={<ClipboardCheck size={18} />} label="Offene Auftraege" value={String(openOrders.length)} />
        <Metric icon={<ShieldCheck size={18} />} label="Audit-Events" value={String(auditLogs.length)} />
        <Metric icon={<PackageCheck size={18} />} label="Planmarge" value={`${Math.round(totalMargin).toLocaleString("de-DE")} EUR`} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-8 xl:grid-cols-[390px_1fr]">
        <div className="space-y-5">
          <Panel title="Bankportal" subtitle="Bestellung anlegen und Status verfolgen">
            <form onSubmit={handleCreateOrder} className="space-y-3">
              <Field label="Filiale">
                <select
                  value={form.branchId}
                  onChange={(event) => setForm({ ...form, branchId: event.target.value })}
                  className="input"
                >
                  {branches
                    .filter((branch) => branch.bankId === activeUser.bankId)
                    .map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Waehrung">
                  <select
                    value={form.currencyCode}
                    onChange={(event) => setForm({ ...form, currencyCode: event.target.value })}
                    className="input"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Betrag">
                  <input
                    value={form.foreignAmount}
                    onChange={(event) => setForm({ ...form, foreignAmount: event.target.value })}
                    className="input"
                    inputMode="decimal"
                  />
                </Field>
              </div>
              <Field label="Bankreferenz">
                <input
                  value={form.customerReferenceBank}
                  onChange={(event) => setForm({ ...form, customerReferenceBank: event.target.value })}
                  className="input"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lieferdatum">
                  <input
                    type="date"
                    value={form.requestedDeliveryDate}
                    onChange={(event) => setForm({ ...form, requestedDeliveryDate: event.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Option">
                  <select
                    value={form.deliveryOption}
                    onChange={(event) => setForm({ ...form, deliveryOption: event.target.value as OrderFormState["deliveryOption"] })}
                    className="input"
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                  </select>
                </Field>
              </div>
              <button
                disabled={!canAct(activeUser.role, "create_order")}
                className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-45"
                type="submit"
              >
                Bestellung einreichen
              </button>
            </form>
          </Panel>

          <Panel title="Reports" subtitle="CSV-Export mit Audit-Log">
            <button
              onClick={handleCsvExport}
              disabled={!canAct(activeUser.role, "export_report")}
              className="button-secondary w-full disabled:cursor-not-allowed disabled:opacity-45"
              type="button"
            >
              <Download size={16} />
              CSV herunterladen
            </button>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Panel title="CashEx-Ops Orderboard" subtitle="Status, Kurs, Versand und Pilotprozess">
            <div className="overflow-hidden rounded-md border border-[var(--line)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  <tr>
                    <th className="px-3 py-3">Auftrag</th>
                    <th className="px-3 py-3">Bank</th>
                    <th className="px-3 py-3">Betrag</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => {
                    const bank = banks.find((item) => item.id === order.bankId);
                    const isSelected = order.id === selectedOrder?.id;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`cursor-pointer border-t border-[var(--line)] ${isSelected ? "bg-[var(--cashex-light-blue)]" : "bg-white hover:bg-slate-50"}`}
                      >
                        <td className="px-3 py-3 font-mono text-xs">{order.reference}</td>
                        <td className="px-3 py-3">{bank?.name}</td>
                        <td className="px-3 py-3">
                          {order.foreignAmount.toLocaleString("de-DE")} {order.currencyCode}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedOrder ? (
              <div className="mt-5 grid gap-4 rounded-md border border-[var(--line)] bg-white p-4 md:grid-cols-2">
                <Detail label="Bank" value={selectedBank?.name ?? "-"} />
                <Detail label="Filiale" value={selectedBranch?.name ?? "-"} />
                <Detail label="Bankreferenz" value={selectedOrder.customerReferenceBank} />
                <Detail label="Lieferdatum" value={selectedOrder.requestedDeliveryDate} />
                <Detail label="Kurs" value={selectedOrder.fxRate.toFixed(4)} />
                <Detail label="Gebuehren" value={`${selectedOrder.handlingFeeEur + selectedOrder.shippingFeeEur} EUR`} />
                <Detail label="Versandreferenz" value={selectedOrder.shipmentReference ?? "noch offen"} />
                <Detail label="Sendungsstatus" value={selectedOrder.shipmentStatus ?? "noch offen"} />
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handlePilotStep}
                disabled={!selectedOrder || (!canAct(activeUser.role, "ops_update") && !canAct(activeUser.role, "bank_approve"))}
                className="button-primary disabled:cursor-not-allowed disabled:opacity-45"
                type="button"
              >
                <Truck size={16} />
                Naechster Pilotschritt
              </button>
              <button
                onClick={handleComplaint}
                disabled={!selectedOrder || activeUser.role === "revision"}
                className="button-secondary disabled:cursor-not-allowed disabled:opacity-45"
                type="button"
              >
                <FileWarning size={16} />
                Reklamation
              </button>
              <button
                onClick={handleBlockOrder}
                disabled={!selectedOrder || !canAct(activeUser.role, "block")}
                className="button-danger disabled:cursor-not-allowed disabled:opacity-45"
                type="button"
              >
                <Lock size={16} />
                Sperren
              </button>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel title="Compliance & Audit" subtitle="kritische Aktionen nachvollziehen">
              <div className="space-y-3">
                {auditLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="rounded-md border border-[var(--line)] bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[var(--cashex-blue)]">{log.action}</span>
                      <span className="text-xs text-[var(--muted)]">{roleLabels[log.actorRole]}</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--cashex-charcoal)]">{log.comment}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Pilot-Haertung" subtitle="Abnahmepunkte fuer den echten Pilot">
              <ChecklistItem icon={<BadgeCheck size={16} />} text="1.000-USD-End-to-End-Test" done={orders.some((order) => order.reference === "CX-2026-0001" && order.status === "completed")} />
              <ChecklistItem icon={<ShieldCheck size={16} />} text="Bankdaten tenant-getrennt" done />
              <ChecklistItem icon={<ClipboardCheck size={16} />} text="Audit-Log aktiv" done={auditLogs.length > 0} />
              <ChecklistItem icon={<AlertTriangle size={16} />} text="Externer Security-/Rechtsreview offen" done={false} />
              <ChecklistItem icon={<FileWarning size={16} />} text="Reklamationen erfassbar" done={complaints.length > 0} />
            </Panel>
          </div>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--cashex-charcoal)]">{title}</h2>
        <p className="text-sm text-[var(--muted)]">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[var(--cashex-blue)]">{icon}</div>
      <p className="mt-3 text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--cashex-charcoal)]">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[var(--cashex-charcoal)]">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-medium text-[var(--cashex-charcoal)]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[status] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>
      {statusLabels[status]}
    </span>
  );
}

function ChecklistItem({ icon, text, done }: { icon: React.ReactNode; text: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 border-t border-[var(--line)] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className={done ? "text-green-700" : "text-amber-700"}>{icon}</span>
      <span className="text-sm text-[var(--cashex-charcoal)]">{text}</span>
      <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${done ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
        {done ? "OK" : "offen"}
      </span>
    </div>
  );
}
