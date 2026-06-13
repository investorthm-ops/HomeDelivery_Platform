export const orderStatuses = [
  "draft",
  "submitted",
  "under_review",
  "bank_approval_required",
  "bank_approved",
  "cashex_approved",
  "procurement",
  "goods_received",
  "checked",
  "reserved",
  "packed",
  "ready_to_ship",
  "handed_over",
  "delivered",
  "completed",
  "cancelled",
  "complained",
  "blocked",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type Role =
  | "bank_admin"
  | "bank_user"
  | "bank_approver"
  | "cashex_ops"
  | "cashex_compliance"
  | "cashex_management"
  | "revision";

export type Bank = {
  id: string;
  name: string;
  legalName: string;
  contractStatus: "pilot_ready" | "draft" | "blocked";
  globalLimitEur: number;
  // KYB-Felder (optional im In-Memory-Modell, in supabase/schema.sql vorhanden)
  registerNumber?: string;
  leiOrBic?: string;
  bafinOrInstituteStatus?: string;
  beneficialOwnerNote?: string;
  escalationContact?: string;
};

export type Branch = {
  id: string;
  bankId: string;
  name: string;
  branchNumber: string;
  city: string;
  orderLimitEur: number;
};

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  bankId?: string;
  branchId?: string;
};

export type Currency = {
  code: string;
  name: string;
  active: boolean;
};

export type Order = {
  id: string;
  reference: string;
  bankId: string;
  branchId: string;
  createdByUserId: string;
  approvedByUserId?: string;
  status: OrderStatus;
  currencyCode: string;
  foreignAmount: number;
  eurAmount: number;
  fxRate: number;
  marginPercent: number;
  handlingFeeEur: number;
  shippingFeeEur: number;
  requestedDeliveryDate: string;
  deliveryOption: "standard" | "express";
  isExpress?: boolean;
  supplierId?: string;
  customerReferenceBank: string;
  shipmentReference?: string;
  shipmentStatus?: "not_started" | "prepared" | "in_transit" | "delivered";
  complaintStatus?: "open" | "in_review" | "resolved";
  complianceFlag: boolean;
  riskLevel?: RiskLevel;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  id: string;
  actorUserId: string;
  actorRole: Role;
  bankId?: string;
  orderId?: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  comment?: string;
};

export type Complaint = {
  id: string;
  orderId: string;
  type: "difference" | "wrong_delivery" | "not_delivered" | "damaged" | "counterfeit_suspicion" | "data_case" | "other";
  description: string;
  status: "open" | "in_review" | "resolved";
  reportedByUserId: string;
  reportedAt: string;
};

// Compliance-/GwG-Entitaeten (MVP-Scope, Luecken #1-#5 aus der Konzept-Lueckenanalyse).
// Bewusst leichtgewichtig: keine externe API, Screening/Aggregation als erfasste Eintraege.

export type RiskLevel = "niedrig" | "mittel" | "hoch" | "kritisch";

export type Supplier = {
  id: string;
  name: string;
  legalForm?: string;
  registerNumber?: string;
  country: string;
  contactName?: string;
  escalationContact?: string;
  kybStatus: "open" | "in_review" | "cleared" | "blocked";
  insuranceReference?: string;
  contractStatus: "draft" | "active" | "terminated";
  status: "active" | "paused" | "blocked";
};

export type LogisticsPartner = {
  id: string;
  name: string;
  legalForm?: string;
  registerNumber?: string;
  contactName?: string;
  escalationContact?: string;
  insuranceReference?: string;
  trackingCapability: boolean;
  kybStatus: "open" | "in_review" | "cleared" | "blocked";
  contractStatus: "draft" | "active" | "terminated";
  status: "active" | "paused" | "blocked";
};

export type PartnerScreening = {
  id: string;
  partnerType: "bank" | "supplier" | "logistics";
  partnerId: string;
  screeningType: "sanction" | "pep" | "negative_list";
  result: "no_hit" | "hit" | "to_clarify";
  checkedByUserId: string;
  checkedAt: string;
  sourceNote?: string;
  decisionNote?: string;
  nextReviewDate?: string;
};

export type OrderLimit = {
  id: string;
  scope: "bank" | "branch" | "currency";
  scopeId: string;
  limitType: "single_order" | "monthly_cumulative";
  thresholdEur: number;
  requiredAction: "standard" | "plausibility" | "bank_approval" | "compliance_approval" | "monthly_review";
  active: boolean;
};

export type OrderAggregate = {
  id: string;
  bankId: string;
  branchId?: string;
  currencyCode?: string;
  period: string;
  orderCount: number;
  totalEur: number;
  thresholdReference?: number;
  flagged: boolean;
  lastCalculatedAt: string;
};

export type SuspicionCase = {
  id: string;
  orderId?: string;
  bankId: string;
  branchId?: string;
  trigger: string;
  detectedBy: "system" | "user";
  detectedByUserId?: string;
  detectedAt: string;
  reviewedDocuments?: string;
  decision?: "approved" | "rejected" | "escalated" | "report_prepared";
  decidedByUserId?: string;
  decidedAt?: string;
  reportReference?: string;
  noCustomerWarningConfirmed: boolean;
};

export const statusLabels: Record<OrderStatus, string> = {
  draft: "Entwurf",
  submitted: "Eingereicht",
  under_review: "In Pruefung",
  bank_approval_required: "Bankfreigabe erforderlich",
  bank_approved: "Bankfreigegeben",
  cashex_approved: "CashEx-freigegeben",
  procurement: "Beschaffung",
  goods_received: "Wareneingang",
  checked: "Geprueft",
  reserved: "Reserviert",
  packed: "Kommissioniert",
  ready_to_ship: "Versandbereit",
  handed_over: "Uebergeben",
  delivered: "Zugestellt",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
  complained: "Reklamiert",
  blocked: "Gesperrt",
};

export const roleLabels: Record<Role, string> = {
  bank_admin: "Bank-Admin",
  bank_user: "Bank-User",
  bank_approver: "Bank-Freigeber",
  cashex_ops: "CashEx-Ops",
  cashex_compliance: "Compliance",
  cashex_management: "Management",
  revision: "Revision",
};

export const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["under_review", "bank_approval_required", "blocked", "cancelled"],
  under_review: ["cashex_approved", "bank_approval_required", "blocked", "cancelled"],
  bank_approval_required: ["bank_approved", "blocked", "cancelled"],
  bank_approved: ["cashex_approved", "blocked", "cancelled"],
  cashex_approved: ["procurement", "blocked", "cancelled"],
  procurement: ["goods_received", "blocked", "cancelled"],
  goods_received: ["checked", "complained", "blocked"],
  checked: ["reserved", "complained", "blocked"],
  reserved: ["packed", "blocked"],
  packed: ["ready_to_ship", "blocked"],
  ready_to_ship: ["handed_over", "blocked"],
  handed_over: ["delivered", "complained"],
  delivered: ["completed", "complained"],
  completed: ["complained"],
  cancelled: [],
  complained: ["blocked", "completed"],
  blocked: ["under_review", "cancelled"],
};

export const nextPilotStatus: Record<OrderStatus, OrderStatus | null> = {
  draft: "submitted",
  submitted: "under_review",
  under_review: "cashex_approved",
  bank_approval_required: "bank_approved",
  bank_approved: "cashex_approved",
  cashex_approved: "procurement",
  procurement: "goods_received",
  goods_received: "checked",
  checked: "reserved",
  reserved: "packed",
  packed: "ready_to_ship",
  ready_to_ship: "handed_over",
  handed_over: "delivered",
  delivered: "completed",
  completed: null,
  cancelled: null,
  complained: "completed",
  blocked: "under_review",
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return allowedTransitions[from].includes(to);
}

export function canAct(role: Role, action: "create_order" | "bank_approve" | "ops_update" | "block" | "read_audit" | "export_report") {
  const rights: Record<typeof action, Role[]> = {
    create_order: ["bank_user"],
    bank_approve: ["bank_approver"],
    ops_update: ["cashex_ops"],
    block: ["cashex_compliance"],
    read_audit: ["cashex_compliance", "revision", "cashex_management"],
    export_report: ["bank_admin", "bank_user", "bank_approver", "cashex_management", "cashex_compliance"],
  };

  return rights[action].includes(role);
}

export function isOrderVisibleForUser(order: Order, user: PlatformUser) {
  if (user.role.startsWith("cashex") || user.role === "revision") {
    return true;
  }

  if (!user.bankId || order.bankId !== user.bankId) {
    return false;
  }

  if (user.role === "bank_user" && user.branchId) {
    return order.branchId === user.branchId;
  }

  return true;
}

export function createAuditLog(params: {
  actor: PlatformUser;
  action: string;
  entityType: string;
  entityId: string;
  bankId?: string;
  orderId?: string;
  comment?: string;
}): AuditLog {
  return {
    id: `audit-${crypto.randomUUID()}`,
    actorUserId: params.actor.id,
    actorRole: params.actor.role,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    bankId: params.bankId,
    orderId: params.orderId,
    comment: params.comment,
    createdAt: new Date().toISOString(),
  };
}

export function toCsv(orders: Order[]) {
  const header = [
    "order_reference",
    "status",
    "currency",
    "foreign_amount",
    "eur_amount",
    "fx_rate",
    "fees_eur",
    "shipment_reference",
    "requested_delivery_date",
  ];

  const rows = orders.map((order) => [
    order.reference,
    statusLabels[order.status],
    order.currencyCode,
    order.foreignAmount.toFixed(2),
    order.eurAmount.toFixed(2),
    order.fxRate.toFixed(4),
    (order.handlingFeeEur + order.shippingFeeEur).toFixed(2),
    order.shipmentReference ?? "",
    order.requestedDeliveryDate,
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

// Compliance-Regeln (siehe docs/03_data_model.md und Konzept-Datenmodell Kap. 9).

// Partner darf nur freigegeben werden, wenn die juengste relevante Pruefung 'no_hit' ergab.
export function isPartnerReleasable(
  partnerType: PartnerScreening["partnerType"],
  partnerId: string,
  screenings: PartnerScreening[],
): boolean {
  const relevant = screenings
    .filter((s) => s.partnerType === partnerType && s.partnerId === partnerId)
    .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));

  return relevant.length > 0 && relevant[0].result === "no_hit";
}

// Ein offener Verdachtsfall (ohne Entscheidung oder eskaliert) blockiert Kommissionierung/Versand.
export function isOrderBlockedBySuspicion(orderId: string, cases: SuspicionCase[]): boolean {
  return cases.some(
    (c) => c.orderId === orderId && (c.decision === undefined || c.decision === "escalated"),
  );
}
