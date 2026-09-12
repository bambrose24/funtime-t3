#!/usr/bin/env bash
set -euo pipefail

mode="${1:-}"
since="${2:-1h}"
lines="${3:-50}"

if ! [[ "$lines" =~ ^[1-9][0-9]*$ ]] || (( lines > 500 )); then
  echo "lines must be an integer from 1 to 500" >&2
  exit 2
fi

export RAILWAY_CALLER="${RAILWAY_CALLER:-skill:funtime-observability@1.0.0}"
export RAILWAY_AGENT_SESSION="${RAILWAY_AGENT_SESSION:-funtime-observability}"

common=(--environment production --service web --since "$since" --lines "$lines" --json)

case "$mode" in
  runtime-errors)
    railway logs "${common[@]}" --filter "@level:error"
    ;;
  axiom-edge-errors)
    railway logs "${common[@]}" --filter "CompressionStream OR timeout OR Axiom"
    ;;
  http-errors)
    railway logs "${common[@]}" --http --status ">=400"
    ;;
  slow-http)
    railway logs "${common[@]}" --http --filter "@totalDuration:>=1000"
    ;;
  network-drops)
    railway logs "${common[@]}" --network --status dropped
    ;;
  *)
    echo "usage: $0 {runtime-errors|axiom-edge-errors|http-errors|slow-http|network-drops} [since] [lines]" >&2
    exit 2
    ;;
esac
