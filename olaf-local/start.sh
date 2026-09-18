#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker fehlt in WSL. Docker Desktop starten und unter Settings > Resources > WSL Integration diese Distribution aktivieren."
  exit 1
fi
docker compose up -d --build
echo "Olaf Matchups: http://localhost:${OLAF_PORT:-8080}"
