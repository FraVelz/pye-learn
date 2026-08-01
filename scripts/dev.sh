#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="${HOME}/.local/go/bin:${HOME}/go/bin:${PATH}"

cd "$ROOT"
docker compose up -d db
echo "Waiting for Postgres..."
until docker compose exec -T db pg_isready -U pye -d pye_learn >/dev/null 2>&1; do
  sleep 1
done
(cd apps/api && go run ./cmd/migrate && go run ./cmd/seed)
echo "DB ready. Run 'make api' and 'make web' in separate terminals."
