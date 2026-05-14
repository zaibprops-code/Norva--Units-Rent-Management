// ============================================================================
// NORVA — Supabase Database Types
// This file mirrors the database schema exactly.
// Regenerate with: npm run db:types
// ============================================================================

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
          unit_count: number;
          lemon_customer_id: string | null;
          lemon_subscription_id: string | null;
          subscription_status: string | null;
          notification_email: string | null;
          timezone: string;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          plan?: "starter" | "growth" | "portfolio";
          unit_count?: number;
          lemon_customer_id?: string | null;
          lemon_subscription_id?: string | null;
          subscription_status?: string | null;
          notification_email?: string | null;
          timezone?: string;
          onboarding_complete?: boolean;
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
          health_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      units: {
        Row: {
          id: string;
          org_id: string;
          property_id: string;
          unit_number: string;
          status: "occupied" | "vacant" | "notice";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          property_id: string;
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
          trs_updated_at: string | null;
          last_contacted: string | null;
          notes: string | null;
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
          trs_updated_at?: string | null;
          last_contacted?: string | null;
          notes?: string | null;
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
          late_fee_flat: number;
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
          late_fee_flat?: number;
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
          amount_due: number;
          amount_paid: number;
          due_date: string;
          paid_date: string | null;
          status: "pending" | "paid" | "partial" | "failed" | "waived";
          late_fee_applied: number;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          lease_id: string;
          tenant_id: string;
          amount_due: number;
          amount_paid?: number;
          due_date: string;
          paid_date?: string | null;
          status?: "pending" | "paid" | "partial" | "failed" | "waived";
          late_fee_applied?: number;
          payment_method?: string | null;
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
          type:
            | "overdue_rent"
            | "failed_payment"
            | "maintenance_request"
            | "maintenance_emergency"
            | "lease_expiring"
            | "quiet_tenant"
            | "contractor_delay";
          status: "active" | "resolved" | "dismissed" | "snoozed";
          urgency: number;
          title: string;
          body: string | null;
          ai_summary: string | null;
          recommended_action: string | null;
          escalation_level: number;
          metadata: Json;
          resolved_at: string | null;
          resolved_by: string | null;
          resolution_note: string | null;
          snoozed_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          property_id?: string | null;
          unit_id?: string | null;
          tenant_id?: string | null;
          type: Database["public"]["Tables"]["alerts"]["Row"]["type"];
          status?: "active" | "resolved" | "dismissed" | "snoozed";
          urgency?: number;
          title: string;
          body?: string | null;
          ai_summary?: string | null;
          recommended_action?: string | null;
          escalation_level?: number;
          metadata?: Json;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_note?: string | null;
          snoozed_until?: string | null;
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
          category: string | null;
          urgency: "emergency" | "urgent" | "standard" | "low";
          urgency_score: number;
          status:
            | "open"
            | "acknowledged"
            | "in_progress"
            | "resolved"
            | "closed";
          assigned_to: string | null;
          assigned_phone: string | null;
          scheduled_at: string | null;
          resolved_at: string | null;
          photos: string[];
          notes: string | null;
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
          category?: string | null;
          urgency?: "emergency" | "urgent" | "standard" | "low";
          urgency_score?: number;
          status?:
            | "open"
            | "acknowledged"
            | "in_progress"
            | "resolved"
            | "closed";
          assigned_to?: string | null;
          assigned_phone?: string | null;
          scheduled_at?: string | null;
          resolved_at?: string | null;
          photos?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["maintenance_tickets"]["Insert"]
        >;
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
          status: string;
          provider_id: string | null;
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
          status?: string;
          provider_id?: string | null;
          sent_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["communications"]["Insert"]
        >;
      };
      activity_log: {
        Row: {
          id: number;
          org_id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          actor: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          org_id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          actor: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: never; // Activity log is append-only
      };
      digest_log: {
        Row: {
          id: string;
          org_id: string;
          digest_date: string;
          sent_at: string;
          actions_taken: number;
          pending_count: number;
          email_id: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          digest_date: string;
          sent_at?: string;
          actions_taken?: number;
          pending_count?: number;
          email_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["digest_log"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_org_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      plan_type: "starter" | "growth" | "portfolio";
      unit_status: "occupied" | "vacant" | "notice";
      lease_status: "active" | "expired" | "terminated";
      payment_status: "pending" | "paid" | "partial" | "failed" | "waived";
      alert_type:
        | "overdue_rent"
        | "failed_payment"
        | "maintenance_request"
        | "maintenance_emergency"
        | "lease_expiring"
        | "quiet_tenant"
        | "contractor_delay";
      alert_status: "active" | "resolved" | "dismissed" | "snoozed";
      ticket_urgency: "emergency" | "urgent" | "standard" | "low";
      ticket_status:
        | "open"
        | "acknowledged"
        | "in_progress"
        | "resolved"
        | "closed";
      comm_channel: "email" | "sms";
      comm_direction: "outbound" | "inbound";
    };
  };
};

// ============================================================================
// CONVENIENCE TYPE ALIASES
// Use these throughout the app instead of the verbose Database["public"]... path
// ============================================================================

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Row type shortcuts
export type Organization = Tables<"organizations">;
export type Property = Tables<"properties">;
export type Unit = Tables<"units">;
export type Tenant = Tables<"tenants">;
export type Lease = Tables<"leases">;
export type Payment = Tables<"payments">;
export type Alert = Tables<"alerts">;
export type MaintenanceTicket = Tables<"maintenance_tickets">;
export type Communication = Tables<"communications">;
export type ActivityLog = Tables<"activity_log">;
