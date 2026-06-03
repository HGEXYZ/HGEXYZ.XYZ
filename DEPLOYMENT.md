# AI Trading Platform - Deployment Guide

## Prerequisites
- Docker & Docker Compose v2
- Python 3.12+
- Node.js 20+
- Domain with DNS configured (for production)
- SSL certificates (for production)

## Quick Start (Development)

1. Clone and set up:
   ```bash
   git clone <repo>
   cd ai-trading-platform
   cp .env.example .env
   ```

2. Edit `.env` with your API keys:
   - `AI_API_KEY` - OpenAI/Anthropic API key
   - `SECRET_KEY` - Random 32+ char string
   - `STRIPE_SECRET_KEY` - Stripe keys for billing

3. Start everything:
   ```bash
   docker compose up -d --build
   docker compose exec -T postgres psql -U postgres -d trading_platform < database/migrations/001_initial.sql
   ```

4. Access:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs
   - Admin: admin@tradingplatform.com / admin123

## Production Deployment

### Docker Compose (Single Server)
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes
Deploy using manifests in `kubernetes/`:
```bash
kubectl apply -f kubernetes/
```

### Environment Variables (Production)
| Variable | Description | Required |
|---|---|---|
| SECRET_KEY | JWT signing secret | Yes |
| DATABASE_URL | PostgreSQL connection string | Yes |
| REDIS_URL | Redis connection string | Yes |
| AI_API_KEY | OpenAI/Anthropic API key | Yes |
| STRIPE_SECRET_KEY | Stripe secret for billing | No |
| SENTRY_DSN | Error tracking | No |

### SSL Configuration
Place certificates at `docker/nginx/ssl/`:
- `fullchain.pem`
- `privkey.pem`

### Monitoring
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002 (admin/admin)

### Scaling
- Backend: Increase workers in docker-compose or use `--workers` flag
- Database: Use managed TimescaleDB
- Redis: Use managed Redis (Upstash, Redis Labs)

## API Documentation
Full API docs available at `/docs` (Swagger) and `/redoc` (ReDoc) when DEBUG=true.

## Backup
```bash
docker compose exec postgres pg_dump -U postgres trading_platform > backup.sql
```

## Troubleshooting
- Check logs: `docker compose logs -f`
- Verify health: `curl http://localhost:8000/health`
- Reset DB: `docker compose down -v && docker compose up -d`
