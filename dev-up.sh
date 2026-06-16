#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID_FILE="/tmp/fleetpulse-backend.pid"
FRONTEND_PID_FILE="/tmp/fleetpulse-frontend.pid"

# ── Colour helpers ──────────────────────────────────────────────────────────
green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$*"; }
red() { printf '\033[0;31m%s\033[0m\n' "$*"; }

# ── Check .env files ─────────────────────────────────────────────────────────
if [[ ! -f "$REPO_ROOT/backend/.env" ]]; then
  yellow "backend/.env not found — copying from .env.example"
  cp "$REPO_ROOT/backend/.env.example" "$REPO_ROOT/backend/.env" 2>/dev/null || {
    red "ERROR: backend/.env.example missing. Create backend/.env manually."
    exit 1
  }
fi

if [[ ! -f "$REPO_ROOT/frontend/.env.local" ]]; then
  yellow "frontend/.env.local not found — copying from .env.example"
  cp "$REPO_ROOT/frontend/.env.example" "$REPO_ROOT/frontend/.env.local" 2>/dev/null || {
    yellow "frontend/.env.local not found and no example — frontend will run without Clerk auth."
  }
fi

# ── Backend ──────────────────────────────────────────────────────────────────
green "Starting backend..."
VENV="$REPO_ROOT/backend/.venv"

if [[ ! -d "$VENV" ]]; then
  yellow "No venv found — creating $VENV"
  python3 -m venv "$VENV"
  source "$VENV/bin/activate"
  pip install -q -r "$REPO_ROOT/backend/requirements.txt"
else
  source "$VENV/bin/activate"
  yellow "Venv exists — skipping pip install (run: pip install -r backend/requirements.txt manually if deps changed)"
fi

cd "$REPO_ROOT/backend"
python manage.py migrate --settings=config.settings.dev --run-syncdb 2>/dev/null || \
  python manage.py migrate --settings=config.settings.dev

# Seed demo data if no organizations exist
python - <<'EOF'
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()
from apps.organizations.models import Organization
if not Organization.objects.exists():
    from django.core.management import call_command
    call_command('seed_demo_data')
    print('Demo data seeded.')
else:
    print('Data already exists — skipping seed.')
EOF

python manage.py runserver 0.0.0.0:8000 --settings=config.settings.dev &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$BACKEND_PID_FILE"
green "Backend PID $BACKEND_PID → http://localhost:8000"

# ── Frontend ─────────────────────────────────────────────────────────────────
green "Starting frontend..."
cd "$REPO_ROOT/frontend"

if ! command -v pnpm &>/dev/null; then
  red "pnpm not found. Install: npm i -g pnpm"
  kill "$BACKEND_PID" 2>/dev/null || true
  exit 1
fi

pnpm install --frozen-lockfile 2>/dev/null || pnpm install
pnpm dev &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "$FRONTEND_PID_FILE"
green "Frontend PID $FRONTEND_PID → http://localhost:5173"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
green "FleetPulse dev stack running."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  Admin:    http://localhost:8000/admin/  (admin / password)"
echo ""
echo "Stop everything with: ./dev-down.sh"
