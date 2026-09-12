#!/usr/bin/env bash
set -euo pipefail

export RAILWAY_CALLER="${RAILWAY_CALLER:-skill:funtime-observability@1.0.0}"
export RAILWAY_AGENT_SESSION="${RAILWAY_AGENT_SESSION:-funtime-observability}"

posthog_project="$(pnpm exec posthog-cli api call project-get '{}')"
project_id="$(printf '%s\n' "$posthog_project" | awk -F': ' '/^id: / { print $2; exit }')"
project_name="$(printf '%s\n' "$posthog_project" | awk -F': ' '/^name: / { sub(/^name: /, ""); print; exit }')"
posthog_token="$(printf '%s\n' "$posthog_project" | awk -F': ' '/^api_token: / { print $2; exit }' | tr -d '"')"
production_token="$(railway variables --environment production --service web --json | jq -r '.NEXT_PUBLIC_POSTHOG_KEY // empty')"

if [[ -z "$posthog_token" || -z "$production_token" ]]; then
  echo "Unable to read both project tokens; check PostHog auth and Railway production variables." >&2
  exit 1
fi

if [[ "$posthog_token" == "$production_token" ]]; then
  echo "MATCH: PostHog CLI project '$project_name' (ID $project_id) owns production's project token."
else
  echo "MISMATCH: PostHog CLI project '$project_name' (ID $project_id) does not own production's project token."
  exit 3
fi
