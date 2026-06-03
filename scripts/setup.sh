#!/bin/bash
set -e

echo "=== AI Trading Platform Setup ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }

# Setup environment
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example - please update with your secrets"
fi

# Install dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start services
echo "Starting Docker services..."
docker compose up -d --build

echo "Running database migrations..."
docker compose exec -T postgres psql -U postgres -d trading_platform < database/migrations/001_initial.sql

echo "Seeding database..."
docker compose exec -T postgres psql -U postgres -d trading_platform < database/seeds/seed_data.sql

echo ""
echo "=== Setup Complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Admin: admin@tradingplatform.com / admin123"
echo "Demo: demo@tradingplatform.com / demo123"
