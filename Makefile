.PHONY: up down build logs test lint format health db-shell redis-shell clean

# Docker Compose
up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

restart:
	docker compose restart

# Testing
test:
	docker compose exec backend python -m pytest backend/tests/ -v --tb=short

test-e2e:
	cd test-integration && docker compose -f docker-compose.test.yml up -d && pytest tests/ -v --tb=short; docker compose -f docker-compose.test.yml down

test-ai:
	docker compose exec backend python -m pytest backend/tests/test_ai.py -v --tb=short

# Linting & Formatting
lint:
	cd frontend && npm run lint 2>/dev/null; cd ../backend && pip install flake8 && flake8 app/ 2>/dev/null || true

format:
	cd frontend && npx prettier --write "app/**/*.{ts,tsx}" "components/**/*.{ts,tsx}" 2>/dev/null || true
	cd backend && pip install black && black app/ 2>/dev/null || true

typecheck:
	cd frontend && npx tsc --noEmit

# Database
db-shell:
	docker compose exec postgres psql -U postgres -d trading_platform

redis-shell:
	docker compose exec redis redis-cli

migrate:
	docker compose exec postgres psql -U postgres -d trading_platform -f /docker-entrypoint-initdb.d/001_initial.sql

seed:
	docker compose exec postgres psql -U postgres -d trading_platform -f /seeds/seed_data.sql

# Health
health:
	@echo "Checking service health..."
	@curl -sf http://localhost:8000/health && echo " Backend OK" || echo " Backend DOWN"
	@curl -sf http://localhost:3000 && echo " Frontend OK" || echo " Frontend DOWN"

# Cleanup
clean:
	docker compose down -v
	docker system prune -f

# Development
dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev
