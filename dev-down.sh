#!/usr/bin/env bash
set -euo pipefail

BACKEND_PID_FILE="/tmp/fleetpulse-backend.pid"
FRONTEND_PID_FILE="/tmp/fleetpulse-frontend.pid"

stopped=0

if [[ -f "$BACKEND_PID_FILE" ]]; then
  PID=$(cat "$BACKEND_PID_FILE")
  if kill "$PID" 2>/dev/null; then
    echo "Stopped backend (PID $PID)"
    stopped=$((stopped + 1))
  fi
  rm -f "$BACKEND_PID_FILE"
fi

if [[ -f "$FRONTEND_PID_FILE" ]]; then
  PID=$(cat "$FRONTEND_PID_FILE")
  if kill "$PID" 2>/dev/null; then
    echo "Stopped frontend (PID $PID)"
    stopped=$((stopped + 1))
  fi
  rm -f "$FRONTEND_PID_FILE"
fi

if [[ $stopped -eq 0 ]]; then
  echo "No FleetPulse dev processes found."
else
  echo "FleetPulse dev servers stopped."
fi
