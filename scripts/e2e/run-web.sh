#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

LOCAL_API_URL="http://127.0.0.1:55421"
LOCAL_DB_URL="postgresql://postgres:postgres@127.0.0.1:55422/postgres"
WEB_PORT="${E2E_WEB_PORT:-3100}"
SKIP_BACKEND=0
PLAYWRIGHT_ARGS=()

for arg in "$@"; do
  case "$arg" in
    --skip-backend-up)
      SKIP_BACKEND=1
      ;;
    *)
      PLAYWRIGHT_ARGS+=("$arg")
      ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[web-e2e] Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd curl
require_cmd lsof
require_cmd pnpm
require_cmd supabase

SUPABASE_DB_URL="${SUPABASE_DB_URL:-$LOCAL_DB_URL}"
if [[ "$SUPABASE_DB_URL" != "$LOCAL_DB_URL" ]]; then
  echo "[web-e2e] Refusing non-local database URL: $SUPABASE_DB_URL" >&2
  exit 1
fi

if [[ "$SKIP_BACKEND" -eq 0 ]]; then
  SUPABASE_DB_URL="$SUPABASE_DB_URL" bash scripts/e2e/backend-up.sh
fi

auth_env="$(supabase status -o env)"
# shellcheck disable=SC1090
source /dev/stdin <<<"$auth_env"

if [[ "${API_URL:-}" != "$LOCAL_API_URL" ]]; then
  echo "[web-e2e] Refusing non-local Supabase API URL: ${API_URL:-missing}" >&2
  exit 1
fi

echo "[web-e2e] Seeding deterministic web users and leagues..."
SUPABASE_URL="$API_URL" \
SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
DATABASE_URL="$SUPABASE_DB_URL" \
pnpm e2e:web:seed

if lsof -nP -iTCP:"$WEB_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[web-e2e] Port $WEB_PORT is already in use." >&2
  exit 1
fi

WEB_PID=""
cleanup() {
  if [[ -n "$WEB_PID" ]] && kill -0 "$WEB_PID" >/dev/null 2>&1; then
    kill "$WEB_PID" >/dev/null 2>&1 || true
    wait "$WEB_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "[web-e2e] Starting Next.js on http://127.0.0.1:${WEB_PORT}..."
# Resend validates its key at module import, before the no-send guard runs.
DATABASE_URL="$SUPABASE_DB_URL" \
DIRECT_URL="$SUPABASE_DB_URL" \
E2E_MODE=1 \
FUNTIME_DISABLE_EMAILS=1 \
NEXT_PUBLIC_E2E_MODE=1 \
NEXT_PUBLIC_SUPABASE_URL="$API_URL" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
RESEND_API_KEY="re_e2e_disabled" \
PORT="$WEB_PORT" \
pnpm --filter @funtime/web dev >/tmp/funtime-web-e2e.log 2>&1 &
WEB_PID="$!"

for _ in $(seq 1 90); do
  if curl -sf "http://127.0.0.1:${WEB_PORT}" >/dev/null; then
    break
  fi
  if ! kill -0 "$WEB_PID" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sf "http://127.0.0.1:${WEB_PORT}" >/dev/null; then
  echo "[web-e2e] Web server did not become ready. Recent log output:" >&2
  tail -n 100 /tmp/funtime-web-e2e.log >&2 || true
  exit 1
fi

echo "[web-e2e] Running Playwright..."
E2E_WEB_PORT="$WEB_PORT" pnpm e2e:web:test "${PLAYWRIGHT_ARGS[@]}"
