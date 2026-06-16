.PHONY: install setup dev backend frontend test seed

PYTHON := $(shell pwd)/backend/.venv/bin/python
PNPM   := pnpm

# ── One-time setup ────────────────────────────────────────────────────────────
install:
	cd backend && pip install -r requirements.txt -r requirements-dev.txt
	cd frontend && $(PNPM) install

setup: install
	@cp -n backend/.env.example backend/.env 2>/dev/null || true
	@cp -n frontend/.env.example frontend/.env.local 2>/dev/null || true
	cd backend && $(PYTHON) manage.py migrate
	cd backend && $(PYTHON) manage.py createsuperuser --noinput 2>/dev/null || true
	cd backend && $(PYTHON) manage.py seed_demo_data
	@echo ""
	@echo "✓ Setup complete. Run: make dev"
	@echo "  Login at http://localhost:5173 → admin / password"

# ── Dev servers ───────────────────────────────────────────────────────────────
backend:
	cd backend && $(PYTHON) manage.py runserver 8000

frontend:
	cd frontend && $(PNPM) dev

dev:
	@echo "Starting backend on :8000 and frontend on :5173 ..."
	@echo "Login: http://localhost:5173 → admin / password"
	@trap 'kill 0' EXIT; \
	  (cd backend && $(PYTHON) manage.py runserver 8000) & \
	  (cd frontend && $(PNPM) dev) & \
	  wait

# ── Database ──────────────────────────────────────────────────────────────────
migrate:
	cd backend && $(PYTHON) manage.py migrate

seed:
	cd backend && $(PYTHON) manage.py seed_demo_data --force

# ── Tests ─────────────────────────────────────────────────────────────────────
test:
	cd backend && $(PYTHON) -m pytest tests/ -v

test-api-local:
	@TOKEN=$$(curl -s -X POST http://localhost:8000/api/v1/auth/token/ \
	  -H "Content-Type: application/json" \
	  -d '{"username":"admin","password":"password"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access'])"); \
	echo "Token OK: $${TOKEN:0:20}..."

reset:
	rm -f backend/db.sqlite3
	cd backend && $(PYTHON) manage.py migrate
	cd backend && $(PYTHON) manage.py createsuperuser --noinput 2>/dev/null || true
	cd backend && $(PYTHON) manage.py seed_demo_data
