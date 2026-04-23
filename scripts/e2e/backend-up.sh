#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

SUPABASE_DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:55422/postgres}"
SEASON="${FUNTIME_CURRENT_SEASON:-2025}"
START_WEB=0

if [[ "${1:-}" == "--start-web" ]]; then
  START_WEB=1
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[e2e] Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd supabase
require_cmd psql
require_cmd pnpm
require_cmd node

if [[ ! -f "supabase/config.toml" ]]; then
  echo "[e2e] Missing supabase/config.toml. Run from repository root." >&2
  exit 1
fi

if [[ ! -f "supabase/seed.sql" ]]; then
  echo "[e2e] Missing supabase/seed.sql. Building from default fixture..."
  pnpm e2e:fixtures:build-seed
fi

echo "[e2e] Starting local Supabase stack..."
supabase start

echo "[e2e] Resetting local Supabase database (schema only)..."
supabase db reset --local --no-seed

echo "[e2e] Applying Prisma migrations to local Supabase DB..."
(
  cd packages/api
  DATABASE_URL="$SUPABASE_DB_URL" DIRECT_URL="$SUPABASE_DB_URL" pnpm exec prisma migrate deploy --schema prisma/schema.prisma
)

echo "[e2e] Applying deterministic schedule seed..."
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql >/dev/null

echo "[e2e] Running seed/pickability verification..."
DATABASE_URL="$SUPABASE_DB_URL" FUNTIME_CURRENT_SEASON="$SEASON" pnpm e2e:seed:verify

echo "[e2e] Local backend is ready."

auth_env="$(supabase status -o env)"
# shellcheck disable=SC1090
source /dev/stdin <<<"$auth_env"

echo "[e2e] API_URL=$API_URL"

echo "[e2e] To start web/API against this stack:"
echo "[e2e] DATABASE_URL=$SUPABASE_DB_URL DIRECT_URL=$SUPABASE_DB_URL NEXT_PUBLIC_SUPABASE_URL=$API_URL NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key> FUNTIME_CURRENT_SEASON=$SEASON NEXT_PUBLIC_CURRENT_SEASON=$SEASON pnpm --filter @funtime/web dev"

if [[ "$START_WEB" -eq 1 ]]; then
  echo "[e2e] Starting @funtime/web dev server..."
  DATABASE_URL="$SUPABASE_DB_URL" \
  DIRECT_URL="$SUPABASE_DB_URL" \
  FUNTIME_CURRENT_SEASON="$SEASON" \
  NEXT_PUBLIC_CURRENT_SEASON="$SEASON" \
  NEXT_PUBLIC_SUPABASE_URL="$API_URL" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
  pnpm --filter @funtime/web dev
fi
