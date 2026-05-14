# Norva — Autonomous Rental Portfolio Operations

> Monitor properties, automate rent follow-up, and coordinate maintenance — all in one place.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend & API | Next.js 14 (App Router) on Vercel |
| Database & Auth | Supabase (Postgres + Auth + Realtime) |
| Email | Resend |
| Billing | Lemon Squeezy |
| AI | Anthropic Claude (sparse — daily digest only at MVP) |

Monthly infrastructure cost at launch: **~$1/month**

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/your-org/norva.git
cd norva
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in all values — see comments in .env.example
```

### 3. Start Supabase locally

```bash
npx supabase start
```

### 4. Apply migrations

```bash
npx supabase db push
# Or run SQL files in supabase/migrations/ in order via Supabase Studio
```

### 5. Run dev server

```bash
npm run dev
# → http://localhost:3000
```

### 6. Type check and lint

```bash
npm run type-check
npm run lint
```

---

## Project Structure

```
src/
├── actions/           # Next.js Server Actions (alerts, payments)
├── app/
│   ├── (auth)/        # Login, signup pages
│   ├── (dashboard)/   # All authenticated pages + API routes
│   └── api/           # Webhooks, cron endpoints
├── components/
│   ├── auth/          # LoginForm, SignupForm
│   ├── dashboard/     # AlertCard, OperationsFeed, PortfolioStats …
│   ├── layout/        # DashboardShell, Sidebar, TopBar
│   ├── maintenance/   # AddMaintenanceForm
│   ├── properties/    # AddPropertyForm
│   ├── settings/      # NotificationSettingsForm
│   ├── tenants/       # AddTenantForm
│   └── ui/            # Badge, Button, Avatar, Card, Modal, Table …
├── constants/         # App-wide constants (urgency thresholds, routes)
├── lib/
│   ├── hooks/         # useAlerts, useProperties, useUnits …
│   ├── services/      # Server-side data access layer
│   ├── supabase/      # client, server, admin, middleware clients
│   ├── utils/         # cn, dates, urgency, formatting, auth, env …
│   └── validations/   # Zod schemas for all forms
├── middleware.ts       # Auth session refresh + route protection
├── styles/            # globals.css
└── types/             # Database types + app domain types
supabase/
├── config.toml
└── migrations/        # 0001 schema · 0002 RLS · 0003 indexes · 0004 trigger
```

---

## Cron Jobs

Configured in `vercel.json` — requires **Vercel Pro** plan:

| Endpoint | Time (UTC) | Purpose |
|----------|-----------|---------|
| `/api/cron/lease-scanner` | 6:00 AM | Flag leases expiring within 90 days |
| `/api/cron/daily-digest` | 6:30 AM | Send morning digest email to all orgs |
| `/api/cron/rent-check` | 7:00 AM | Detect overdue rent, create/escalate alerts |

All cron routes require `Authorization: Bearer $APP_SECRET`.

---

## Deploying to Vercel

1. Push repo to GitHub
2. Connect to Vercel — import the repo
3. Add all environment variables from `.env.example`
4. Deploy — first deploy runs the build check
5. Run database migrations (see below)

---

## Database Setup (Production)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and keys into Vercel environment variables
3. Open the **SQL Editor** in Supabase Studio and run migrations in order:
   - `0001_initial_schema.sql`
   - `0002_rls_policies.sql`
   - `0003_indexes.sql`
   - `0004_org_trigger.sql`
4. Enable **Realtime** on the `alerts` table in Supabase Dashboard → Database → Replication

---

## Monthly Cost Estimate

| Customers | Infrastructure cost | MRR | Profit |
|-----------|-------------------|-----|--------|
| 0 | ~$1/month | $0 | −$1 |
| 10 | ~$46/month | $490 | ~$444 |
| 50 | ~$120/month | $2,450 | ~$2,330 |
| 100 | ~$200/month | $4,900 | ~$4,700 |

---

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier
npm run db:types     # Regenerate Supabase types → src/types/database.ts
npm run db:push      # Push migrations to local Supabase
```

---

## Support

Questions? Email [support@norva.io](mailto:support@norva.io)
