-- CashEx HomeDelivery Platform - initial Supabase/PostgreSQL schema
-- Erstellt als Schema-Startpunkt, weil die Supabase-CLI lokal noch nicht installiert ist.

create extension if not exists pgcrypto;

create table public.banks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text not null,
  legal_form text,
  country text not null default 'DE',
  contract_status text not null,
  kyb_status text not null default 'open',
  billing_address text,
  compliance_contact text,
  operations_contact text,
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
  customer_reference_bank text not null,
  notes text,
  compliance_flag boolean not null default false,
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
  shipment_reference text,
  insured_value_eur numeric(14, 2),
  package_type text,
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
