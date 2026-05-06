#!/bin/zsh

set -e

MODE="${1:---foreground}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_URL="http://127.0.0.1:5173/"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/focus-projects.log"
PID_FILE="$LOG_DIR/focus-projects.pid"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

cd "$PROJECT_DIR"

pause_if_foreground() {
  if [ "$MODE" = "--foreground" ]; then
    read "?Press Enter to close this window."
  fi
}

fail() {
  echo "$1"
  pause_if_foreground
  exit 1
}

page_html() {
  if ! command -v curl >/dev/null 2>&1; then
    return 1
  fi

  curl -fsS --max-time 2 "$APP_URL" 2>/dev/null || true
}

is_focus_projects_running() {
  local html
  html="$(page_html)"
  [ -n "$html" ] && echo "$html" | grep -q "Focus Projects"
}

open_app_url() {
  local focus_result
  if [ -f "$PROJECT_DIR/scripts/focus-existing-tab.js" ]; then
    focus_result="$(zsh "$PROJECT_DIR/scripts/focus-existing-tab.js" "$APP_URL" 2>/dev/null || true)"
    if [ "$focus_result" = "focused" ]; then
      return 0
    fi
  fi

  if open -b com.openai.atlas.web "$APP_URL" >/dev/null 2>&1; then
    return 0
  fi

  if open -a Safari "$APP_URL" >/dev/null 2>&1; then
    return 0
  fi

  open "$APP_URL" >/dev/null 2>&1 || true
}

assert_port_available() {
  if is_focus_projects_running; then
    echo "Focus Projects is already running at $APP_URL"
    open_app_url
    exit 0
  fi

  if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:5173 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port 5173 is already occupied, but it did not respond as Focus Projects."
    echo "Please stop the process using 5173, then run this launcher again."
    echo
    lsof -nP -iTCP:5173 -sTCP:LISTEN
    pause_if_foreground
    exit 1
  fi
}

ensure_dependencies() {
  if ! command -v npm >/dev/null 2>&1; then
    fail "npm was not found. Please install Node.js from https://nodejs.org/ and try again."
  fi

  if [ ! -d "node_modules" ]; then
    echo "Dependencies are missing. Running npm install first..."
    npm install
  fi
}

wait_until_ready() {
  local attempts=0
  while [ "$attempts" -lt 40 ]; do
    if is_focus_projects_running; then
      return 0
    fi
    attempts=$((attempts + 1))
    sleep 0.5
  done

  return 1
}

start_background() {
  mkdir -p "$LOG_DIR"
  echo "Starting Focus Projects at $(date)" >> "$LOG_FILE"
  nohup npm run dev > "$LOG_FILE" 2>&1 < /dev/null &
  echo "$!" > "$PID_FILE"

  if wait_until_ready; then
    open_app_url
    exit 0
  fi

  echo "Focus Projects did not become ready at $APP_URL."
  echo "Check the log file: $LOG_FILE"
  exit 1
}

start_foreground() {
  echo "Starting Focus Projects..."
  echo "Project directory: $PROJECT_DIR"
  echo "Opening local app in your browser..."
  npm run dev:open
}

case "$MODE" in
  --foreground | --background)
    ;;
  *)
    fail "Unknown launch mode: $MODE"
    ;;
esac

ensure_dependencies
assert_port_available

if [ "$MODE" = "--background" ]; then
  start_background
else
  start_foreground
fi
