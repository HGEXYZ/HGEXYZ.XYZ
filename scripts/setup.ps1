Write-Host "=== AI Trading Platform Setup ===" -ForegroundColor Cyan

# Check prerequisites
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Write-Host "Docker is required" -ForegroundColor Red; exit 1 }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { Write-Host "Python 3 is required" -ForegroundColor Red; exit 1 }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Host "Node.js is required" -ForegroundColor Red; exit 1 }

# Setup environment
if (-not (Test-Path .env)) { Copy-Item .env.example .env; Write-Host "Created .env from .env.example" -ForegroundColor Yellow }

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend; pip install -r requirements.txt; Set-Location ..

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend; npm install; Set-Location ..

Write-Host "Starting Docker services..." -ForegroundColor Cyan
docker compose up -d --build

Write-Host "Running migrations..." -ForegroundColor Cyan
docker compose exec -T postgres psql -U postgres -d trading_platform -f /docker-entrypoint-initdb.d/001_initial.sql

Write-Host "Seeding database..." -ForegroundColor Cyan
docker compose exec -T postgres psql -U postgres -d trading_platform -f /seeds/seed_data.sql 2>$null

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Admin: admin@tradingplatform.com / admin123" -ForegroundColor Green
Write-Host "Demo: demo@tradingplatform.com / demo123" -ForegroundColor Green
