#!/bin/bash
set -e
echo "=== Reunify AI Setup ==="

echo "[1/4] Setting up backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
echo "  Backend ready. Edit backend/.env with your MONGODB_URL"

echo "[2/4] Seeding demo data..."
python seed_data.py || echo "  Skipping seed (MongoDB may not be running yet)"

cd ..
echo "[3/4] Setting up frontend..."
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
cd ..

echo "[4/4] Done!"
echo ""
echo "Start backend:  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "Start frontend: cd frontend && npm run dev"
echo "Seed data:      cd backend && python seed_data.py"
echo "Docker:         cd docker && docker-compose up --build"
