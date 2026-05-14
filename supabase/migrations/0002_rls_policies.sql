-- ============================================================================
-- NORVA — Row Level Security Policies
-- Every table is locked down to org-level access.
-- ============================================================================

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table payments enable row level security;
alter table alerts enable row level security;
alter table maintenance_tickets enable row level security;
alter table communications enable row level security;
alter table activity_log enable row level security;
alter table digest_log enable row level security;

-- ============================================================================
-- HELPER FUNCTION
-- Returns the org_id for the currently authenticated user.
-- Used in RLS policies to avoid subquery repetition.
-- ============================================================================

create or replace function get_user_org_id()
returns uuid
language sql
stable
security definer
as $$
  select id from organizations where owner_id = auth.uid() limit 1;
$$;

-- ============================================================================
-- ORGANIZATIONS
-- Only the owner can access their organization.
-- ============================================================================

create policy "org_owner_select"
  on organizations for select
  using (owner_id = auth.uid());

create policy "org_owner_update"
  on organizations for update
  using (owner_id = auth.uid());

-- Organizations are created via server-side code (service role), not client.
-- No insert/delete policy needed for client.

-- ============================================================================
-- PROPERTIES
-- ============================================================================

create policy "properties_org_select"
  on properties for select
  using (org_id = get_user_org_id());

create policy "properties_org_insert"
  on properties for insert
  with check (org_id = get_user_org_id());

create policy "properties_org_update"
  on properties for update
  using (org_id = get_user_org_id());

create policy "properties_org_delete"
  on properties for delete
  using (org_id = get_user_org_id());

-- ============================================================================
-- UNITS
-- ============================================================================

create policy "units_org_select"
  on units for select
  using (org_id = get_user_org_id());

create policy "units_org_insert"
  on units for insert
  with check (org_id = get_user_org_id());

create policy "units_org_update"
  on units for update
  using (org_id = get_user_org_id());

create policy "units_org_delete"
  on units for delete
  using (org_id = get_user_org_id());

-- ============================================================================
-- TENANTS
-- ============================================================================

create policy "tenants_org_select"
  on tenants for select
  using (org_id = get_user_org_id());

create policy "tenants_org_insert"
  on tenants for insert
  with check (org_id = get_user_org_id());

create policy "tenants_org_update"
  on tenants for update
  using (org_id = get_user_org_id());

create policy "tenants_org_delete"
  on tenants for delete
  using (org_id = get_user_org_id());

-- ============================================================================
-- LEASES
-- ============================================================================

create policy "leases_org_select"
  on leases for select
  using (org_id = get_user_org_id());

create policy "leases_org_insert"
  on leases for insert
  with check (org_id = get_user_org_id());

create policy "leases_org_update"
  on leases for update
  using (org_id = get_user_org_id());

create policy "leases_org_delete"
  on leases for delete
  using (org_id = get_user_org_id());

-- ============================================================================
-- PAYMENTS
-- ============================================================================

create policy "payments_org_select"
  on payments for select
  using (org_id = get_user_org_id());

create policy "payments_org_insert"
  on payments for insert
  with check (org_id = get_user_org_id());

create policy "payments_org_update"
  on payments for update
  using (org_id = get_user_org_id());

-- ============================================================================
-- ALERTS
-- ============================================================================

create policy "alerts_org_select"
  on alerts for select
  using (org_id = get_user_org_id());

create policy "alerts_org_update"
  on alerts for update
  using (org_id = get_user_org_id());

-- Alerts are inserted by server-side functions (service role), not client.

-- ============================================================================
-- MAINTENANCE TICKETS
-- ============================================================================

create policy "tickets_org_select"
  on maintenance_tickets for select
  using (org_id = get_user_org_id());

create policy "tickets_org_insert"
  on maintenance_tickets for insert
  with check (org_id = get_user_org_id());

create policy "tickets_org_update"
  on maintenance_tickets for update
  using (org_id = get_user_org_id());

-- ============================================================================
-- COMMUNICATIONS
-- ============================================================================

create policy "comms_org_select"
  on communications for select
  using (org_id = get_user_org_id());

-- ============================================================================
-- ACTIVITY LOG
-- Read-only from client — writes are server-side only.
-- ============================================================================

create policy "activity_org_select"
  on activity_log for select
  using (org_id = get_user_org_id());

-- ============================================================================
-- DIGEST LOG
-- ============================================================================

create policy "digest_org_select"
  on digest_log for select
  using (org_id = get_user_org_id());

-- ============================================================================
-- TENANT PORTAL POLICIES
-- Tenants can only see their own data via portal_user_id.
-- These are additive — a landlord's auth.uid() won't match portal_user_id
-- unless they explicitly set it up.
-- ============================================================================

create policy "tenant_portal_self_select"
  on tenants for select
  using (portal_user_id = auth.uid());

create policy "tenant_portal_tickets_select"
  on maintenance_tickets for select
  using (
    tenant_id in (
      select id from tenants where portal_user_id = auth.uid()
    )
  );

create policy "tenant_portal_tickets_insert"
  on maintenance_tickets for insert
  with check (
    tenant_id in (
      select id from tenants where portal_user_id = auth.uid()
    )
  );
