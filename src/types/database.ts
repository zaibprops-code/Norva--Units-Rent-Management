// =============================================================================
// DATABASE TYPES
// Manually maintained until "npm run db:types" can be run against a live
// Supabase project. Once migrations are applied and Supabase is connected:
//
//   npm run db:types
//
// will overwrite this file with the real generated output.
//
// IMPORTANT: Every table MUST include a `Relationships` key (even if empty)
// to satisfy @supabase/supabase-js v2's GenericTable constraint. Without it,
// `.from("tableName")` infers as `never` during TypeScript compilation.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Supabase SDK constraint types (mirrors internal SDK expectations)
// ---------------------------------------------------------------------------
export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      // -----------------------------------------------------------------------
      // -----------------------------------------------------------------------
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
        Relationships: [];
      };
      // -----------------------------------------------------------------------
      // properties
      // -----------------------------------------------------------------------
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
        Relationships: [
          {
            foreignKeyName: "properties_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      // -----------------------------------------------------------------------
      // units
      // -----------------------------------------------------------------------
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
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "units_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      // -----------------------------------------------------------------------
      // tenants
      // -----------------------------------------------------------------------
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
        Relationships: [
          {
            foreignKeyName: "tenants_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenants_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          }
        ];
      };
      // -----------------------------------------------------------------------
      // leases
      // -----------------------------------------------------------------------
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
        Relationships: [
          {
            foreignKeyName: "leases_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leases_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leases_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      // -----------------------------------------------------------------------
      // payments
      // -----------------------------------------------------------------------
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
          payment_method:
            | "manual"
            | "cash"
            | "check"
            | "venmo"
            | "zelle"
            | "stripe"
            | null;
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
          payment_method?:
            | "manual"
            | "cash"
            | "check"
            | "venmo"
            | "zelle"
            | "stripe"
            | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "payments_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_lease_id_fkey";
            columns: ["lease_id"];
            isOneToOne: false;
            referencedRelation: "leases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          }
        ];
      };
      // -----------------------------------------------------------------------
      // alerts
      // -----------------------------------------------------------------------
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
          type:
            | "overdue_rent"
            | "failed_payment"
            | "lease_expiring"
            | "maintenance_request"
            | "quiet_tenant"
            | "contractor_delay";
          status?: "active" | "resolved" | "dismissed" | "snoozed";
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
        Relationships: [
          {
            foreignKeyName: "alerts_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      // -----------------------------------------------------------------------
      // maintenance_tickets
      // -----------------------------------------------------------------------
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
          category?:
            | "plumbing"
            | "electrical"
            | "hvac"
            | "appliance"
            | "structural"
            | "pest"
            | "other"
            | null;
          urgency?: "emergency" | "urgent" | "standard" | "low";
          urgency_score?: number;
          status?:
            | "open"
            | "acknowledged"
            | "assigned"
            | "in_progress"
            | "resolved"
            | "closed";
          assigned_to?: string | null;
          assigned_phone?: string | null;
          scheduled_date?: string | null;
          resolved_at?: string | null;
          photos?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["maintenance_tickets"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "maintenance_tickets_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "maintenance_tickets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      // -----------------------------------------------------------------------
      // communications
      // -----------------------------------------------------------------------
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
        Update: Partial<
          Database["public"]["Tables"]["communications"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "communications_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      // -----------------------------------------------------------------------
      // activity_log
      // -----------------------------------------------------------------------
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
          metadata?: Json;
          created_at?: string;
        };
        Update: never; // activity_log is append-only
        Relationships: [
          {
            foreignKeyName: "activity_log_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      // -----------------------------------------------------------------------
      // digest_log
      // -----------------------------------------------------------------------
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
        Relationships: [
          {
            foreignKeyName: "digest_log_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// =============================================================================
// CONVENIENCE ROW TYPES
// Named aliases for the most commonly used Row types.
// =============================================================================
export type Organization =
  Database["public"]["Tables"]["organizations"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Unit = Database["public"]["Tables"]["units"]["Row"];
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type Lease = Database["public"]["Tables"]["leases"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Alert = Database["public"]["Tables"]["alerts"]["Row"];
export type MaintenanceTicket =
  Database["public"]["Tables"]["maintenance_tickets"]["Row"];
export type Communication =
  Database["public"]["Tables"]["communications"]["Row"];
export type ActivityLog =
  Database["public"]["Tables"]["activity_log"]["Row"];

// =============================================================================
// CONVENIENCE INSERT TYPES
// =============================================================================
export type InsertAlert =
  Database["public"]["Tables"]["alerts"]["Insert"];
export type InsertPayment =
  Database["public"]["Tables"]["payments"]["Insert"];
export type InsertCommunication =
  Database["public"]["Tables"]["communications"]["Insert"];
export type InsertActivityLog =
  Database["public"]["Tables"]["activity_log"]["Insert"];
export type InsertMaintenanceTicket =
  Database["public"]["Tables"]["maintenance_tickets"]["Insert"];
export type InsertLease =
  Database["public"]["Tables"]["leases"]["Insert"];
export type InsertTenant =
  Database["public"]["Tables"]["tenants"]["Insert"];
