#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

ANDROID_APP_ID="${E2E_ANDROID_APP_ID:-com.funtime.mobile}"
BUILD_VARIANT="${E2E_ANDROID_BUILD_VARIANT:-debug}"
FORCE_REINSTALL="${E2E_FORCE_REINSTALL_DEV_CLIENT:-0}"
ANDROID_SDK_ROOT_DEFAULT="${HOME}/Library/Android/sdk"
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$ANDROID_SDK_ROOT_DEFAULT}}"
export ANDROID_SDK_ROOT
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$PATH"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[e2e] Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd adb
require_cmd pnpm

if [[ ! -d "$ANDROID_SDK_ROOT" ]]; then
  echo "[e2e] Android SDK not found at '$ANDROID_SDK_ROOT'." >&2
  echo "[e2e] Set ANDROID_SDK_ROOT or ANDROID_HOME to your SDK path." >&2
  exit 1
fi

configure_java17() {
  local java_home_17=""
  if [[ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]]; then
    java_home_17="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
  elif [[ -d "/opt/homebrew/opt/openjdk@17" ]]; then
    java_home_17="/opt/homebrew/opt/openjdk@17"
  elif command -v /usr/libexec/java_home >/dev/null 2>&1; then
    # java_home can return a lower version when exact 17 is unavailable; validate major below.
    java_home_17="$(/usr/libexec/java_home -v 17 2>/dev/null || true)"
  fi
  if [[ -z "$java_home_17" ]]; then
    echo "[e2e] Unable to locate JDK 17. Install Java 17 before building Android dev client." >&2
    exit 1
  fi
  export JAVA_HOME="$java_home_17"
  export PATH="$JAVA_HOME/bin:$PATH"
  if ! java -version 2>&1 | head -n 1 | grep -Eq 'version "1[7-9]|version "[2-9][0-9]'; then
    echo "[e2e] JAVA_HOME is not Java 17+: $JAVA_HOME" >&2
    java -version 2>&1 | head -n 2 >&2 || true
    exit 1
  fi
}

configure_gradle_java_home() {
  local gradle_props="apps/mobile/android/gradle.properties"
  local tmp_file
  if [[ ! -f "$gradle_props" ]]; then
    return
  fi

  tmp_file="$(mktemp)"
  awk -v jh="$JAVA_HOME" '
    BEGIN { replaced=0 }
    /^org\.gradle\.java\.home=/ { print "org.gradle.java.home=" jh; replaced=1; next }
    { print }
    END { if (!replaced) print "org.gradle.java.home=" jh }
  ' "$gradle_props" >"$tmp_file"
  mv "$tmp_file" "$gradle_props"
}

configure_local_properties() {
  local android_dir="apps/mobile/android"
  local local_props="${android_dir}/local.properties"
  local escaped_sdk_root

  if [[ ! -d "$android_dir" ]]; then
    return
  fi

  escaped_sdk_root="${ANDROID_SDK_ROOT//\\/\\\\}"
  escaped_sdk_root="${escaped_sdk_root//:/\\:}"
  printf "sdk.dir=%s\n" "$escaped_sdk_root" >"$local_props"
}

android_project_matches_app_id() {
  local gradle_file="apps/mobile/android/app/build.gradle"
  [[ -f "$gradle_file" ]] && grep -q "applicationId \"${ANDROID_APP_ID}\"" "$gradle_file"
}

configure_java17
echo "[e2e] Using JAVA_HOME=$JAVA_HOME"
java -version 2>&1 | head -n 1

has_online_device() {
  adb devices | awk 'NR>1 && $2=="device" {found=1} END {exit found ? 0 : 1}'
}

is_installed() {
  adb shell pm list packages | tr -d '\r' | grep -q "^package:${ANDROID_APP_ID}$"
}

if ! has_online_device; then
  echo "[e2e] No running Android device detected. Start an emulator before installing the dev client." >&2
  exit 1
fi

if is_installed; then
  if [[ "$FORCE_REINSTALL" == "1" ]]; then
    echo "[e2e] Forcing reinstall of Android dev client (${ANDROID_APP_ID})..."
    adb uninstall "$ANDROID_APP_ID" >/tmp/funtime-e2e-dev-client-uninstall.log 2>&1 || true
  else
    echo "[e2e] Android dev client already installed (${ANDROID_APP_ID})."
    exit 0
  fi
fi

if ! android_project_matches_app_id; then
  echo "[e2e] Regenerating Android native project for app id '${ANDROID_APP_ID}'..."
  CI=1 pnpm --filter @funtime/mobile exec expo prebuild --platform android --clean --no-install \
    >/tmp/funtime-e2e-dev-client-prebuild.log 2>&1 || {
    echo "[e2e] Android prebuild failed. Tail of /tmp/funtime-e2e-dev-client-prebuild.log:" >&2
    tail -n 120 /tmp/funtime-e2e-dev-client-prebuild.log >&2 || true
    exit 1
  }
fi

configure_gradle_java_home
configure_local_properties

echo "[e2e] Installing Android dev client (${ANDROID_APP_ID})..."
echo "[e2e] This may take several minutes the first time."
CI=1 pnpm --filter @funtime/mobile exec expo run:android --variant "$BUILD_VARIANT" --app-id "$ANDROID_APP_ID" --no-bundler --no-install \
  >/tmp/funtime-e2e-dev-client-build.log 2>&1 || {
  echo "[e2e] Dev client install failed. Tail of /tmp/funtime-e2e-dev-client-build.log:" >&2
  tail -n 120 /tmp/funtime-e2e-dev-client-build.log >&2 || true
  exit 1
}

if ! is_installed; then
  echo "[e2e] Dev client install command finished, but package '${ANDROID_APP_ID}' is not on the device." >&2
  echo "[e2e] Tail of /tmp/funtime-e2e-dev-client-build.log:" >&2
  tail -n 120 /tmp/funtime-e2e-dev-client-build.log >&2 || true
  exit 1
fi

echo "[e2e] Dev client installed (${ANDROID_APP_ID})."
