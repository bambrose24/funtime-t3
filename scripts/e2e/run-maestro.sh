#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

export PATH="$HOME/.maestro/bin:$PATH"
ANDROID_SDK_ROOT_DEFAULT="${HOME}/Library/Android/sdk"
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$ANDROID_SDK_ROOT_DEFAULT}}"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$PATH"
if [[ -d "/opt/homebrew/opt/openjdk@17/bin" ]]; then
  export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
fi

SUPABASE_DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:55422/postgres}"
SEASON="${FUNTIME_CURRENT_SEASON:-2025}"
REQUESTED_WEB_PORT="${E2E_WEB_PORT:-3000}"
REQUESTED_EXPO_PORT="${E2E_EXPO_PORT:-8081}"
FLOW_PATH="${E2E_MAESTRO_FLOW:-apps/mobile/e2e/flows/smoke-signup-create-pick.yaml}"
DESIRED_AVD="${E2E_ANDROID_AVD:-Pixel 9a}"
EMULATOR_WAIT_SECONDS="${E2E_EMULATOR_WAIT_SECONDS:-240}"
ANDROID_APP_ID="${E2E_ANDROID_APP_ID:-com.funtime.mobile}"
INSTALL_DEV_CLIENT="${E2E_INSTALL_DEV_CLIENT:-1}"
CLEAR_DEV_CLIENT_DATA="${E2E_CLEAR_DEV_CLIENT_DATA:-1}"
FORCE_REINSTALL_DEV_CLIENT="${E2E_FORCE_REINSTALL_DEV_CLIENT:-0}"
SKIP_BACKEND=0

for arg in "$@"; do
  case "$arg" in
    --skip-backend-up)
      SKIP_BACKEND=1
      ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[e2e] Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd maestro
require_cmd adb
require_cmd supabase
require_cmd curl
require_cmd pnpm
require_cmd lsof
require_cmd node
if ! java -version 2>&1 | head -n 1 | grep -Eq 'version "1[7-9]|version "[2-9][0-9]'; then
  echo "[e2e] Java 17+ is required by Maestro. Current: $(java -version 2>&1 | head -n 1)" >&2
  exit 1
fi

if [[ ! -f "$FLOW_PATH" ]]; then
  echo "[e2e] Maestro flow missing at $FLOW_PATH" >&2
  exit 1
fi

has_online_device() {
  adb devices | awk 'NR>1 && $2=="device" {found=1} END {exit found ? 0 : 1}'
}

app_installed() {
  adb shell pm list packages | tr -d '\r' | grep -q "^package:${ANDROID_APP_ID}$"
}

port_in_use() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

resolve_open_port() {
  local candidate="$1"
  local max_tries=30

  for _ in $(seq 1 "$max_tries"); do
    if ! port_in_use "$candidate"; then
      echo "$candidate"
      return 0
    fi
    candidate="$((candidate + 1))"
  done

  return 1
}

normalize_name() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]'
}

resolve_avd_name() {
  local desired="$1"
  local desired_normalized
  desired_normalized="$(normalize_name "$desired")"
  local avd
  local avds
  avds="$(emulator -list-avds | sed '/^\s*$/d')"

  if [[ -z "$avds" ]]; then
    echo "[e2e] No Android AVDs found. Create one in Android Studio Device Manager first." >&2
    return 1
  fi

  while IFS= read -r avd; do
    if [[ "$(normalize_name "$avd")" == "$desired_normalized" ]]; then
      echo "$avd"
      return 0
    fi
  done <<<"$avds"

  while IFS= read -r avd; do
    local normalized_avd
    normalized_avd="$(normalize_name "$avd")"
    if [[ "$normalized_avd" == *"$desired_normalized"* ]] || [[ "$desired_normalized" == *"$normalized_avd"* ]]; then
      echo "$avd"
      return 0
    fi
  done <<<"$avds"

  echo "[e2e] Could not match requested AVD '$desired'. Available AVDs:" >&2
  echo "$avds" >&2
  return 1
}

if ! has_online_device; then
  require_cmd emulator
  resolved_avd_name="$(resolve_avd_name "$DESIRED_AVD")"
  echo "[e2e] No running Android device detected. Starting emulator '$resolved_avd_name'..."
  nohup emulator -avd "$resolved_avd_name" -no-snapshot-load -no-boot-anim >/tmp/funtime-e2e-emulator.log 2>&1 &

  for _ in $(seq 1 "$EMULATOR_WAIT_SECONDS"); do
    if has_online_device; then
      break
    fi
    sleep 1
  done

  if ! has_online_device; then
    echo "[e2e] Emulator did not become available via adb within ${EMULATOR_WAIT_SECONDS}s." >&2
    echo "[e2e] Tail of /tmp/funtime-e2e-emulator.log:" >&2
    tail -n 80 /tmp/funtime-e2e-emulator.log >&2 || true
    exit 1
  fi

  adb wait-for-device >/dev/null 2>&1 || true
  for _ in $(seq 1 120); do
    if [[ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]; then
      break
    fi
    sleep 1
  done
fi

if ! app_installed || [[ "$FORCE_REINSTALL_DEV_CLIENT" == "1" ]]; then
  if [[ "$INSTALL_DEV_CLIENT" == "1" ]]; then
    if [[ "$FORCE_REINSTALL_DEV_CLIENT" == "1" ]]; then
      echo "[e2e] Forcing Android dev client reinstall (${ANDROID_APP_ID})..."
    else
      echo "[e2e] Android dev client '${ANDROID_APP_ID}' is not installed; installing..."
    fi
    E2E_ANDROID_APP_ID="$ANDROID_APP_ID" \
      E2E_FORCE_REINSTALL_DEV_CLIENT="$FORCE_REINSTALL_DEV_CLIENT" \
      bash scripts/e2e/install-dev-client.sh
  else
    echo "[e2e] Android dev client '${ANDROID_APP_ID}' is not installed." >&2
    echo "[e2e] Install it once with: pnpm e2e:mobile:install-dev-client" >&2
    echo "[e2e] Or set E2E_INSTALL_DEV_CLIENT=1 to auto-install in runner." >&2
    exit 1
  fi
fi

if [[ "$CLEAR_DEV_CLIENT_DATA" == "1" ]]; then
  echo "[e2e] Clearing Android dev client app data (${ANDROID_APP_ID})..."
  adb shell pm clear "$ANDROID_APP_ID" >/tmp/funtime-e2e-dev-client-clear.log 2>&1 || {
    echo "[e2e] Failed to clear app data for '${ANDROID_APP_ID}'." >&2
    tail -n 80 /tmp/funtime-e2e-dev-client-clear.log >&2 || true
    exit 1
  }
fi

if [[ "$SKIP_BACKEND" -eq 0 ]]; then
  bash scripts/e2e/backend-up.sh
fi

auth_env="$(supabase status -o env)"
# shellcheck disable=SC1090
source /dev/stdin <<<"$auth_env"

WEB_PORT="$(resolve_open_port "$REQUESTED_WEB_PORT")" || {
  echo "[e2e] Could not find an available web port starting from ${REQUESTED_WEB_PORT}." >&2
  exit 1
}
EXPO_PORT="$(resolve_open_port "$REQUESTED_EXPO_PORT")" || {
  echo "[e2e] Could not find an available Expo port starting from ${REQUESTED_EXPO_PORT}." >&2
  exit 1
}

if [[ "$WEB_PORT" != "$REQUESTED_WEB_PORT" ]]; then
  echo "[e2e] Requested web port ${REQUESTED_WEB_PORT} is busy, using ${WEB_PORT}."
fi
if [[ "$EXPO_PORT" != "$REQUESTED_EXPO_PORT" ]]; then
  echo "[e2e] Requested Expo port ${REQUESTED_EXPO_PORT} is busy, using ${EXPO_PORT}."
fi

WEB_PID=""
EXPO_PID=""
cleanup() {
  if [[ -n "$WEB_PID" ]] && kill -0 "$WEB_PID" >/dev/null 2>&1; then
    kill "$WEB_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$EXPO_PID" ]] && kill -0 "$EXPO_PID" >/dev/null 2>&1; then
    kill "$EXPO_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

MOBILE_SUPABASE_URL="${API_URL/127.0.0.1/10.0.2.2}"
MOBILE_SUPABASE_URL="${MOBILE_SUPABASE_URL/localhost/10.0.2.2}"
MOBILE_API_URL="http://10.0.2.2:${WEB_PORT}"
MOBILE_EXPO_URL="exp://10.0.2.2:${EXPO_PORT}"
MOBILE_EXPO_BOOT_URL="${MOBILE_EXPO_URL}"
MOBILE_EXPO_AUTH_URL="${MOBILE_EXPO_URL}/--/auth"
DEV_CLIENT_SCHEME="${E2E_DEV_CLIENT_SCHEME:-funtime}"
MOBILE_DEVCLIENT_URL="${DEV_CLIENT_SCHEME}://expo-development-client/?url=$(node -e 'console.log(encodeURIComponent(process.argv[1]))' "$MOBILE_EXPO_BOOT_URL")"
E2E_UNIQUE="$(date +%s)"
E2E_EMAIL="${E2E_EMAIL:-maestro.e2e+${E2E_UNIQUE}@example.com}"
E2E_USERNAME="${E2E_USERNAME:-maestrouser${E2E_UNIQUE}}"

echo "[e2e] Starting @funtime/web dev server for tRPC API access..."
DATABASE_URL="$SUPABASE_DB_URL" \
DIRECT_URL="$SUPABASE_DB_URL" \
FUNTIME_CURRENT_SEASON="$SEASON" \
E2E_MODE="${E2E_MODE:-1}" \
FUNTIME_DISABLE_EMAILS="${FUNTIME_DISABLE_EMAILS:-1}" \
NEXT_PUBLIC_CURRENT_SEASON="$SEASON" \
NEXT_PUBLIC_E2E_MODE="${NEXT_PUBLIC_E2E_MODE:-1}" \
NEXT_PUBLIC_SUPABASE_URL="$API_URL" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
PORT="$WEB_PORT" \
pnpm --filter @funtime/web dev >/tmp/funtime-e2e-web.log 2>&1 &
WEB_PID="$!"

echo "[e2e] Waiting for web server on http://127.0.0.1:${WEB_PORT}..."
for _ in $(seq 1 90); do
  if curl -sf "http://127.0.0.1:${WEB_PORT}" >/dev/null; then
    break
  fi
  sleep 1

done

if ! curl -sf "http://127.0.0.1:${WEB_PORT}" >/dev/null; then
  echo "[e2e] Web server did not become ready. Tail of /tmp/funtime-e2e-web.log:" >&2
  tail -n 80 /tmp/funtime-e2e-web.log >&2 || true
  exit 1
fi

echo "[e2e] Starting Expo mobile app..."
EXPO_PUBLIC_SUPABASE_URL="$MOBILE_SUPABASE_URL" \
EXPO_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
EXPO_PUBLIC_API_URL="$MOBILE_API_URL" \
EXPO_PUBLIC_CURRENT_SEASON="$SEASON" \
EXPO_PUBLIC_E2E_MODE="${EXPO_PUBLIC_E2E_MODE:-1}" \
pnpm --filter @funtime/mobile start --dev-client --port "$EXPO_PORT" >/tmp/funtime-e2e-expo.log 2>&1 &
EXPO_PID="$!"

for _ in $(seq 1 180); do
  if lsof -nP -iTCP:"$EXPO_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! lsof -nP -iTCP:"$EXPO_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[e2e] Expo dev server did not start on port ${EXPO_PORT}." >&2
  echo "[e2e] Tail of /tmp/funtime-e2e-expo.log:" >&2
  tail -n 120 /tmp/funtime-e2e-expo.log >&2 || true
  exit 1
fi

if ! curl -sf "http://127.0.0.1:${EXPO_PORT}/status" | grep -q "packager-status:running"; then
  echo "[e2e] Metro health check failed on http://127.0.0.1:${EXPO_PORT}/status." >&2
  echo "[e2e] Tail of /tmp/funtime-e2e-expo.log:" >&2
  tail -n 120 /tmp/funtime-e2e-expo.log >&2 || true
  exit 1
fi

echo "[e2e] Metro is healthy on port ${EXPO_PORT}."
echo "[e2e] Boot link: ${MOBILE_DEVCLIENT_URL}"

echo "[e2e] Opening app in Android dev client (${ANDROID_APP_ID})..."
launch_via_link() {
  if adb shell am start -W -a android.intent.action.VIEW -d "$MOBILE_DEVCLIENT_URL" "$ANDROID_APP_ID" >/tmp/funtime-e2e-open-link.log 2>&1; then
    return 0
  fi
  # Fallback: let Android resolve app for the deep link if package targeting fails.
  adb shell am start -W -a android.intent.action.VIEW -d "$MOBILE_DEVCLIENT_URL" >/tmp/funtime-e2e-open-link.log 2>&1
}

launch_ok=0
for _ in $(seq 1 6); do
  if launch_via_link; then
    launch_ok=1
    break
  fi
  sleep 2
done

if [[ "$launch_ok" -ne 1 ]]; then
  echo "[e2e] Failed to open app deep link '${MOBILE_DEVCLIENT_URL}'." >&2
  echo "[e2e] Tail of /tmp/funtime-e2e-open-link.log:" >&2
  tail -n 80 /tmp/funtime-e2e-open-link.log >&2 || true
  exit 1
fi

for _ in $(seq 1 180); do
  if adb shell pidof "$ANDROID_APP_ID" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! adb shell pidof "$ANDROID_APP_ID" >/dev/null 2>&1; then
  echo "[e2e] Android app '${ANDROID_APP_ID}' did not launch after deep-link open." >&2
  echo "[e2e] Tail of /tmp/funtime-e2e-expo.log:" >&2
  tail -n 120 /tmp/funtime-e2e-expo.log >&2 || true
  exit 1
fi

echo "[e2e] Running Maestro flow ${FLOW_PATH}"
maestro test "$FLOW_PATH" \
  -e E2E_EMAIL="$E2E_EMAIL" \
  -e E2E_USERNAME="$E2E_USERNAME" \
  -e E2E_APP_BOOT_URL="$MOBILE_DEVCLIENT_URL" \
  -e E2E_EXPO_AUTH_URL="$MOBILE_EXPO_AUTH_URL" \
  -e E2E_DEV_SERVER_URL="http://10.0.2.2:${EXPO_PORT}" \
  -e E2E_ANDROID_APP_ID="$ANDROID_APP_ID"

echo "[e2e] Maestro flow completed."
