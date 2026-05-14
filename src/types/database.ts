// =============================================================================
// DATABASE TYPES
// Auto-generated from Supabase schema.
// Regenerate with: npm run db:types
// Manual edits will be overwritten.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          plan: "starter" | "growth" | "portfolio";
          lemon_customer_id: string | null;
          lemon_subscription_id: string | null;
          lemon_subscription_status: string | null;
          timezone: string;
          notification_email: string | null;
          notification_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          plan?: "starter" | "growth" | "portfolio";
          lemon_customer_id?: string | null;
          lemon_subscription_id?: string | null;
          lemon_subscription_status?: string | null;
          timezone?: string;
          notification_email?: string | null;
          notification_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      properties: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          address: string;
          city: string | null;
          state: string | null;
          zip: string | null;
          unit_count: number;
          health_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          address: string;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          unit_count?: number;
          health_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      units: {
        Row: {
          id: string;
          property_id: string;
          org_id: string;
          unit_number: string;
          status: "occupied" | "vacant" | "notice";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          org_id: string;
          unit_number: string;
          status?: "occupied" | "vacant" | "notice";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["units"]["Insert"]>;
      };
      tenants: {
        Row: {
          id: string;
          org_id: string;
          unit_id: string | null;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          portal_user_id: string | null;
          trs_score: number;
          trs_last_updated: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          unit_id?: string | null;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          portal_user_id?: string | null;
          trs_score?: number;
          trs_last_updated?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
      };
      leases: {
        Row: {
          id: string;
          org_id: string;
          unit_id: string;
          tenant_id: string;
          rent_amount: number;
          rent_due_day: number;
          grace_period_days: number;
          late_fee_type: "flat" | "percentage";
          late_fee_amount: number;
          lease_start: string;
          lease_end: string;
          status: "active" | "expired" | "terminated";
          payment_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          unit_id: string;
          tenant_id: string;
          rent_amount: number;
          rent_due_day?: number;
          grace_period_days?: number;
          late_fee_type?: "flat" | "percentage";
          late_fee_amount?: number;
          lease_start: string;
          lease_end: string;
          status?: "active" | "expired" | "terminated";
          payment_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leases"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          org_id: string;
          lease_id: string;
          tenant_id: string;
          amount: number;
          due_date: string;
          paid_date: string | null;
          status: "pending" | "paid" | "partial" | "failed" | "waived";
          payment_method: "manual" | "cash" | "check" | "venmo" | "zelle" | "stripe" | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          lease_id: string;
          tenant_id: string;
          amount: number;
          due_date: string;
          paid_date?: string | null;
          status?: "pending" | "paid" | "partial" | "failed" | "waived";
          payment_method?: "manual" | "cash" | "check" | "venmo" | "zelle" | "stripe" | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      alerts: {
        Row: {
          id: string;
          org_id: string;
          property_id: string | null;
          unit_id: string | null;
          tenant_id: string | null;
          lease_id: string | null;
          payment_id: string | null;
          type:
            | "overdue_rent"
            | "failed_payment"
            | "lease_expiring"
            | "maintenance_request"
            | "quiet_tenant"
            | "contractor_delay";
          status: "active" | "resolved" | "dismissed" | "snoozed";
          urgency: number;
          title: string;
          body: string | null;
          recommended_action: string | null;
          escalation_level: number;
          resolved_at: string | null;
          resolved_by: string | null;
          resolution_note: string | null;
          snoozed_until: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          property_id?: string | null;
          unit_id?: string | null;
          tenant_id?: string | null;
          lease_id?: string | null;
          payment_id?: string | null;
          type: Database["public"]["Tables"]["alerts"]["Row"]["type"];
          status?: Database["public"]["Tables"]["alerts"]["Row"]["status"];
          urgency?: number;
          title: string;
          body?: string | null;
          recommended_action?: string | null;
          escalation_level?: number;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_note?: string | null;
          snoozed_until?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>;
      };
      maintenance_tickets: {
        Row: {
          id: string;
          org_id: string;
          property_id: string;
          unit_id: string;
          tenant_id: string | null;
          title: string;
          description: string | null;
          category:
            | "plumbing"
            | "electrical"
            | "hvac"
            | "appliance"
            | "structural"
            | "pest"
            | "other"
            | null;
          urgency: "emergency" | "urgent" | "standard" | "low";
          urgency_score: number;
          status:
            | "open"
            | "acknowledged"
            | "assigned"
            | "in_progress"
            | "resolved"
            | "closed";
          assigned_to: string | null;
          assigned_phone: string | null;
          scheduled_date: string | null;
          resolved_at: string | null;
          photos: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          property_id: string;
          unit_id: string;
          tenant_id?: string | null;
          title: string;
          description?: string | null;
          category?: Database["public"]["Tables"]["maintenance_tickets"]["Row"]["category"];
          urgency?: Database["public"]["Tables"]["maintenance_tickets"]["Row"]["urgency"];
          urgency_score?: number;
          status?: Database["public"]["Tables"]["maintenance_tickets"]["Row"]["status"];
          assigned_to?: string | null;
          assigned_phone?: string | null;
          scheduled_date?: string | null;
          resolved_at?: string | null;
          photos?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["maintenance_tickets"]["Insert"]>;
      };
      communications: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string | null;
          alert_id: string | null;
          ticket_id: string | null;
          channel: "email" | "sms";
          direction: "outbound" | "inbound";
          recipient: string;
          subject: string | null;
          body: string;
          status: "sent" | "delivered" | "failed" | "read";
          provider_message_id: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          tenant_id?: string | null;
          alert_id?: string | null;
          ticket_id?: string | null;
          channel: "email" | "sms";
          direction?: "outbound" | "inbound";
          recipient: string;
          subject?: string | null;
          body: string;
          status?: "sent" | "delivered" | "failed" | "read";
          provider_message_id?: string | null;
          sent_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["communications"]["Insert"]>;
      };
      activity_log: {
        Row: {
          id: number;
          org_id: string;
          entity_type:
            | "alert"
            | "payment"
            | "tenant"
            | "maintenance"
            | "lease"
            | "property"
            | "communication";
          entity_id: string;
          action: string;
          actor: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          org_id: string;
          entity_type: Database["public"]["Tables"]["activity_log"]["Row"]["entity_type"];
          entity_id: string;
          action: string;
          actor: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: never;
      };
      digest_log: {
        Row: {
          id: string;
          org_id: string;
          sent_at: string;
          actions_taken: number;
          pending_decisions: number;
          alerts_resolved: number;
          content: Json;
        };
        Insert: {
          id?: string;
          org_id: string;
          sent_at?: string;
          actions_taken?: number;
          pending_decisions?: number;
          alerts_resolved?: number;
          content?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["digest_log"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// Convenience row types
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Unit = Database["public"]["Tables"]["units"]["Row"];
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type Lease = Database["public"]["Tables"]["leases"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Alert = Database["public"]["Tables"]["alerts"]["Row"];
export type MaintenanceTicket = Database["public"]["Tables"]["maintenance_tickets"]["Row"];
export type Communication = Database["public"]["Tables"]["communications"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"];

// Insert types
export type InsertAlert = Database["public"]["Tables"]["alerts"]["Insert"];
export type InsertPayment = Database["public"]["Tables"]["payments"]["Insert"];
export type InsertCommunication = Database["public"]["Tables"]["communications"]["Insert"];
export type InsertActivityLog = Database["public"]["Tables"]["activity_log"]["Insert"];
export type InsertMaintenanceTicket = Database["public"]["Tables"]["maintenance_tickets"]["Insert"];
