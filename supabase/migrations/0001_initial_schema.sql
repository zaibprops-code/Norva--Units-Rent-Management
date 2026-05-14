-- ============================================================================
-- NORVA — Initial Schema Migration
-- Run: supabase db push
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type plan_type as enum ('starter', 'growth', 'portfolio');
create type unit_status as enum ('occupied', 'vacant', 'notice');
create type lease_status as enum ('active', 'expired', 'terminated');
create type payment_status as enum ('pending', 'paid', 'partial', 'failed', 'waived');
create type alert_type as enum (
  'overdue_rent',
  'failed_payment',
  'maintenance_request',
  'maintenance_emergency',
  'lease_expiring',
  'quiet_tenant',
  'contractor_delay'
);
create type alert_status as enum ('active', 'resolved', 'dismissed', 'snoozed');
create type ticket_urgency as enum ('emergency', 'urgent', 'standard', 'low');
create type ticket_status as enum ('open', 'acknowledged', 'in_progress', 'resolved', 'closed');
create type comm_channel as enum ('email', 'sms');
create type comm_direction as enum ('outbound', 'inbound');

-- ============================================================================
-- ORGANIZATIONS
-- One org per landlord account. Multi-user support comes later.
-- ============================================================================

create table organizations (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  owner_id              uuid references auth.users(id) on delete cascade not null,
  plan                  plan_type not null default 'starter',
  unit_count            int not null default 0,            -- cached, updated by trigger
  lemon_customer_id     text unique,
  lemon_subscription_id text unique,
  subscription_status   text,                              -- active | paused | cancelled
  notification_email    text,                              -- override for alert emails
  timezone              text not null default 'America/New_York',
  onboarding_complete   boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================================
-- PROPERTIES
-- A property is a building or address. It contains one or more units.
-- ============================================================================

create table properties (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid references organizations(id) on delete cascade not null,
  name         text not null,                              -- "Cascade Lofts"
  address      text not null,
  city         text,
  state        text,
  zip          text,
  health_score int not null default 100
    check (health_score >= 0 and health_score <= 100),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================================
-- UNITS
-- A rentable unit within a property.
-- ============================================================================

create table units (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references organizations(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  unit_number text not null,                               -- "CL-05", "1A", "Unit 3"
  status      unit_status not null default 'vacant',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(property_id, unit_number)
);

-- ============================================================================
-- TENANTS
-- A person who rents a unit.
-- ============================================================================

create table tenants (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid references organizations(id) on delete cascade not null,
  unit_id          uuid references units(id) on delete set null,
  first_name       text not null,
  last_name        text not null,
  email            text,
  phone            text,
  portal_user_id   uuid references auth.users(id) on delete set null,
  trs_score        int not null default 75
    check (trs_score >= 0 and trs_score <= 100),
  trs_updated_at   timestamptz,
  last_contacted   timestamptz,                            -- last inbound or outbound comm
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================================
-- LEASES
-- The contract between a tenant and a unit.
-- ============================================================================

create table leases (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid references organizations(id) on delete cascade not null,
  unit_id            uuid references units(id) on delete cascade not null,
  tenant_id          uuid references tenants(id) on delete cascade not null,
  rent_amount        numeric(10,2) not null check (rent_amount > 0),
  rent_due_day       int not null default 1
    check (rent_due_day >= 1 and rent_due_day <= 28),     -- max 28 for all months
  grace_period_days  int not null default 3,
  late_fee_flat      numeric(10,2) not null default 0,
  lease_start        date not null,
  lease_end          date not null,
  status             lease_status not null default 'active',
  payment_link       text,                                 -- Venmo/Zelle link for tenant reminders
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (lease_end > lease_start)
);

-- ============================================================================
-- PAYMENTS
-- A rent payment record. One record per expected payment period.
-- ============================================================================

create table payments (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid references organizations(id) on delete cascade not null,
  lease_id                uuid references leases(id) on delete cascade not null,
  tenant_id               uuid references tenants(id) on delete cascade not null,
  amount_due              numeric(10,2) not null,
  amount_paid             numeric(10,2) not null default 0,
  due_date                date not null,
  paid_date               date,
  status                  payment_status not null default 'pending',
  late_fee_applied        numeric(10,2) not null default 0,
  payment_method          text,                            -- manual | stripe | cash | check | venmo | zelle
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique(lease_id, due_date)                               -- one payment record per period
);

-- ============================================================================
-- ALERTS
-- The operations feed. Everything Norva detects lives here.
-- ============================================================================

create table alerts (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid references organizations(id) on delete cascade not null,
  property_id        uuid references properties(id) on delete cascade,
  unit_id            uuid references units(id) on delete cascade,
  tenant_id          uuid references tenants(id) on delete set null,
  type               alert_type not null,
  status             alert_status not null default 'active',
  urgency            int not null default 50
    check (urgency >= 0 and urgency <= 100),
  title              text not null,
  body               text,                                 -- human-readable detail
  ai_summary         text,                                 -- AI-generated insight (nullable)
  recommended_action text,
  escalation_level   int not null default 0,              -- 0=monitoring, 1=notified, 2=formal, 3=escalated
  metadata           jsonb not null default '{}',          -- flexible extra data per alert type
  resolved_at        timestamptz,
  resolved_by        uuid references auth.users(id) on delete set null,
  resolution_note    text,
  snoozed_until      timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================================
-- MAINTENANCE TICKETS
-- Maintenance requests. Landlord-entered or tenant-submitted.
-- ============================================================================

create table maintenance_tickets (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid references organizations(id) on delete cascade not null,
  property_id    uuid references properties(id) on delete cascade not null,
  unit_id        uuid references units(id) on delete cascade not null,
  tenant_id      uuid references tenants(id) on delete set null,
  title          text not null,
  description    text,
  category       text,                                     -- plumbing | electrical | hvac | appliance | structural | other
  urgency        ticket_urgency not null default 'standard',
  urgency_score  int not null default 40
    check (urgency_score >= 0 and urgency_score <= 100),
  status         ticket_status not null default 'open',
  assigned_to    text,                                     -- contractor name (freeform at MVP)
  assigned_phone text,
  scheduled_at   timestamptz,
  resolved_at    timestamptz,
  photos         text[] not null default '{}',             -- Supabase Storage paths
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================================
-- COMMUNICATIONS
-- Every email/SMS sent or received, logged for the timeline.
-- ============================================================================

create table communications (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references organizations(id) on delete cascade not null,
  tenant_id   uuid references tenants(id) on delete set null,
  alert_id    uuid references alerts(id) on delete set null,
  ticket_id   uuid references maintenance_tickets(id) on delete set null,
  channel     comm_channel not null,
  direction   comm_direction not null default 'outbound',
  recipient   text not null,                               -- email address or phone number
  subject     text,                                        -- email only
  body        text not null,
  status      text not null default 'sent',               -- sent | delivered | failed | read
  provider_id text,                                        -- Resend message ID or Twilio SID
  sent_at     timestamptz not null default now()
);

-- ============================================================================
-- ACTIVITY LOG
-- Append-only operational history. Never update, only insert.
-- ============================================================================

create table activity_log (
  id          bigserial primary key,
  org_id      uuid references organizations(id) on delete cascade not null,
  entity_type text not null,                               -- alert | payment | tenant | maintenance | lease
  entity_id   uuid not null,
  action      text not null,                               -- created | resolved | escalated | sent | received | etc.
  actor       text not null,                               -- 'norva' | user uuid as text
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- DIGEST LOG
-- Record of daily digests sent. Prevents duplicates.
-- ============================================================================

create table digest_log (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid references organizations(id) on delete cascade not null,
  digest_date      date not null,                          -- the date this digest covers
  sent_at          timestamptz not null default now(),
  actions_taken    int not null default 0,
  pending_count    int not null default 0,
  email_id         text,                                   -- Resend message ID
  unique(org_id, digest_date)
);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at on row changes.
-- ============================================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at();

create trigger trg_properties_updated_at
  before update on properties
  for each row execute function update_updated_at();

create trigger trg_units_updated_at
  before update on units
  for each row execute function update_updated_at();

create trigger trg_tenants_updated_at
  before update on tenants
  for each row execute function update_updated_at();

create trigger trg_leases_updated_at
  before update on leases
  for each row execute function update_updated_at();

create trigger trg_payments_updated_at
  before update on payments
  for each row execute function update_updated_at();

create trigger trg_alerts_updated_at
  before update on alerts
  for each row execute function update_updated_at();

create trigger trg_maintenance_updated_at
  before update on maintenance_tickets
  for each row execute function update_updated_at();
