#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
umask 077
mkdir -p backups
target="backups/matchup-$(date -u +%Y%m%dT%H%M%SZ).sql"
docker compose exec -T db sh -c 'export MYSQL_PWD="$(cat /run/secrets/db_root_password)"; exec mariadb-dump -uroot --single-transaction --routines --triggers matchup' > "$target.partial"
mv "$target.partial" "$target"
echo "Backup: $target"
