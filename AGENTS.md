# AI Trading Intelligence Platform — Agent Guide

## Quick start
```bash
make up                          # docker compose up -d --build
make down                        # stop all services
make logs                        # tail logs for all services
make health                      # check all service endpoints
cp .env.example .env             # fill in secrets before starting
```

## Architecture
- **API Gateway** (`backend/gateway-service/`, port 3000, Express.js CommonJS) — single entrypoint for all HTTP/WS traffic
- **WebSocket Service** (`backend/websocket-service/`, port 3001, Socket.IO + Redis pub/sub)
- **Backend Node.js** — `gateway-service`, `auth-service` (4100), `user-service` (4200), `websocket-service` (3001)
- **Backend Python (Flask)** — `market-data-service` (5000), `notification-service` (5001), `analytics-service` (5002), `admin-service` (5003)
- **AI Engines (Python FastAPI)** — 12 services under `services/` (ports 4001-4013), each independent
- **Dexter Bot Engine** (`services/dexter-engine/`, port 4021) — trading bot with gap-SR strategy, support/resistance detection, adaptive risk management, market data provider (mock/yahoo), paper trading
- **Signal Fusion Engine** (`services/signal-fusion-engine/`, port 4013) — core brain fusing all AI outputs
- **Frontend** (`frontend/`) — Next.js 14 App Router, TypeScript strict, TailwindCSS trading theme, Zustand, SWR
- **Databases** — PostgreSQL/TimescaleDB (5432), Redis (6379), ChromaDB (8000)
- **Infra** — Docker Compose, NGINX reverse proxy (80/443), K8s in `kubernetes/`, Prometheus (9090) + Grafana (3002)

## Commands
| Action | Command |
|---|---|
| Full stack up | `make up` |
| All tests | `make test` or `make test-e2e` |
| AI engine tests | `make test-ai` |
| Manual test run | `cd test-integration && docker compose -f docker-compose.test.yml up -d && pytest tests/ -v --tb=short` |
| Lint | `make lint` (`npm run lint` in frontend & gateway) |
| Format | `make format` (prettier for TS/JS, black for Python) |
| Type-check | `make typecheck` (`tsc --noEmit` in frontend) |
| Frontend dev | `cd frontend && npm run dev` |
| Seed data | `make seed` |
| DB / Redis shell | `make db-shell` / `make redis-shell` |

## Project layout
- `backend/` — 8 Node.js microservices, each with own `package.json` and Dockerfile
- `services/` — 14 Python microservices (12 AI engines + signal fusion + dexter engine), each with `app.py` + `requirements.txt`
- `frontend/` — Next.js app (`app/` App Router, `src/components/`, `src/hooks/`, `src/store/`)
- `test-integration/` — pytest suite (unit + integration + load), `docker-compose.test.yml`
- `database/schemas/` — SQL migrations
- `docker/nginx/` — reverse proxy config

## Testing notes
- Integration tests require Docker test services up first (separate ports: 5433/6380/8001)
- `pytest.ini`: `asyncio_mode = auto`, 30s timeout, coverage → `test-results/`
- Slow tests tagged `@pytest.mark.slow`; smoke tests `@pytest.mark.smoke`

## Code style
- Node.js: CommonJS, JSDoc, `const` by default
- Python: PEP 8, Google docstrings, type hints, async/await for I/O
- Frontend: TypeScript strict, interfaces over `any`, custom hooks
- Git: feature branches from `develop`, PR to `develop`, merge `develop` → `main` for releases
- No ESLint or Prettier config files found (uses defaults)

## Supported assets (8)
XAUUSD, NASDAQ, DXY, CRUDE OIL, BTCUSD, ETHUSD, EURUSD, GBPUSD
