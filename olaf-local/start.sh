#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker fehlt in WSL. Docker Desktop starten und unter Settings > Resources > WSL Integration diese Distribution aktivieren."
  exit 1
fi
docker run --rm --user "$(id -u):$(id -g)" -v "$(pwd):/app" -w /app node:24-alpine node scripts/init-config.mjs
docker compose up -d --build --wait
echo "Olaf Matchups: http://localhost:${OLAF_PORT:-8080}"
