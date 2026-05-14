-- ============================================================================
-- NORVA — Performance Indexes
-- ============================================================================

-- Organizations
create index idx_organizations_owner_id on organizations(owner_id);

-- Properties
create index idx_properties_org_id on properties(org_id);

-- Units
create index idx_units_org_id on units(org_id);
create index idx_units_property_id on units(property_id);
create index idx_units_status on units(org_id, status);

-- Tenants
create index idx_tenants_org_id on tenants(org_id);
create index idx_tenants_unit_id on tenants(unit_id);
create index idx_tenants_trs on tenants(org_id, trs_score);

-- Leases
create index idx_leases_org_id on leases(org_id);
create index idx_leases_unit_id on leases(unit_id);
create index idx_leases_tenant_id on leases(tenant_id);
-- Hot path: find active leases expiring soon
create index idx_leases_expiry on leases(org_id, lease_end)
  where status = 'active';

-- Payments
create index idx_payments_org_id on payments(org_id);
create index idx_payments_lease_due on payments(lease_id, due_date);
-- Hot path: find overdue payments (the core cron query)
create index idx_payments_overdue on payments(org_id, status, due_date)
  where status = 'pending';

-- Alerts
-- Hot path: operations feed query — active alerts ordered by urgency
create index idx_alerts_feed on alerts(org_id, urgency desc, created_at desc)
  where status = 'active';
create index idx_alerts_org_status on alerts(org_id, status);
create index idx_alerts_type on alerts(org_id, type);
create index idx_alerts_tenant on alerts(tenant_id);

-- Maintenance tickets
create index idx_tickets_org_status on maintenance_tickets(org_id, status);
create index idx_tickets_property on maintenance_tickets(property_id);
create index idx_tickets_urgency on maintenance_tickets(org_id, urgency_score desc)
  where status in ('open', 'acknowledged', 'in_progress');

-- Communications
create index idx_comms_org_id on communications(org_id);
create index idx_comms_tenant on communications(tenant_id, sent_at desc);
create index idx_comms_alert on communications(alert_id);

-- Activity log
create index idx_activity_org_id on activity_log(org_id);
create index idx_activity_entity on activity_log(entity_type, entity_id, created_at desc);
create index idx_activity_org_recent on activity_log(org_id, created_at desc);

-- Digest log
create index idx_digest_org_date on digest_log(org_id, digest_date desc);
