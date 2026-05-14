// =============================================================================
// ZOD VALIDATION SCHEMAS
// Single source of truth for all form/API input validation.
// =============================================================================
import { z } from "zod";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------
export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required").max(100),
  address: z.string().min(1, "Address is required").max(200),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(2).nullable().optional(),
  zip: z.string().max(10).nullable().optional(),
  unit_count: z.coerce.number().int().min(1).max(1000).default(1),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------
export const unitSchema = z.object({
  unit_number: z.string().min(1, "Unit number is required").max(20),
  status: z.enum(["occupied", "vacant", "notice"]).default("vacant"),
  property_id: z.string().uuid("Invalid property"),
});

export type UnitFormData = z.infer<typeof unitSchema>;

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------
export const tenantSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z
    .string()
    .email("Invalid email")
    .nullable()
    .optional()
    .or(z.literal("")),
  phone: z.string().max(20).nullable().optional().or(z.literal("")),
  unit_id: z.string().uuid().nullable().optional().or(z.literal("")),
});

export type TenantFormData = z.infer<typeof tenantSchema>;

// ---------------------------------------------------------------------------
// Leases
// ---------------------------------------------------------------------------
export const leaseSchema = z
  .object({
    tenant_id: z.string().uuid("Invalid tenant"),
    unit_id: z.string().uuid("Invalid unit"),
    rent_amount: z.coerce
      .number()
      .positive("Rent must be a positive number"),
    rent_due_day: z.coerce.number().int().min(1).max(28).default(1),
    grace_period_days: z.coerce
      .number()
      .int()
      .min(0)
      .max(30)
      .default(3),
    late_fee_type: z.enum(["flat", "percentage"]).default("flat"),
    late_fee_amount: z.coerce.number().min(0).default(0),
    lease_start: z.string().min(1, "Start date required"),
    lease_end: z.string().min(1, "End date required"),
    payment_link: z
      .string()
      .url("Invalid URL")
      .nullable()
      .optional()
      .or(z.literal("")),
  })
  .refine((d) => new Date(d.lease_end) > new Date(d.lease_start), {
    message: "Lease end must be after lease start",
    path: ["lease_end"],
  });

export type LeaseFormData = z.infer<typeof leaseSchema>;

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export const markPaymentPaidSchema = z.object({
  payment_id: z.string().uuid(),
  paid_date: z.string().min(1, "Paid date required"),
  payment_method: z
    .enum(["manual", "cash", "check", "venmo", "zelle", "stripe"])
    .default("manual"),
  notes: z.string().max(500).nullable().optional(),
});

export type MarkPaymentPaidData = z.infer<typeof markPaymentPaidSchema>;

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------
export const maintenanceTicketSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).nullable().optional(),
  property_id: z.string().uuid("Property is required"),
  unit_id: z.string().uuid("Unit is required"),
  tenant_id: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .or(z.literal("")),
  category: z
    .enum([
      "plumbing",
      "electrical",
      "hvac",
      "appliance",
      "structural",
      "pest",
      "other",
    ])
    .nullable()
    .optional(),
  urgency: z
    .enum(["emergency", "urgent", "standard", "low"])
    .default("standard"),
  assigned_to: z.string().max(100).nullable().optional(),
  assigned_phone: z.string().max(20).nullable().optional(),
  scheduled_date: z.string().nullable().optional(),
});

export type MaintenanceTicketFormData = z.infer<typeof maintenanceTicketSchema>;

// ---------------------------------------------------------------------------
// Alert resolution
// ---------------------------------------------------------------------------
export const resolveAlertSchema = z.object({
  resolution_note: z
    .string()
    .max(500)
    .optional()
    .default("Resolved by landlord"),
});

// ---------------------------------------------------------------------------
// Notification settings
// ---------------------------------------------------------------------------
export const notificationSettingsSchema = z.object({
  notification_email: z
    .string()
    .email("Invalid email")
    .nullable()
    .optional()
    .or(z.literal("")),
  notification_phone: z
    .string()
    .max(20)
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type NotificationSettingsData = z.infer<
  typeof notificationSettingsSchema
>;
