<p align="center">
  <img src="frontend/public/favicon.svg" width="96" alt="FleetPulse logo" />
</p>

<h1 align="center">FleetPulse</h1>
<p align="center"><em>Fleet spend intelligence. Catches overcharges, idles, and duplicate invoices before they hit your books.</em></p>

---

## What it does

FleetPulse ingests fleet invoices (CSV, Excel, JSON), runs 5 anomaly detectors against each one, and gives operations teams a command-center dashboard to approve, flag, or dispute charges in seconds. Every KPI and chart updates the moment invoices are imported or deleted.

## Features

- **Multi-format invoice import** — CSV, `.xlsx`, `.xls`, JSON via drag-and-drop; auto-creates vehicles from VIN on import
- **5 anomaly detectors** — Rate card variance, duplicate line items, statistical outlier (2σ), frequency anomaly, new vendor
- **Bulk delete** — checkbox-select invoices, delete selected or delete all; dashboard KPIs and fleet health update immediately
- **Soft-delete + audit trail** — `is_deleted`, `approved_by`, `approved_at` on every invoice
- **Supplier scorecards** — ranked by flagged-invoice ratio with horizontal score chart
- **Analytics** — monthly spend trend, flagged invoice trend, fleet health donut, supplier score bars
- **Live demo mode** — `/demo`, `/demo/invoices`, `/demo/vehicles`, `/demo/suppliers` fully calculated from a realistic 100-vehicle dataset; no auth required
- **Multi-tenant isolation** — every query scoped to the user's organisation; VIN unique per org
- **Clerk / Google OAuth** — drop-in social login; falls back to SimpleJWT for local dev
- **Dark command-center UI** — amber-gold on near-black, JetBrains Mono data values, Space Grotesk headings
- **Light/dark toggle** — two dark variants (charcoal "light", near-black "dark")

## Tech stack

| Layer | Libraries |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind v4, shadcn, TanStack Query 5, Recharts 3, React Router 7 |
| Backend | Django 5, DRF, SimpleJWT, Celery (eager mode locally), Postgres (prod) / SQLite (dev) |
| Auth | Clerk JWKS JWT verification + SimpleJWT fallback |
| Fonts | Space Grotesk (display), Inter (body), JetBrains Mono (data) |
| Deploy | Vercel (frontend) + Render (backend) |

## Running locally

### Prerequisites

- Python 3.11+
- Node.js 20+ and pnpm 9+
- (Optional) Clerk account for social login

### Quick start

```bash
git clone https://github.com/AyushCoder9/FleetPulse.git
cd FleetPulse

# Copy and edit backend env
cp backend/.env.example backend/.env
# Edit backend/.env — set DJANGO_SECRET_KEY at minimum

# Copy and edit frontend env (optional for Clerk)
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local — add VITE_CLERK_PUBLISHABLE_KEY if using Clerk

# Start everything (migrates, seeds demo data, starts both servers)
./dev-up.sh
```

Open **http://localhost:5173** — log in with `admin` / `password` (demo account seeded automatically).

To stop:

```bash
./dev-down.sh
```

### Manual steps

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate --settings=config.settings.dev
python manage.py seed_demo_data --settings=config.settings.dev
python manage.py runserver --settings=config.settings.dev

# Frontend (new terminal)
cd frontend
pnpm install
pnpm dev
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DJANGO_SECRET_KEY` | Yes | Django secret key (any long random string) |
| `DATABASE_URL` | No | Postgres URL. Defaults to SQLite in dev |
| `REDIS_URL` | No | Redis URL for Celery. Omit to use eager (no Redis) |
| `CLERK_JWKS_URL` | No | Clerk JWKS endpoint. Enables Clerk JWT verification |
| `CLERK_ISSUER` | No | Clerk issuer value (from Clerk dashboard) |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated allowed origins for CORS |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend URL. Defaults to `http://localhost:8000` |
| `VITE_CLERK_PUBLISHABLE_KEY` | No | Clerk publishable key. Enables social login UI |

## Architecture

```
FleetPulse/
├── frontend/                  # React 19 + Vite 8
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # Public marketing page
│   │   │   ├── LoginPage.tsx          # SimpleJWT or Clerk login
│   │   │   ├── DashboardPage.tsx      # Command center (live data)
│   │   │   ├── InvoicesPage.tsx       # Bulk select / delete / import / detail sheet
│   │   │   ├── VehiclesPage.tsx       # Fleet roster
│   │   │   ├── SuppliersPage.tsx      # Supplier scorecards + chart
│   │   │   ├── DemoPage.tsx           # /demo — dashboard with dummy data
│   │   │   ├── DemoInvoicesPage.tsx   # /demo/invoices — read-only invoice table
│   │   │   ├── DemoVehiclesPage.tsx   # /demo/vehicles — fleet KPIs + table
│   │   │   └── DemoSuppliersPage.tsx  # /demo/suppliers — score chart + table
│   │   ├── components/
│   │   │   ├── AppLayout.tsx          # Authenticated top nav
│   │   │   ├── DemoLayout.tsx         # Shared header + nav for all /demo/* routes
│   │   │   └── Logo.tsx               # SVG FP + ECG logo
│   │   └── lib/
│   │       ├── api.ts                 # Typed API client (bulk-delete, delete-all, import)
│   │       ├── demo-data.ts           # Central dummy dataset for all demo pages
│   │       └── theme.tsx              # Light/dark context
│   └── public/favicon.svg
│
└── backend/                   # Django 5 + DRF
    └── apps/
        ├── invoices/
        │   ├── models.py              # Invoice + InvoiceLineItem (soft-delete, audit)
        │   ├── views.py               # CRUD, approve, flag, bulk-delete, delete-all, import
        │   ├── services.py            # InvoiceReconciliationService
        │   └── importers/             # Strategy pattern: CSV / Excel / JSON
        ├── anomalies/
        │   └── detectors.py           # 5 detectors + DetectorRegistry
        ├── analytics/
        │   └── views.py               # spend-trend, fleet-health (active-invoice filter)
        ├── dashboard/
        │   └── views.py               # Aggregated summary KPIs
        ├── organizations/             # Multi-tenant, is_demo flag
        ├── vehicles/                  # Auto-created on import; VIN unique per org
        └── suppliers/                 # Scorecard endpoint
```

### Invoice import flow

```
File upload (CSV / Excel / JSON)
  → get_importer(ext)              registry.py
  → importer.parse(file)           → list[dict]
  → InvoiceImportProcessor         get_or_create vehicle by VIN, create Invoice + LineItems
  → reconcile_invoice.delay()      Celery task (eager in dev)
  → DetectorRegistry.run_all()     5 detectors
  → AnomalyFlag created            medium/high severity → status='flagged'
```

### Bulk delete flow

```
Select invoices (checkboxes) or "Delete all"
  → POST /api/v1/invoices/bulk-delete/   {"ids": [...]}
  → POST /api/v1/invoices/delete-all/
  → Invoice.is_deleted = True            (soft delete, scoped to org)
  → TanStack Query invalidates           invoices + dashboard + monthly-stats + suppliers + fleet-health
  → All KPIs and charts re-fetch → zero  if no invoices remain
```

## Deployment

### Vercel (frontend)

```bash
vercel --prod
```

Set `VITE_API_URL` to your Render backend URL in Vercel project settings.

### Render (backend)

Uses `render.yaml` at repo root. Set `DJANGO_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, and optionally Clerk vars in Render environment.

Live instances:
- Frontend: https://fleet-pulse-fawn.vercel.app
- Backend: https://fleetpulse-api-k1zf.onrender.com

## Running tests

```bash
cd backend
source .venv/bin/activate
pytest
```

31 tests covering auth, invoice CRUD, bulk operations, anomaly detectors, vehicle scoping, and supplier scorecards.

## License

MIT
