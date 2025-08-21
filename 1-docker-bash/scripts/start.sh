#!/usr/bin/env bash
set -euo pipefail

docker compose up -d --build

echo "Frontend: http://localhost:5173"
echo "Backend : http://localhost:8000"
echo "MySQL   : 127.0.0.1:3306 user=user pwd=user db=MovieApp"
