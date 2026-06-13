-- CashEx HomeDelivery Platform - initial Supabase/PostgreSQL schema
-- Erstellt als Schema-Startpunkt, weil die Supabase-CLI lokal noch nicht installiert ist.

create extension if not exists pgcrypto;

create table public.banks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text not null,
  legal_form text,
  country text not null default 'DE',
  register_number text,
  lei_or_bic text,
  bafin_or_institute_status text,
  beneficial_owner_note text,
  contract_status text not null,
  kyb_status text not null default 'open',
  billing_address text,
  compliance_contact text,
  operations_contact text,
  escalation_contact text,
  global_order_limit_eur numeric(14, 2) not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.banks(id),
  branch_name text not null,
  branch_number text not null,
  address text,
  contact_email text,
  contact_phone text,
  order_limit_eur numeric(14, 2) not null default 0,
  allowed_currencies text[] not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  bank_id uuid references public.banks(id),
  branch_id uuid references public.branches(id),
  full_name text not null,
  role text not null check (role in ('bank_admin', 'bank_user', 'bank_approver', 'cashex_ops', 'cashex_compliance', 'cashex_management', 'revision')),
  status text not null default 'active',
  mfa_enabled boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.currencies (
  code text primary key,
  name text not null,
  active boolean not null default true
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_form text,
  register_number text,
  country text not null default 'DE',
  contact_name text,
  escalation_contact text,
  kyb_status text not null default 'open',
  insurance_reference text,
  contract_status text not null default 'draft',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.logistics_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_form text,
  register_number text,
  contact_name text,
  escalation_contact text,
  insurance_reference text,
  tracking_capability boolean not null default false,
  kyb_status text not null default 'open',
  contract_status text not null default 'draft',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique,
  bank_id uuid not null references public.banks(id),
  branch_id uuid not null references public.branches(id),
  created_by_user_id uuid references public.profiles(id),
  approved_by_user_id uuid references public.profiles(id),
  current_status text not null default 'draft',
  requested_delivery_date date not null,
  delivery_option text not null default 'standard',
  is_express boolean not null default false,
  supplier_id uuid references public.suppliers(id),
  customer_reference_bank text not null,
  notes text,
  compliance_flag boolean not null default false,
  risk_level text not null default 'niedrig' check (risk_level in ('niedrig', 'mittel', 'hoch', 'kritisch')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_amounts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  currency_code text not null references public.currencies(code),
  foreign_amount numeric(14, 2) not null,
  eur_amount numeric(14, 2) not null,
  fx_rate numeric(14, 6) not null,
  rate_valid_until timestamptz,
  rate_source text not null default 'manual',
  margin_percent numeric(6, 3) not null default 0,
  created_at timestamptz not null default now()
);

create table public.order_fees (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  handling_fee_eur numeric(14, 2) not null default 0,
  shipping_fee_eur numeric(14, 2) not null default 0,
  express_fee_eur numeric(14, 2) not null default 0,
  service_fee_eur numeric(14, 2) not null default 0,
  total_fee_eur numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  logistics_provider text,
  logistics_partner_id uuid references public.logistics_partners(id),
  shipment_reference text,
  insured_value_eur numeric(14, 2),
  package_type text,
  seal_number text,
  counted_amount_confirmed boolean not null default false,
  difference_amount_eur numeric(14, 2),
  second_check_user_id uuid references public.profiles(id),
  handed_over_at timestamptz,
  delivered_at timestamptz,
  shipment_status text not null default 'not_started',
  proof_of_delivery_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  old_status text,
  new_status text not null,
  changed_by_user_id uuid references public.profiles(id),
  changed_at timestamptz not null default now(),
  reason text,
  comment text
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  actor_role text not null,
  bank_id uuid references public.banks(id),
  order_id uuid references public.orders(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_hash_optional text,
  after_hash_optional text,
  ip_address_optional inet,
  user_agent_optional text,
  created_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  complaint_type text not null,
  reported_by_user_id uuid references public.profiles(id),
  reported_at timestamptz not null default now(),
  description text not null,
  current_status text not null default 'open',
  resolution text,
  resolved_at timestamptz
);

create table public.partner_screenings (
  id uuid primary key default gen_random_uuid(),
  partner_type text not null check (partner_type in ('bank', 'supplier', 'logistics')),
  partner_id uuid not null,
  screening_type text not null check (screening_type in ('sanction', 'pep', 'negative_list')),
  result text not null check (result in ('no_hit', 'hit', 'to_clarify')),
  checked_by_user_id uuid references public.profiles(id),
  checked_at timestamptz not null default now(),
  source_note text,
  decision_note text,
  next_review_date date
);

create table public.order_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('bank', 'branch', 'currency')),
  scope_id text not null,
  limit_type text not null check (limit_type in ('single_order', 'monthly_cumulative')),
  threshold_eur numeric(14, 2) not null,
  required_action text not null check (required_action in ('standard', 'plausibility', 'bank_approval', 'compliance_approval', 'monthly_review')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_aggregates (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.banks(id),
  branch_id uuid references public.branches(id),
  currency_code text references public.currencies(code),
  period text not null,
  order_count integer not null default 0,
  total_eur numeric(14, 2) not null default 0,
  threshold_reference numeric(14, 2),
  flagged boolean not null default false,
  last_calculated_at timestamptz not null default now()
);

create table public.suspicion_cases (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  bank_id uuid not null references public.banks(id),
  branch_id uuid references public.branches(id),
  trigger text not null,
  detected_by text not null check (detected_by in ('system', 'user')),
  detected_by_user_id uuid references public.profiles(id),
  detected_at timestamptz not null default now(),
  reviewed_documents text,
  decision text check (decision in ('approved', 'rejected', 'escalated', 'report_prepared')),
  decided_by_user_id uuid references public.profiles(id),
  decided_at timestamptz,
  report_reference text,
  no_customer_warning_confirmed boolean not null default false
);

alter table public.banks enable row level security;
alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.currencies enable row level security;
alter table public.orders enable row level security;
alter table public.order_amounts enable row level security;
alter table public.order_fees enable row level security;
alter table public.shipments enable row level security;
alter table public.order_status_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.complaints enable row level security;
alter table public.suppliers enable row level security;
alter table public.logistics_partners enable row level security;
alter table public.partner_screenings enable row level security;
alter table public.order_limits enable row level security;
alter table public.order_aggregates enable row level security;
alter table public.suspicion_cases enable row level security;

-- RLS-Grundidee:
-- Bankrollen sehen nur Daten ihrer Bank. CashEx-Rollen und Revision sehen alle Pilotdaten.
-- Rollen werden in public.profiles gehalten, nicht in user_metadata.

create policy "profiles own profile or cashex read"
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('cashex_ops', 'cashex_compliance', 'cashex_management', 'revision')
  )
);

create policy "orders tenant read"
on public.orders for select
to authenticated
using (
  bank_id = (select p.bank_id from public.profiles p where p.id = (select auth.uid()))
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('cashex_ops', 'cashex_compliance', 'cashex_management', 'revision')
  )
);

create policy "audit read compliance management revision"
on public.audit_logs for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('cashex_compliance', 'cashex_management', 'revision')
  )
);

-- Compliance-/Partnerdaten: nur CashEx-Rollen und Revision lesen, keine Bankrollen.
-- partner_screenings und suspicion_cases sind besonders sensibel (kein Tipping-off).

create policy "suppliers cashex read"
on public.suppliers for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('cashex_ops', 'cashex_compliance', 'cashex_management', 'revision')
  )
);

create policy "logistics_partners cashex read"
on public.logistics_partners for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('cashex_ops', 'cashex_compliance', 'cashex_management', 'revision')
  )
);

create policy "order_limits cashex read"
on public.order_limits for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('cashex_ops', 'cashex_compliance', 'cashex_management', 'revision')
  )
);

create policy "order_aggregates compliance read"
on public.order_aggregates for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('cashex_compliance', 'cashex_management', 'revision')
  )
);

create policy "partner_screenings compliance read"
on public.partner_screenings for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('cashex_compliance', 'cashex_management', 'revision')
  )
);

create policy "suspicion_cases compliance read"
on public.suspicion_cases for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('cashex_compliance', 'cashex_management', 'revision')
  )
);
